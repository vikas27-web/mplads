/**
 * MPLAD SENTINEL — Phase 7 Feature Extractor
 * Deterministic, mathematically grounded transformation of canonical project records
 * into typed feature vectors for downstream analysis.
 *
 * CRITICAL GOVERNANCE RULE:
 * This extractor strictly excludes 'scenario_type', synthetic anomaly labels, and risk scores.
 * All features are descriptive representations only.
 */

import type {
  ProjectRecord,
  PaymentRecord,
  PhysicalProgressRecord,
  DocumentRecord,
} from "../types/project.ts";
import {
  type FeatureRecord,
  type CategoricalFeatures,
  type FinancialFeatures,
  type PhysicalFeatures,
  type TemporalFeatures,
  type PaymentFeatures,
  type ContractorContextFeatures,
  type AgencyContextFeatures,
  type DocumentationFeatures,
  type CrossDomainFeatures,
  FEATURE_VERSION,
  REFERENCE_AUDIT_DATE,
} from "./types.ts";

/**
 * Calculates calendar days between two ISO date strings (dateB - dateA)
 */
export function daysBetween(dateStrA: string, dateStrB: string): number {
  const msA = Date.parse(dateStrA);
  const msB = Date.parse(dateStrB);
  if (isNaN(msA) || isNaN(msB)) {
    return 0;
  }
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates population standard deviation for an array of numbers
 */
export function calculateStdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Number(Math.sqrt(variance).toFixed(2));
}

/**
 * Pre-aggregated global context across the entire project dataset.
 * Enables deterministic calculation of contractor/agency market share and geographic dispersion.
 */
export interface GlobalFeatureContext {
  contractorProjects: Map<string, ProjectRecord[]>;
  agencyProjects: Map<string, ProjectRecord[]>;
  districtProjectCounts: Map<string, number>;
  contractorDistrictCounts: Map<string, Map<string, number>>; // contractorId -> (district -> count)
  agencyDistrictCounts: Map<string, Map<string, number>>; // agencyCode -> (district -> count)
}

/**
 * Builds the global dataset context used to extract contractor and agency contextual features.
 */
export function buildGlobalContext(allProjects: ProjectRecord[]): GlobalFeatureContext {
  const contractorProjects = new Map<string, ProjectRecord[]>();
  const agencyProjects = new Map<string, ProjectRecord[]>();
  const districtProjectCounts = new Map<string, number>();
  const contractorDistrictCounts = new Map<string, Map<string, number>>();
  const agencyDistrictCounts = new Map<string, Map<string, number>>();

  for (const p of allProjects) {
    // Contractor map
    if (!contractorProjects.has(p.contractor_id)) {
      contractorProjects.set(p.contractor_id, []);
    }
    contractorProjects.get(p.contractor_id)!.push(p);

    // Agency map
    if (!agencyProjects.has(p.implementing_agency)) {
      agencyProjects.set(p.implementing_agency, []);
    }
    agencyProjects.get(p.implementing_agency)!.push(p);

    // District count
    const dCount = districtProjectCounts.get(p.district) || 0;
    districtProjectCounts.set(p.district, dCount + 1);

    // Contractor district map
    if (!contractorDistrictCounts.has(p.contractor_id)) {
      contractorDistrictCounts.set(p.contractor_id, new Map());
    }
    const cDistMap = contractorDistrictCounts.get(p.contractor_id)!;
    cDistMap.set(p.district, (cDistMap.get(p.district) || 0) + 1);

    // Agency district map
    if (!agencyDistrictCounts.has(p.implementing_agency)) {
      agencyDistrictCounts.set(p.implementing_agency, new Map());
    }
    const aDistMap = agencyDistrictCounts.get(p.implementing_agency)!;
    aDistMap.set(p.district, (aDistMap.get(p.district) || 0) + 1);
  }

  return {
    contractorProjects,
    agencyProjects,
    districtProjectCounts,
    contractorDistrictCounts,
    agencyDistrictCounts,
  };
}

/**
 * Extracts Categorical features
 */
