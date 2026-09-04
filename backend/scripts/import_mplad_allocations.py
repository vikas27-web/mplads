"""
MPLAD Sentinel — Real MPLAD Allocation Reference Dataset Importer
Imports the official 'Allocated Limit for Hon'ble MPs' dataset (543 MP records)
into the independent 'mplad_allocations' reference table.
"""

import os
import sys
import csv
import re
import argparse
import asyncio
from pathlib import Path
from datetime import datetime, timezone

# Ensure utf-8 stdout on Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure project root is on PYTHONPATH
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy import select
from backend.app.core.database import engine, async_session_factory, Base
from backend.app.models.allocation import MPLADAllocation
from backend.app.models.audit_log import AuditLog
from backend.app.services.constituency_matcher import normalize_constituency_name

DEFAULT_CSV = Path(root_dir) / "data" / "real_allocations_raw.csv"


def clean_allocated_amount(raw_val: str) -> float:
    """
    Cleans and parses raw allocation currency string into a float.
    Handles commas, currency symbols, and whitespace.
    """
    if not raw_val:
        return 0.0
    # Strip currency symbols (₹, Rs), commas, and spaces
    cleaned = re.sub(r"[^\d.]", "", str(raw_val).strip())
    if not cleaned:
        return 0.0
    return float(cleaned)


async def import_allocations(csv_path: str = str(DEFAULT_CSV)):
    print("=" * 75)
    print("  MPLAD SENTINEL — REAL MPLAD MP ALLOCATION REFERENCE IMPORTER")
    print("=" * 75)
    print(f"[*] Reading source dataset: {csv_path}")

    if not os.path.exists(csv_path):
        # Fallback to Downloads if not in data/
        fallback = Path("D:/Downloads/Allocated Limit for Honble MPs.csv")
        if fallback.exists():
            csv_path = str(fallback)
            print(f"[*] Using fallback path: {csv_path}")
        else:
            raise FileNotFoundError(f"Cannot find allocation CSV at: {csv_path}")

    # Ensure table exists in database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    records_to_process = []
    grand_total_found = False

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        header = next(reader)
        print(f"[*] Verified CSV Header: {header}")

        for line_no, row in enumerate(reader, start=2):
            if not row or len(row) < 5:
                continue

            sr_no_str = row[0].strip()
            # Explicitly identify and exclude Grand Total row
            if "grand total" in sr_no_str.lower():
                grand_total_found = True
                print(f"[i] Grand Total row detected at line {line_no} — correctly excluded.")
                continue

            try:
                sr_no = int(sr_no_str)
            except ValueError:
                continue

            state = row[1].strip()
            mp_name = row[2].strip()
            constituency = row[3].strip()
            allocated_amt = clean_allocated_amount(row[4])

            if allocated_amt <= 0:
                print(f"[!] Warning: Record #{sr_no} has non-positive allocation: {row[4]}")

            norm_const = normalize_constituency_name(constituency)

            records_to_process.append({
                "source_record_no": sr_no,
                "state": state,
                "mp_name": mp_name,
                "constituency": constituency,
                "normalized_constituency": norm_const,
                "allocated_amount": allocated_amt,
            })

    print(f"[*] Processed {len(records_to_process)} MP allocation rows from CSV.")
    assert len(records_to_process) == 543, f"Expected exactly 543 MP records, found {len(records_to_process)}"
    assert grand_total_found, "Grand Total row was not found/excluded."

    # Commit to database idempotently
    async with async_session_factory() as session:
        inserted_count = 0
        updated_count = 0

        for r in records_to_process:
            stmt = select(MPLADAllocation).where(
                MPLADAllocation.source_record_no == r["source_record_no"]
            )
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()

            if existing:
                existing.state = r["state"]
                existing.mp_name = r["mp_name"]
                existing.constituency = r["constituency"]
                existing.normalized_constituency = r["normalized_constituency"]
                existing.allocated_amount = r["allocated_amount"]
                existing.updated_at = datetime.now(timezone.utc)
                updated_count += 1
            else:
                new_alloc = MPLADAllocation(
                    source_record_no=r["source_record_no"],
                    state=r["state"],
                    mp_name=r["mp_name"],
                    constituency=r["constituency"],
                    normalized_constituency=r["normalized_constituency"],
                    allocated_amount=r["allocated_amount"],
                    source_dataset="Real MPLAD Allocation Dataset — Allocated Limit for Hon'ble MPs",
                )
                session.add(new_alloc)
                inserted_count += 1

        # Add audit log entry
        audit = AuditLog(
            action_type="ALLOCATION_DATASET_IMPORTED",
            entity_type="ALLOCATION_DATASET",
            entity_id="MPLAD-ALLOC-543",
            details=f"Imported real MPLAD MP allocation dataset ({len(records_to_process)} records).",
            metadata_json={
                "total_records": len(records_to_process),
                "inserted": inserted_count,
                "updated": updated_count,
                "source_file": os.path.basename(csv_path),
            },
        )
        session.add(audit)
        await session.commit()

        print(f"[+] Database Sync Complete: {inserted_count} inserted, {updated_count} updated.")
        print("=" * 75)
        print(f"  [SUCCESS] All 543 Real MP Allocations Verified in 'mplad_allocations' Table!")
        print("=" * 75)


def main():
    parser = argparse.ArgumentParser(description="Import real MPLAD MP allocation dataset.")
    parser.add_argument(
        "--csv",
        type=str,
        default=str(DEFAULT_CSV),
        help=f"Path to Allocated Limit for Hon'ble MPs CSV file (default: {DEFAULT_CSV})",
    )
    args = parser.parse_args()
    asyncio.run(import_allocations(csv_path=args.csv))


if __name__ == "__main__":
    main()
