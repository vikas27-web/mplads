import asyncio
import json
import argparse
from pathlib import Path
from datetime import date, datetime
from typing import Dict, Any, List

from backend.app.core.database import engine, Base, async_session_factory, init_db
from backend.app.models import (
    Project,
    Agency,
    FinancialSummary,
    ProgressRecord,
    Anomaly,
    RiskAssessment,
    AuditLog,
)
from backend.app.validation.validator import MPLADValidator, parse_date_safe
from .generator import SyntheticMPLADSGenerator, DATA_DISCLAIMER
from .archetypes import AnomalyArchetype


async def seed_database(count: int = 600, output_file: str = "data/demo_mplads.json") -> Dict[str, Any]:
    """
    Generate synthetic MPLADS dataset, validate records, and seed the relational database.
    """
    print(f"[*] Initializing database schema...")
    await init_db()

    print(f"[*] Generating {count} synthetic MPLADS project records ({DATA_DISCLAIMER})...")
    generator = SyntheticMPLADSGenerator(seed=2026)
    records = generator.generate_dataset(total_count=count)

    # Save to JSON file for reproducibility and inspection
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, default=str)
    print(f"[+] Saved {len(records)} records to {output_path}")

    # Track archetype statistics
    archetype_counts: Dict[str, int] = {}
    validation_summary = {
        "total_records": len(records),
        "valid_records": 0,
        "records_with_warnings": 0,
        "critical_error_records": 0,
        "avg_data_quality_score": 0.0,
    }

    total_dq_score = 0.0

    async with async_session_factory() as session:
        # Agency cache to prevent duplicate agency creation
        agencies_map: Dict[str, Agency] = {}

        for rec in records:
            archetype = rec.get("archetype", AnomalyArchetype.NORMAL.value)
            archetype_counts[archetype] = archetype_counts.get(archetype, 0) + 1

            # 1. Validate record using MPLADValidator
            val_res = MPLADValidator.validate_record(rec)
            total_dq_score += val_res.data_quality_score

            if val_res.is_valid:
                validation_summary["valid_records"] += 1
            if val_res.has_warnings:
                validation_summary["records_with_warnings"] += 1
            if val_res.has_critical_errors:
                validation_summary["critical_error_records"] += 1

            # 2. Get or Create Agency
            agency_code = rec.get("agency_id", "AGY-UNKNOWN")
            if agency_code not in agencies_map:
                agency = Agency(
                    code=agency_code,
                    name=rec.get("agency_name", "District Implementing Agency"),
                    agency_type=rec.get("agency_type", "Line Department"),
                    state=rec["state"],
                    district=rec["district"],
                )
                session.add(agency)
                await session.flush()
                agencies_map[agency_code] = agency
            else:
                agency = agencies_map[agency_code]

            # 3. Create Project Record
            # Sanitize dates safely
            sanction_dt = parse_date_safe(rec.get("sanction_date")) or date(2025, 1, 1)
            exp_comp_dt = parse_date_safe(rec.get("expected_completion_date"))
            act_comp_dt = parse_date_safe(rec.get("actual_completion_date"))

            proj = Project(
                project_code=rec["project_code"],
                title=rec["title"],
                description=rec.get("description"),
                state=rec["state"],
                district=rec["district"],
                constituency=rec["constituency"],
                block_or_taluk=rec.get("block_or_taluk"),
                village_or_ward=rec.get("village_or_ward"),
                latitude=rec.get("latitude"),
                longitude=rec.get("longitude"),
                mp_name=rec["mp_name"],
                mp_house=rec.get("mp_house", "Lok Sabha"),
                sector=rec["sector"],
                status=rec.get("status", "SANCTIONED"),
                sanction_date=sanction_dt,
                expected_completion_date=exp_comp_dt,
                actual_completion_date=act_comp_dt,
                agency_id=agency.id,
            )
            session.add(proj)
            await session.flush()

            # 4. Create Financial Summary
            # Handle potential non-numeric or negative values from DATA_INCONSISTENT archetype safely
            try:
                sanc_amt = float(rec.get("sanctioned_amount", 0.0))
            except (ValueError, TypeError):
                sanc_amt = 0.0
            try:
                rel_amt = float(rec.get("released_amount", 0.0))
            except (ValueError, TypeError):
                rel_amt = 0.0
            try:
                exp_amt = float(rec.get("expenditure_amount", 0.0))
            except (ValueError, TypeError):
                exp_amt = 0.0

            fin = FinancialSummary(
                project_id=proj.id,
                sanctioned_amount=sanc_amt,
                released_amount=rel_amt,
                expenditure_amount=exp_amt,
                unspent_balance=rec.get("unspent_balance", 0.0),
                financial_progress_pct=rec.get("financial_progress_pct", 0.0),
                output_unit=rec.get("output_unit"),
                physical_quantity=rec.get("physical_quantity"),
                cost_per_unit=rec.get("cost_per_unit"),
                voucher_count=max(1, int(exp_amt / 100000)) if exp_amt > 0 else 0,
            )
            session.add(fin)

            # 5. Create Progress Record
            phys_prog = rec.get("physical_progress_pct")
            try:
                phys_prog_val = float(phys_prog) if phys_prog is not None else 0.0
            except (ValueError, TypeError):
                phys_prog_val = 0.0

            prog = ProgressRecord(
                project_id=proj.id,
                record_date=sanction_dt,
                physical_progress_pct=phys_prog_val,
                stage_name="Initial Milestone / Execution Assessment",
                remarks=f"Generated status for archetype: {archetype}",
                is_verified_on_site="VERIFIED" if archetype == AnomalyArchetype.NORMAL.value else "UNVERIFIED",
            )
            session.add(prog)

            # 6. Create Preliminary RiskAssessment baseline
            # In Phase 2 the dedicated ML engines will calculate exact calibrated scores.
            # Here in Phase 1, we initialize baseline risk & confidence derived from validation & archetypes.
            raw_risk = 15.0  # Normal baseline
            contributing = []
            if archetype == AnomalyArchetype.COST_OUTLIER.value:
                raw_risk = 82.0
                contributing.append("Elevated unit cost anomaly: 320% above sector median benchmark")
            elif archetype == AnomalyArchetype.HIGH_SPEND_LOW_PROGRESS.value:
                raw_risk = 88.0
                contributing.append("Discrepancy: >90% funds expended with physical progress <20%")
            elif archetype == AnomalyArchetype.DELAYED_PROJECT.value:
                raw_risk = 74.0
                contributing.append("Execution delay: Project stalled >24 months past completion deadline")
            elif archetype == AnomalyArchetype.DUPLICATE_PAIR.value:
                raw_risk = 78.0
                contributing.append("Potential duplicate: Matching scope and coordinates with overlapping timeframe")
            elif archetype == AnomalyArchetype.AGENCY_MONOPOLY.value:
                raw_risk = 70.0
                contributing.append("Agency pattern: Single contractor concentration in district sector")
            elif archetype == AnomalyArchetype.DATA_INCONSISTENT.value:
                raw_risk = 65.0
                contributing.append("Data anomaly: Chronological or disbursement paradox")

            # Apply data quality penalty directly to confidence score
            base_confidence = 95.0
            confidence = max(20.0, base_confidence - val_res.confidence_penalty_total)

            risk_level = "HIGH" if raw_risk >= 70.0 else ("MODERATE" if raw_risk >= 40.0 else "LOW")

            risk_eval = RiskAssessment(
                project_id=proj.id,
                risk_score=raw_risk,
                confidence_score=confidence,
                data_quality_score=val_res.data_quality_score,
                risk_level=risk_level,
                cost_risk=raw_risk if archetype == AnomalyArchetype.COST_OUTLIER.value else 10.0,
                financial_risk=raw_risk if archetype == AnomalyArchetype.HIGH_SPEND_LOW_PROGRESS.value else 10.0,
                delay_risk=raw_risk if archetype == AnomalyArchetype.DELAYED_PROJECT.value else 10.0,
                duplicate_risk=raw_risk if archetype == AnomalyArchetype.DUPLICATE_PAIR.value else 5.0,
                agency_risk=raw_risk if archetype == AnomalyArchetype.AGENCY_MONOPOLY.value else 10.0,
                contributing_factors=contributing,
                data_quality_issues=[f"{iss.rule_id}: {iss.message}" for iss in val_res.issues],
            )
            session.add(risk_eval)

            # 7. Record Preliminary Anomaly Evidence if anomalous
            if archetype != AnomalyArchetype.NORMAL.value and contributing:
                anomaly_rec = Anomaly(
                    project_id=proj.id,
                    engine_type="COST" if "cost" in archetype.lower() else ("FINANCIAL" if "spend" in archetype.lower() else "DELAY"),
                    anomaly_code=f"ARCHETYPE_{archetype}",
                    severity="HIGH" if raw_risk >= 75.0 else "MEDIUM",
                    anomaly_score=raw_risk,
                    title=f"Anomaly Detected ({archetype})",
                    description=contributing[0],
                    baseline_value="Standard Sector Benchmark",
                    observed_value=str(rec.get("cost_per_unit", "N/A")),
                    metrics_json={"archetype": archetype, "dq_issues": len(val_res.issues)},
                )
                session.add(anomaly_rec)

            # 8. Audit Log
            log = AuditLog(
                action_type="DEMO_DATA_SEEDED",
                entity_type="PROJECT",
                entity_id=proj.id,
                project_id=proj.id,
                details=f"Project record {proj.project_code} ingested into Sentinel demo repository (Archetype: {archetype}).",
            )
            session.add(log)

        await session.commit()

    validation_summary["avg_data_quality_score"] = round(total_dq_score / len(records), 2)

    result = {
        "status": "SUCCESS",
        "total_seeded": len(records),
        "archetype_counts": archetype_counts,
        "validation_summary": validation_summary,
        "output_file": str(output_path),
    }
    return result