export function extractCategoricalFeatures(project: ProjectRecord): CategoricalFeatures {
  return {
    state: project.state,
    district: project.district,
    constituency: project.constituency,
    sector: project.sector,
    work_category: project.work_category,
    implementing_agency: project.implementing_agency,
    contractor_id: project.contractor_id,
    contractor_name: project.contractor_name,
    status: project.status,
  };
}

/**
 * Extracts Financial features
 */
export function extractFinancialFeatures(
  project: ProjectRecord,
  payments: PaymentRecord[]
): FinancialFeatures {
  const sanctioned = project.sanctioned_amount;
  const released = project.released_amount;
  const expenditure = project.expenditure_amount;

  const remainingSanctioned = sanctioned - expenditure;
  const remainingReleased = released - expenditure;

  const expenditureToReleaseRatio =
    released > 0 ? Number((expenditure / released).toFixed(4)) : 0;
  const releaseToSanctionRatio =
    sanctioned > 0 ? Number((released / sanctioned).toFixed(4)) : 0;
  const expenditureToSanctionRatio =
    sanctioned > 0 ? Number((expenditure / sanctioned).toFixed(4)) : 0;

  const paymentAmounts = payments.map((p) => p.amount);
  const paymentCount = payments.length;
  const totalPaymentSum = paymentAmounts.reduce((sum, a) => sum + a, 0);

  const avgPayment =
    paymentCount > 0 ? Number((totalPaymentSum / paymentCount).toFixed(2)) : 0;
  const maxPayment = paymentCount > 0 ? Math.max(...paymentAmounts) : 0;
  const minPayment = paymentCount > 0 ? Math.min(...paymentAmounts) : 0;
  const stdDevPayment = calculateStdDev(paymentAmounts);

  return {
    sanctioned_amount: sanctioned,
    released_amount: released,
    expenditure_amount: expenditure,
    remaining_sanctioned_amount: remainingSanctioned,
    remaining_released_amount: remainingReleased,
    expenditure_to_release_ratio: expenditureToReleaseRatio,
    release_to_sanction_ratio: releaseToSanctionRatio,
    expenditure_to_sanction_ratio: expenditureToSanctionRatio,
    payment_count: paymentCount,
    average_payment_amount: avgPayment,
    max_payment_amount: maxPayment,
    min_payment_amount: minPayment,
    payment_amount_std_dev: stdDevPayment,
  };
}

/**
 * Extracts Physical Progress features
 */
export function extractPhysicalFeatures(
  project: ProjectRecord,
  progressEvents: PhysicalProgressRecord[]
): PhysicalFeatures {
  const reportedProgress = project.physical_progress;
  const progressCount = progressEvents.length;

  const sortedProgress = [...progressEvents].sort(
    (a, b) => Date.parse(a.record_date) - Date.parse(b.record_date)
  );
  const latestLoggedProgress =
    progressCount > 0
      ? sortedProgress[sortedProgress.length - 1].progress_percentage
      : reportedProgress;

  const avgProgressPerUpdate =
    progressCount > 0 ? Number((reportedProgress / progressCount).toFixed(2)) : 0;

  const isCompleted = project.status === "Completed" ? 1 : 0;

  const plannedDurationDays = Math.max(
    1,
    daysBetween(
      project.start_date,
      project.planned_completion_date || project.expected_completion_date
    )
  );

  let actualOrElapsedDays: number;
  if (project.actual_or_reported_completion_date) {
    actualOrElapsedDays = Math.max(
      1,
      daysBetween(project.start_date, project.actual_or_reported_completion_date)
    );
  } else {
    actualOrElapsedDays = Math.max(
      1,
      daysBetween(project.start_date, REFERENCE_AUDIT_DATE)
    );
  }

  const scheduleDelayDays = Math.max(0, actualOrElapsedDays - plannedDurationDays);

  return {
    reported_physical_progress: reportedProgress,
    progress_event_count: progressCount,
    latest_progress_percentage: latestLoggedProgress,
    average_progress_per_update: avgProgressPerUpdate,
    is_completed: isCompleted,
    planned_duration_days: plannedDurationDays,
    actual_or_elapsed_duration_days: actualOrElapsedDays,
    schedule_delay_days: scheduleDelayDays,
  };
}

