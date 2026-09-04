import random
import uuid
from datetime import date, timedelta
from typing import List, Dict, Any, Tuple

from .archetypes import AnomalyArchetype, SECTOR_BENCHMARKS

# Explicit disclaimer banner required by PRD
DATA_DISCLAIMER = "DEMO DATA — NOT OFFICIAL GOVERNMENT DATA"

# Realistic Administrative Geography
LOCATIONS = [
    {
        "state": "Maharashtra",
        "district": "Pune",
        "constituency": "Pune (LS-34)",
        "mp_name": "Murlidhar Mohol",
        "mp_house": "Lok Sabha",
        "lat_range": (18.45, 18.65),
        "lon_range": (73.75, 74.00),
        "villages": ["Haveli", "Khadakwasla", "Manchar", "Shivajinagar", "Baramati", "Shirur"],
    },
    {
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "constituency": "Varanasi (LS-77)",
        "mp_name": "Narendra Modi",
        "mp_house": "Lok Sabha",
        "lat_range": (25.25, 25.40),
        "lon_range": (82.90, 83.10),
        "villages": ["Rohaniya", "Sewapuri", "Kashi", "Shivpur", "Cantt", "Pindra"],
    },
    {
        "state": "Karnataka",
        "district": "Bengaluru Rural",
        "constituency": "Bengaluru Rural (LS-23)",
        "mp_name": "C. N. Manjunath",
        "mp_house": "Lok Sabha",
        "lat_range": (13.10, 13.35),
        "lon_range": (77.40, 77.70),
        "villages": ["Devanahalli", "Nelamangala", "Doddaballapura", "Hosakote", "Magadi"],
    },
    {
        "state": "Rajasthan",
        "district": "Jaipur",
        "constituency": "Jaipur (LS-07)",
        "mp_name": "Manju Sharma",
        "mp_house": "Lok Sabha",
        "lat_range": (26.80, 27.05),
        "lon_range": (75.70, 75.95),
        "villages": ["Sanganer", "Amer", "Chaksu", "Jhotwara", "Bassi", "Shahpura"],
    },
    {
        "state": "Bihar",
        "district": "Patna",
        "constituency": "Patna Sahib (LS-30)",
        "mp_name": "Ravi Shankar Prasad",
        "mp_house": "Lok Sabha",
        "lat_range": (25.55, 25.68),
        "lon_range": (85.05, 85.25),
        "villages": ["Bakhtiarpur", "Danapur", "Phulwari", "Fatuha", "Maner", "Barh"],
    },
    {
        "state": "Madhya Pradesh",
        "district": "Indore",
        "constituency": "Indore (LS-26)",
        "mp_name": "Shankar Lalwani",
        "mp_house": "Lok Sabha",
        "lat_range": (22.65, 22.80),
        "lon_range": (75.80, 75.95),
        "villages": ["Mhow", "Sanwer", "Depalpur", "Rau", "Hatod", "Betma"],
    },
    {
        "state": "Tamil Nadu",
        "district": "Coimbatore",
        "constituency": "Coimbatore (LS-20)",
        "mp_name": "Ganapathi P. Rajkumar",
        "mp_house": "Lok Sabha",
        "lat_range": (10.95, 11.10),
        "lon_range": (76.90, 77.05),
        "villages": ["Sulur", "Pollachi", "Mettupalayam", "Annur", "Kinathukadavu"],
    },
    {
        "state": "West Bengal",
        "district": "Darjeeling",
        "constituency": "Darjeeling (LS-04)",
        "mp_name": "Raju Bista",
        "mp_house": "Lok Sabha",
        "lat_range": (26.95, 27.15),
        "lon_range": (88.20, 88.35),
        "villages": ["Kurseong", "Kalimpong", "Mirik", "Siliguri", "Sukhiapokhri", "Naxalbari"],
    },
]

