/**
 * MPLAD SENTINEL — Phase 8 Anomaly Configuration
 * Centralized, deterministic thresholds for rule detectors, robust statistics,
 * and machine learning Isolation Forest.
 */

export const RULE_THRESHOLDS = {
  physicalFinancial: {
    criticalGapPct: 50.0, // Financial progress % minus physical progress % >= 50%
    highGapPct: 35.0, // Gap >= 35%
    moderateGapPct: 20.0, // Gap >= 20%
  },
  timeline: {
    invertedMilestoneDays: 0, // Ground start logged before formal administrative sanction
    flaggedDelayedStatus: "Delayed", // Administratively designated delayed status
    stalledExecutionRatio: 3.0, // Elapsed time >= 3.0x planned window
    stalledExecutionMaxProgress: 40, // Physical progress <= 40%
  },
  payment: {
    highPendingRatio: 0.4, // >= 40% of payment tranches pending clearance
    advanceDisbursementMaxProgress: 30, // Initial payment before inspection with progress <= 30%
    advanceDisbursementMaxDays: 15, // First payment issued within 15 days of mobilization
  },
  expenditure: {
    expenditureExceedsReleaseRatio: 1.0, // Booked expenditure > treasury release ceiling
    earlyHighBurnRatio: 0.95, // >= 95% budget expended in preliminary phase
    earlyHighBurnMaxProgress: 40, // <= 40% physical progress
  },
  duplicate: {
    maxAmountDeltaRatio: 0.05, // Within 5% variance in sanctioned outlay for same constituency & work
  },
  contractor: {
    districtShareCriticalPct: 20.0, // >= 20% of all public works in district
    criticalStatewideProjectsCount: 40, // >= 40 projects handled statewide
    districtShareHighPct: 25.0, // Standalone >= 25% district share
  },
  documentation: {
    criticalCompletenessRatio: 0.4, // <= 40% verified mandatory statutory documents
    lowCompletenessRatio: 0.7, // < 70% verified mandatory statutory documents
    stageCertRequiredMinProgress: 30, // Official stage progress certificate required once progress >= 30%
  },
};

export const STATISTICAL_CONFIG = {
  madMultiplier: 3.0, // Robust outlier threshold: |Modified Z| >= 3.0
  features: [
    "cross_domain.expenditure_per_progress_point",
    "payment.payment_velocity_amount_per_month",
    "temporal.days_recommendation_to_sanction",
  ] as const,
};

export const ML_CONFIG = {
  nTrees: 100,
  subsampleSize: 128,
  scoreThreshold: 0.6,
  seed: 26102,
  featureNames: [
    "financial.sanctioned_amount",
    "financial.expenditure_to_release_ratio",
    "financial.expenditure_to_sanction_ratio",
    "physical.reported_physical_progress",
    "physical.schedule_delay_days",
    "temporal.project_age_days",
    "payment.payment_velocity_amount_per_month",
    "contractor.contractor_district_share_percentage",
    "agency.agency_district_share_percentage",
    "documentation.documentation_completeness_ratio",
    "cross_domain.financial_progress_vs_physical_progress_gap",
    "cross_domain.elapsed_time_ratio",
  ] as const,
};