/**
 * Extracts Temporal features
 */
export function extractTemporalFeatures(
  project: ProjectRecord,
  payments: PaymentRecord[],
  progressEvents: PhysicalProgressRecord[]
): TemporalFeatures {
  const daysRecToSanc = Math.max(
    0,
    daysBetween(project.recommendation_date, project.sanction_date)
  );
  const daysSancToStart = Math.max(
    0,
    daysBetween(project.sanction_date, project.start_date)
  );
  const daysStartToPlanned = Math.max(
    1,
    daysBetween(
      project.start_date,
      project.planned_completion_date || project.expected_completion_date
    )
  );
  const daysSinceUpdated = Math.max(
    0,
    daysBetween(project.last_updated, REFERENCE_AUDIT_DATE)
  );
  const projectAge = Math.max(0, daysBetween(project.start_date, REFERENCE_AUDIT_DATE));

  // Payment interval statistics
  let avgPaymentInterval: number | null = null;
  if (payments.length >= 2) {
    const sortedDates = [...payments]
      .map((p) => Date.parse(p.payment_date))
      .sort((a, b) => a - b);
    let totalIntervalDays = 0;
    for (let i = 1; i < sortedDates.length; i++) {
      totalIntervalDays += (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    }
    avgPaymentInterval = Number((totalIntervalDays / (sortedDates.length - 1)).toFixed(2));
  }

  // Progress interval statistics
  let avgProgressInterval: number | null = null;
  if (progressEvents.length >= 2) {
    const sortedDates = [...progressEvents]
      .map((e) => Date.parse(e.record_date))
      .sort((a, b) => a - b);
    let totalIntervalDays = 0;
    for (let i = 1; i < sortedDates.length; i++) {
      totalIntervalDays += (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
    }
    avgProgressInterval = Number(
      (totalIntervalDays / (sortedDates.length - 1)).toFixed(2)
    );
  }

  return {
    days_recommendation_to_sanction: daysRecToSanc,
    days_sanction_to_start: daysSancToStart,
    days_start_to_planned_completion: daysStartToPlanned,
    days_since_last_updated: daysSinceUpdated,
    project_age_days: projectAge,
    avg_payment_interval_days: avgPaymentInterval,
    avg_progress_interval_days: avgProgressInterval,
  };
}

/**
 * Extracts Payment features
 */
export function extractPaymentFeatures(
  project: ProjectRecord,
  payments: PaymentRecord[],
  physicalFeatures: PhysicalFeatures
): PaymentFeatures {
  const paymentCount = payments.length;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const disbursedCount = payments.filter((p) => p.status === "Disbursed").length;
  const pendingCount = payments.filter((p) => p.status === "Pending Clearance").length;

  const disbursedRatio =
    paymentCount > 0 ? Number((disbursedCount / paymentCount).toFixed(4)) : 0;

  const sortedPayments = [...payments].sort(
    (a, b) => Date.parse(a.payment_date) - Date.parse(b.payment_date)
  );

  const daysToFirst =
    sortedPayments.length > 0
      ? Math.max(0, daysBetween(project.start_date, sortedPayments[0].payment_date))
      : null;

  const daysToFinal =
    sortedPayments.length > 0
      ? Math.max(
          0,
          daysBetween(
            project.start_date,
            sortedPayments[sortedPayments.length - 1].payment_date
          )
        )
      : null;

  // Monthly velocity based on elapsed project duration (in months of 30.4375 days)
  const durationMonths = Math.max(
    1,
    physicalFeatures.actual_or_elapsed_duration_days / 30.4375
  );
  const paymentVelocity = Number((totalPaid / durationMonths).toFixed(2));

  return {
    payment_count: paymentCount,
    total_paid_amount: totalPaid,
    disbursed_payment_ratio: disbursedRatio,
    pending_payment_count: pendingCount,
    days_to_first_payment: daysToFirst,
    days_to_final_payment: daysToFinal,
    payment_velocity_amount_per_month: paymentVelocity,
  };
}

/**
 * Extracts Contractor Context features using the precomputed global context
 */
export function extractContractorContextFeatures(
  project: ProjectRecord,
  context: GlobalFeatureContext
): ContractorContextFeatures {
  const contractorProjects = context.contractorProjects.get(project.contractor_id) || [];
  const totalProjects = contractorProjects.length;

  const totalSanctioned = contractorProjects.reduce(
    (sum, p) => sum + p.sanctioned_amount,
    0
  );

  const distinctDistricts = new Set(contractorProjects.map((p) => p.district)).size;

  const distTotalProjects = context.districtProjectCounts.get(project.district) || 1;
  const cDistMap = context.contractorDistrictCounts.get(project.contractor_id);
  const contractorDistrictProjects = cDistMap ? cDistMap.get(project.district) || 0 : 0;

  const districtShare = Number(
    ((contractorDistrictProjects / distTotalProjects) * 100).toFixed(2)
  );

  return {
    contractor_total_projects: totalProjects,
    contractor_total_sanctioned_amount: totalSanctioned,
    contractor_district_count: distinctDistricts,
    contractor_district_share_percentage: districtShare,
  };
}

/**
 * Extracts Agency Context features using the precomputed global context
 */
export function extractAgencyContextFeatures(
  project: ProjectRecord,
  context: GlobalFeatureContext
): AgencyContextFeatures {
  const agencyProjects = context.agencyProjects.get(project.implementing_agency) || [];
  const totalProjects = agencyProjects.length;

  const totalSanctioned = agencyProjects.reduce(
    (sum, p) => sum + p.sanctioned_amount,
    0
  );

  const distinctSectors = new Set(agencyProjects.map((p) => p.sector)).size;

  const distTotalProjects = context.districtProjectCounts.get(project.district) || 1;
  const aDistMap = context.agencyDistrictCounts.get(project.implementing_agency);
  const agencyDistrictProjects = aDistMap ? aDistMap.get(project.district) || 0 : 0;

  const districtShare = Number(
    ((agencyDistrictProjects / distTotalProjects) * 100).toFixed(2)
  );

  return {
    agency_total_projects: totalProjects,
    agency_total_sanctioned_amount: totalSanctioned,
    agency_sector_count: distinctSectors,
    agency_district_share_percentage: districtShare,
  };
}

/**
 * Extracts Documentation features
 */
export function extractDocumentationFeatures(
  project: ProjectRecord,
  documents: DocumentRecord[]
): DocumentationFeatures {
  const totalCount = documents.length;
  const verifiedCount = documents.filter((d) => d.verification_status === "Verified").length;
  const missingCount = documents.filter((d) => d.verification_status === "Missing").length;
  const discrepancyCount = documents.filter(
    (d) => d.verification_status === "Discrepancy"
  ).length;

  const hasSanctionOrder = documents.some(
    (d) =>
      d.document_type.includes("Sanction Order") &&
      d.verification_status === "Verified"
  )
    ? 1
    : 0;

  const hasTechnicalEstimate = documents.some(
    (d) =>
      (d.document_type.includes("Detailed Project Report") ||
        d.document_type.includes("Technical Sanction")) &&
      d.verification_status === "Verified"
  )
    ? 1
    : 0;

  const hasStageCertificate = documents.some(
    (d) =>
      (d.document_type.includes("Inspection") ||
        d.document_type.includes("Stage") ||
        d.document_type.includes("Utilization")) &&
      d.verification_status === "Verified"
  )
    ? 1
    : 0;

  const completenessRatio =
    totalCount > 0 ? Number((verifiedCount / totalCount).toFixed(4)) : 0;

  return {
    document_count: totalCount,
    verified_document_count: verifiedCount,
    missing_document_count: missingCount,
    discrepancy_document_count: discrepancyCount,
    has_sanction_order: hasSanctionOrder,
    has_technical_estimate: hasTechnicalEstimate,
    has_stage_certificate: hasStageCertificate,
    documentation_completeness_ratio: completenessRatio,
  };
}

/**
 * Extracts Cross-Domain features combining financial, physical, and temporal dimensions
 */
export function extractCrossDomainFeatures(
  financial: FinancialFeatures,
  physical: PhysicalFeatures,
  temporal: TemporalFeatures,
  payment: PaymentFeatures,
  payments: PaymentRecord[],
  progressEvents: PhysicalProgressRecord[]
): CrossDomainFeatures {
  // Expenditure per 1% physical progress
  const expenditurePerProgressPoint =
    physical.reported_physical_progress > 0
      ? Number(
          (financial.expenditure_amount / physical.reported_physical_progress).toFixed(2)
        )
      : financial.expenditure_amount;

  // Financial progress % vs Physical progress %
  const financialProgressPct = financial.expenditure_to_sanction_ratio * 100;
  const finVsPhysGap = Number(
    (financialProgressPct - physical.reported_physical_progress).toFixed(2)
  );

  // Elapsed time ratio and gap
  const elapsedTimeRatio =
    physical.planned_duration_days > 0
      ? Number(
          (
            physical.actual_or_elapsed_duration_days / physical.planned_duration_days
          ).toFixed(4)
        )
      : 1.0;

  const timeVsPhysGap = Number(
    (elapsedTimeRatio * 100 - physical.reported_physical_progress).toFixed(2)
  );

  // Payment transactions per on-site inspection
  const paymentsPerProgressRatio =
    physical.progress_event_count > 0
      ? Number((payment.payment_count / physical.progress_event_count).toFixed(2))
      : payment.payment_count;

  // Check if any payment was disbursed before the first logged physical inspection
  let disbursementPriorToProgress = 0;
  if (payments.length > 0 && progressEvents.length > 0) {
    const earliestPaymentDate = [...payments].sort(
      (a, b) => Date.parse(a.payment_date) - Date.parse(b.payment_date)
    )[0].payment_date;
    const earliestProgressDate = [...progressEvents].sort(
      (a, b) => Date.parse(a.record_date) - Date.parse(b.record_date)
    )[0].record_date;

    if (Date.parse(earliestPaymentDate) < Date.parse(earliestProgressDate)) {
      disbursementPriorToProgress = 1;
    }
  } else if (payments.length > 0 && progressEvents.length === 0) {
    disbursementPriorToProgress = 1;
  }

  return {
    expenditure_per_progress_point: expenditurePerProgressPoint,
    financial_progress_vs_physical_progress_gap: finVsPhysGap,
    elapsed_time_ratio: elapsedTimeRatio,
    time_vs_physical_progress_gap: timeVsPhysGap,
    payments_per_progress_event_ratio: paymentsPerProgressRatio,
    disbursement_prior_to_progress_flag: disbursementPriorToProgress,
  };
}

/**
 * Master extraction function for a single ProjectRecord and its associated child entities.
 */
export function extractProjectFeatures(
  project: ProjectRecord,
  payments: PaymentRecord[],
  progressEvents: PhysicalProgressRecord[],
  documents: DocumentRecord[],
  context: GlobalFeatureContext
): FeatureRecord {
  const categorical = extractCategoricalFeatures(project);
  const financial = extractFinancialFeatures(project, payments);
  const physical = extractPhysicalFeatures(project, progressEvents);
  const temporal = extractTemporalFeatures(project, payments, progressEvents);
  const payment = extractPaymentFeatures(project, payments, physical);
  const contractor = extractContractorContextFeatures(project, context);
  const agency = extractAgencyContextFeatures(project, context);
  const documentation = extractDocumentationFeatures(project, documents);
  const cross_domain = extractCrossDomainFeatures(
    financial,
    physical,
    temporal,
    payment,
    payments,
    progressEvents
  );

  return {
    project_code: project.project_code,
    categorical,
    financial,
    physical,
    temporal,
    payment,
    contractor,
    agency,
    documentation,
    cross_domain,
    metadata: {
      feature_version: FEATURE_VERSION,
      schema_version: "1.0.0",
      source_database: "mplad_database.sqlite",
      reference_audit_date: REFERENCE_AUDIT_DATE,
    },
  };
}