AGENCY_TEMPLATES = [
    {"code_prefix": "PWD", "name": "Public Works Department (Div-1)", "type": "Line Department"},
    {"code_prefix": "DRDA", "name": "District Rural Development Agency", "type": "Line Department"},
    {"code_prefix": "ZP", "name": "Zilla Parishad Engineering Cell", "type": "Panchayati Raj"},
    {"code_prefix": "JAL", "name": "State Rural Water Supply & Sanitation Board", "type": "Line Department"},
    {"code_prefix": "PRI", "name": "Gram Panchayat Development Committee", "type": "Panchayati Raj"},
    {"code_prefix": "MUNC", "name": "Municipal Corporation Public Infrastructure Cell", "type": "Municipal Corporation"},
    {"code_prefix": "CONTR-101", "name": "Vanguard Infra Projects Pvt Ltd", "type": "Registered Contractor"},
    {"code_prefix": "CONTR-102", "name": "Apex Engineering & Construction Syndicate", "type": "Registered Contractor"},
    {"code_prefix": "CONTR-103", "name": "Shree Balaji Civic Builders", "type": "Registered Contractor"},
]

PROJECT_TITLES = {
    "Roads & Pathways": [
        "Construction of Cement Concrete (CC) Road with side drains from {loc1} to {loc2}",
        "Upgradation of link road and culvert bridging at {village}",
        "Bituminous macadam surfacing of rural connectivity pathway near {village} main square",
        "Paving of interlocking paver block street in {village} Ward 4",
    ],
    "Drinking Water Supply": [
        "Installation of Deep Borewell with Solar Dual Pump and overhead storage tank at {village}",
        "Setting up of Community RO Water Purification Plant with distribution kiosk at {village}",
        "Laying of piped drinking water distribution network for scheduled caste colony in {village}",
        "Rejuvenation of traditional percolation tank and public drinking well at {village}",
    ],
    "Education & School Infrastructure": [
        "Construction of 2 additional smart classroom blocks at Government Higher Secondary School, {village}",
        "Establishment of Composite Science and STEM Laboratory at Zilla Parishad High School, {village}",
        "Construction of modern girls toilet block and sanitation facility at Primary School, {village}",
        "Installation of rooftop solar photovoltaic system at Model Senior Secondary School, {village}",
    ],
    "Health & Sanitation": [
        "Upgradation and modernization of Primary Health Sub-Centre with emergency maternity unit at {village}",
        "Construction of Community Sanitary Complex with biological septic filtration in {village}",
        "Procurement of Basic Life Support Mobile Ambulance van for community health services in {district}",
        "Setting up of automated diagnostic lab unit at Community Health Centre, {village}",
    ],
    "Community Infrastructure": [
        "Construction of Multi-Purpose Community Hall and Cultural Center for public gatherings at {village}",
        "Development of Rural Sports Playground with boundary wall and athletic track at {village}",
        "Construction of modern cremation shed with solar lighting and water facility at {village}",
        "Creation of Farmer Training & Seed Storage Facility near agricultural marketing yard at {village}",
    ],
    "Irrigation & Flood Control": [
        "Construction of Check Dam across local seasonal stream for groundwater recharge at {village}",
        "Desilting and embankment strengthening of drainage canal serving agricultural fields in {village}",
        "Laying of underground irrigation pipeline connecting minor irrigation tank to farmlands at {village}",
        "Construction of gabion flood protection retaining wall along vulnerable bank in {village}",
    ],
}