def main():
    parser = argparse.ArgumentParser(description="Seed MPLAD Sentinel Demo Dataset")
    parser.add_argument("--count", type=int, default=600, help="Number of records to generate (min 500)")
    parser.add_argument("--output", type=str, default="data/demo_mplads.json", help="Output JSON path")
    args = parser.parse_args()

    res = asyncio.run(seed_database(count=args.count, output_file=args.output))
    print("\n" + "="*50)
    print("SEEDING COMPLETE — SUMMARY")
    print("="*50)
    print(f"Total Projects Seeded: {res['total_seeded']}")
    print("\nArchetype Breakdown:")
    for arch, cnt in res["archetype_counts"].items():
        print(f"  - {arch:26}: {cnt:4d} ({round(cnt/res['total_seeded']*100, 1)}%)")
    print("\nData Quality & Validation:")
    print(f"  - Valid Records (No Critical Errors): {res['validation_summary']['valid_records']}")
    print(f"  - Records With Quality Warnings      : {res['validation_summary']['records_with_warnings']}")
    print(f"  - Critical Inconsistent Records      : {res['validation_summary']['critical_error_records']}")
    print(f"  - Average Data Quality Score        : {res['validation_summary']['avg_data_quality_score']} / 100")
    print("="*50)


if __name__ == "__main__":
    main()
