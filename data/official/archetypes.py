from enum import Enum
from typing import Dict, Any


class AnomalyArchetype(str, Enum):
    NORMAL = "NORMAL"
    COST_OUTLIER = "COST_OUTLIER"
    HIGH_SPEND_LOW_PROGRESS = "HIGH_SPEND_LOW_PROGRESS"
    DELAYED_PROJECT = "DELAYED_PROJECT"
    DUPLICATE_PAIR = "DUPLICATE_PAIR"
    AGENCY_MONOPOLY = "AGENCY_MONOPOLY"
    DATA_INCONSISTENT = "DATA_INCONSISTENT"
    DATA_MISSING = "DATA_MISSING"


ARCHETYPE_DESCRIPTIONS = {
    AnomalyArchetype.NORMAL: "Statistically sound project conforming to standard sector costs, timeline, and disbursement ratios.",
    AnomalyArchetype.COST_OUTLIER: "Unit cost per output (e.g. per km or per sq m) is 250%–450% above sector median benchmark.",
    AnomalyArchetype.HIGH_SPEND_LOW_PROGRESS: "Severe divergence between expenditure (>85%) and verified physical milestone progress (<25%).",
    AnomalyArchetype.DELAYED_PROJECT: "Project duration significantly exceeds expected deadline (>24 months overdue) with stalled progress.",
    AnomalyArchetype.DUPLICATE_PAIR: "Near-identical scope and location description with another work sanctioned in close temporal proximity.",
    AnomalyArchetype.AGENCY_MONOPOLY: "Contract allocated to an agency possessing disproportionate market concentration in the constituency.",
    AnomalyArchetype.DATA_INCONSISTENT: "Chronological or financial paradoxes (e.g. completion date prior to sanction, expenditure > sanction).",
    AnomalyArchetype.DATA_MISSING: "Incomplete administrative records (missing geo-coordinates, blank description, or missing progress record).",
}

# Standard Sector Unit Cost Benchmarks (INR per unit)
SECTOR_BENCHMARKS = {
    "Roads & Pathways": {"unit": "kilometer", "median_cost": 2500000.0, "typical_range": (1800000.0, 3200000.0)},
    "Drinking Water Supply": {"unit": "water_installation", "median_cost": 450000.0, "typical_range": (300000.0, 600000.0)},
    "Education & School Infrastructure": {"unit": "classroom_block", "median_cost": 1500000.0, "typical_range": (1100000.0, 1900000.0)},
    "Health & Sanitation": {"unit": "facility_center", "median_cost": 3000000.0, "typical_range": (2200000.0, 3800000.0)},
    "Community Infrastructure": {"unit": "community_hall", "median_cost": 3500000.0, "typical_range": (2600000.0, 4400000.0)},
    "Irrigation & Flood Control": {"unit": "check_dam", "median_cost": 2000000.0, "typical_range": (1500000.0, 2600000.0)},
}