class SyntheticMPLADSGenerator:
    """
    Generates realistic, statistically diverse MPLADS project datasets with controlled
    anomaly archetypes and comprehensive administrative metadata.
    """

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self._counter = 1000

    def generate_dataset(self, total_count: int = 600) -> List[Dict[str, Any]]:
        """
        Generate an ensemble dataset containing normal baseline works and controlled anomaly archetypes.
        """
        projects: List[Dict[str, Any]] = []

        # Target Archetype distribution quotas
        # Normal: ~68%
        # Cost Outlier: ~6%
        # High Spend Low Progress: ~6%
        # Delayed: ~6%
        # Duplicate Pairs: ~4% (generated in pairs)
        # Agency Monopoly: ~4%
        # Data Inconsistent: ~3%
        # Data Missing: ~3%

        n_cost_outlier = max(10, int(total_count * 0.06))
        n_high_spend_low_prog = max(10, int(total_count * 0.06))
        n_delayed = max(10, int(total_count * 0.06))
        n_duplicate_pairs = max(6, int(total_count * 0.04) // 2)  # pairs = 2x
        n_agency_monopoly = max(8, int(total_count * 0.04))
        n_inconsistent = max(6, int(total_count * 0.03))
        n_missing = max(6, int(total_count * 0.03))

        total_anomalies = (
            n_cost_outlier +
            n_high_spend_low_prog +
            n_delayed +
            (n_duplicate_pairs * 2) +
            n_agency_monopoly +
            n_inconsistent +
            n_missing
        )
        n_normal = total_count - total_anomalies

        # 1. Normal Projects
        for _ in range(n_normal):
            projects.append(self._generate_single_project(AnomalyArchetype.NORMAL))

        # 2. Cost Outliers
        for _ in range(n_cost_outlier):
            projects.append(self._generate_single_project(AnomalyArchetype.COST_OUTLIER))

        # 3. High Spend + Low Progress
        for _ in range(n_high_spend_low_prog):
            projects.append(self._generate_single_project(AnomalyArchetype.HIGH_SPEND_LOW_PROGRESS))

        # 4. Delayed / Stalled Projects
        for _ in range(n_delayed):
            projects.append(self._generate_single_project(AnomalyArchetype.DELAYED_PROJECT))

        # 5. Duplicate Pairs
        for _ in range(n_duplicate_pairs):
            p1, p2 = self._generate_duplicate_pair()
            projects.append(p1)
            projects.append(p2)

        # 6. Agency Monopoly Cluster
        # Concentrate on a single agency in one district
        monopoly_agency = AGENCY_TEMPLATES[6]  # "Vanguard Infra Projects Pvt Ltd"
        target_loc = LOCATIONS[0]  # Pune
        for _ in range(n_agency_monopoly):
            projects.append(self._generate_single_project(
                AnomalyArchetype.AGENCY_MONOPOLY,
                fixed_loc=target_loc,
                fixed_agency=monopoly_agency
            ))

        # 7. Data Inconsistent
        for _ in range(n_inconsistent):
            projects.append(self._generate_single_project(AnomalyArchetype.DATA_INCONSISTENT))

        # 8. Data Missing (Low Confidence)
        for _ in range(n_missing):
            projects.append(self._generate_single_project(AnomalyArchetype.DATA_MISSING))

        # Shuffle to mix archetypes throughout the dataset
        self.rng.shuffle(projects)
        return projects

    def _generate_single_project(
        self,
        archetype: AnomalyArchetype,
        fixed_loc: Dict[str, Any] = None,
        fixed_agency: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        self._counter += 1
        loc = fixed_loc if fixed_loc else self.rng.choice(LOCATIONS)
        agency_tmpl = fixed_agency if fixed_agency else self.rng.choice(AGENCY_TEMPLATES)
        sector = self.rng.choice(list(SECTOR_BENCHMARKS.keys()))
        benchmark = SECTOR_BENCHMARKS[sector]

        village = self.rng.choice(loc["villages"])
        loc2 = self.rng.choice([v for v in loc["villages"] if v != village] or ["Outer Ring Road"])
        title_template = self.rng.choice(PROJECT_TITLES[sector])
        title = title_template.format(
            loc1=village,
            loc2=loc2,
            village=village,
            district=loc["district"]
        )

        project_code = f"MPLAD-{loc['state'][:2].upper()}-{loc['district'][:3].upper()}-{self._counter:05d}"
        description = f"Administrative sanction under MPLADS for: {title}. Implemented by {agency_tmpl['name']} for public benefit in {village}, {loc['district']}."

        # Coordinates
        lat = round(self.rng.uniform(loc["lat_range"][0], loc["lat_range"][1]), 6)
        lon = round(self.rng.uniform(loc["lon_range"][0], loc["lon_range"][1]), 6)

        # Baseline Timeline
        today = date(2026, 8, 1)
        sanction_days_ago = self.rng.randint(90, 1000)
        sanction_date = today - timedelta(days=sanction_days_ago)
        expected_duration_days = self.rng.randint(180, 365)
        expected_completion = sanction_date + timedelta(days=expected_duration_days)

        # Baseline Quantities & Cost
        quantity = round(self.rng.uniform(1.0, 5.0), 1)
        base_unit_cost = self.rng.uniform(benchmark["typical_range"][0], benchmark["typical_range"][1])
        sanctioned_amount = round(quantity * base_unit_cost, -4)  # Round to nearest 10k

        # Default normal progression
        elapsed_days = (today - sanction_date).days
        duration_pct = min(1.0, elapsed_days / max(1, expected_duration_days))

        released_ratio = min(1.0, round(self.rng.uniform(duration_pct * 0.8, min(1.0, duration_pct * 1.2)), 2))
        released_amount = round(sanctioned_amount * released_ratio, 2)

        expenditure_ratio = min(released_ratio, round(released_ratio * self.rng.uniform(0.75, 0.98), 2))
        expenditure_amount = round(sanctioned_amount * expenditure_ratio, 2)

        physical_progress_pct = round(duration_pct * self.rng.uniform(80.0, 100.0), 1)
        physical_progress_pct = min(100.0, max(0.0, physical_progress_pct))

        actual_completion_date = None
        if physical_progress_pct >= 100.0 and elapsed_days >= expected_duration_days:
            status = "COMPLETED"
            actual_completion_date = sanction_date + timedelta(days=int(expected_duration_days * self.rng.uniform(0.9, 1.2)))
            if actual_completion_date > today:
                actual_completion_date = today
        elif physical_progress_pct > 0.0:
            status = "IN_PROGRESS"
        else:
            status = "SANCTIONED"

        # Apply specific anomaly archetype characteristics
        if archetype == AnomalyArchetype.COST_OUTLIER:
            # Multiplier 2.5x to 4.5x above standard benchmark
            multiplier = self.rng.uniform(2.8, 4.5)
            sanctioned_amount = round(sanctioned_amount * multiplier, -4)
            released_amount = round(sanctioned_amount * 0.90, 2)
            expenditure_amount = round(released_amount * 0.85, 2)
            description += f" (Contains specialized premium design parameters and expedited specifications)."

        elif archetype == AnomalyArchetype.HIGH_SPEND_LOW_PROGRESS:
            # 85-98% funds disbursed and spent, but physical progress is only 5-20%
            released_amount = round(sanctioned_amount * self.rng.uniform(0.90, 0.98), 2)
            expenditure_amount = round(released_amount * self.rng.uniform(0.92, 0.99), 2)
            physical_progress_pct = round(self.rng.uniform(5.0, 22.0), 1)
            status = "IN_PROGRESS"
            actual_completion_date = None

        elif archetype == AnomalyArchetype.DELAYED_PROJECT:
            # Sanctioned 3+ years ago (e.g. 1100 to 1400 days ago), overdue by >2 years, stalled progress
            sanction_days_ago = self.rng.randint(1100, 1500)
            sanction_date = today - timedelta(days=sanction_days_ago)
            expected_completion = sanction_date + timedelta(days=300)
            physical_progress_pct = round(self.rng.uniform(25.0, 48.0), 1)
            released_amount = round(sanctioned_amount * 0.70, 2)
            expenditure_amount = round(released_amount * 0.85, 2)
            status = "STALLED"
            actual_completion_date = None

        elif archetype == AnomalyArchetype.DATA_INCONSISTENT:
            # Engineer one of the specific data inconsistency flaws
            flaw_type = self.rng.choice(["completion_before_sanction", "spent_exceeds_sanction", "negative_financial", "excess_progress"])
            if flaw_type == "completion_before_sanction":
                actual_completion_date = sanction_date - timedelta(days=self.rng.randint(30, 90))
                status = "COMPLETED"
                physical_progress_pct = 100.0
            elif flaw_type == "spent_exceeds_sanction":
                expenditure_amount = round(sanctioned_amount * self.rng.uniform(1.25, 1.60), 2)
                released_amount = expenditure_amount
            elif flaw_type == "negative_financial":
                expenditure_amount = -50000.0
            elif flaw_type == "excess_progress":
                physical_progress_pct = 125.0

        elif archetype == AnomalyArchetype.DATA_MISSING:
            # Omit critical coordinates, agency, or progress
            omit_type = self.rng.choice(["no_location", "no_progress", "short_desc"])
            if omit_type == "no_location":
                lat = None
                lon = None
            elif omit_type == "no_progress":
                physical_progress_pct = None
            elif omit_type == "short_desc":
                description = "Work"

        # Calculate unit cost
        cost_per_unit = round(sanctioned_amount / quantity, 2) if quantity > 0 else None
        unspent_balance = max(0.0, round(released_amount - expenditure_amount, 2))
        financial_progress_pct = round((expenditure_amount / sanctioned_amount) * 100.0, 1) if sanctioned_amount > 0 else 0.0

        agency_id = f"AGY-{agency_tmpl['code_prefix']}-{loc['district'][:3].upper()}"

        return {
            "project_code": project_code,
            "title": title,
            "description": description,
            "state": loc["state"],
            "district": loc["district"],
            "constituency": loc["constituency"],
            "block_or_taluk": loc["villages"][0],
            "village_or_ward": village,
            "latitude": lat,
            "longitude": lon,
            "mp_name": loc["mp_name"],
            "mp_house": loc["mp_house"],
            "sector": sector,
            "status": status,
            "sanction_date": str(sanction_date),
            "expected_completion_date": str(expected_completion) if expected_completion else None,
            "actual_completion_date": str(actual_completion_date) if actual_completion_date else None,
            "agency_id": agency_id,
            "agency_name": agency_tmpl["name"],
            "agency_type": agency_tmpl["type"],
            "sanctioned_amount": sanctioned_amount,
            "released_amount": released_amount,
            "expenditure_amount": expenditure_amount,
            "unspent_balance": unspent_balance,
            "financial_progress_pct": financial_progress_pct,
            "physical_progress_pct": physical_progress_pct,
            "output_unit": benchmark["unit"],
            "physical_quantity": quantity,
            "cost_per_unit": cost_per_unit,
            "archetype": archetype.value,
            "data_attribution": DATA_DISCLAIMER,
        }

    def _generate_duplicate_pair(self) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Generates two projects sharing near-identical scope and identical geographic location
        with subtly paraphrased titles and overlapping timeframes (Potential Duplicate Archetype).
        """
        loc = self.rng.choice(LOCATIONS)
        village = self.rng.choice(loc["villages"])
        sector = "Roads & Pathways"
        benchmark = SECTOR_BENCHMARKS[sector]
        quantity = 2.0
        unit_cost = self.rng.uniform(benchmark["typical_range"][0], benchmark["typical_range"][1])
        sanctioned = round(quantity * unit_cost, -4)

        base_project = self._generate_single_project(AnomalyArchetype.NORMAL, fixed_loc=loc)
        base_project["archetype"] = AnomalyArchetype.DUPLICATE_PAIR.value
        base_project["sector"] = sector
        base_project["village_or_ward"] = village
        base_project["title"] = f"Construction of Cement Concrete (CC) Road and side drains from Panchayat Bhawan to Main Gate in {village}"
        base_project["sanctioned_amount"] = sanctioned
        base_project["cost_per_unit"] = round(sanctioned / quantity, 2)

        # Duplicate project with rephrased wording, slightly varied sanction date (+45 days)
        sanction_dt = date.fromisoformat(base_project["sanction_date"]) + timedelta(days=45)
        self._counter += 1
        dup_project = dict(base_project)
        dup_project["project_code"] = f"MPLAD-{loc['state'][:2].upper()}-{loc['district'][:3].upper()}-{self._counter:05d}"
        dup_project["title"] = f"Paving and laying of cement concrete road with drainage near Panchayat Hall to Village Entry, {village}"
        dup_project["sanction_date"] = str(sanction_dt)
        dup_project["sanctioned_amount"] = round(sanctioned * self.rng.uniform(0.95, 1.05), -4)
        dup_project["cost_per_unit"] = round(dup_project["sanctioned_amount"] / quantity, 2)
        dup_project["archetype"] = AnomalyArchetype.DUPLICATE_PAIR.value

        return base_project, dup_project
