import { DeterministicPRNG } from "./prng.ts";
import type {
  ProjectRecord,
  ConstituencyRecord,
  DistrictRecord,
  ImplementingAgencyRecord,
  ContractorRecord,
  PaymentRecord,
  PhysicalProgressRecord,
  DocumentRecord,
  ScenarioType,
  SyntheticDatasetBundle,
  ProjectStatus,
  VerificationStatus,
  DocumentationStatus,
} from "../types/project.ts";
import referenceData from "../../data/raw/reference_data.json" with { type: "json" };

export interface GeneratorOptions {
  seed?: number;
  totalProjects?: number;
}

export function generateSyntheticDataset(options: GeneratorOptions = {}): SyntheticDatasetBundle {
  const seed = options.seed ?? 26102;
  const totalProjects = options.totalProjects ?? 300;
  const prng = new DeterministicPRNG(seed);

  // 1. Build Reference Entities
  const constituencies: ConstituencyRecord[] = [];
  const districts: DistrictRecord[] = [];

  for (const s of referenceData.states) {
    for (const d of s.districts) {
      districts.push({
        code: d.code,
        name: d.name,
        state: s.state,
      });
      for (const c of d.constituencies) {
        constituencies.push({
          code: `CONST-${c.toUpperCase().replace(/\s+/g, "-")}`,
          name: c,
          state: s.state,
          district: d.name,
        });
      }
    }
  }

  const agencies: ImplementingAgencyRecord[] = referenceData.implementing_agencies.map((a) => ({
    code: a.code,
    name: a.name,
    agency_type: a.type,
    state: "Multi-State",
  }));

  const contractors: ContractorRecord[] = referenceData.contractors.map((c) => ({
    id: c.id,
    name: c.name,
    registration_number: c.reg,
    state: "National / State Registered",
  }));

  // 2. Scenario Distribution Planning
  // Target: 300 projects with realistic scenario distribution
  const scenarioDistribution: Record<ScenarioType, number> = {
    NORMAL: Math.floor(totalProjects * 0.60), // ~180
    DUPLICATE_SIGNAL: Math.floor(totalProjects * 0.05), // ~15
    EXPENDITURE_SHIFT: Math.floor(totalProjects * 0.05), // ~15
    TIMELINE_INCONSISTENCY: Math.floor(totalProjects * 0.05), // ~15
    PHYSICAL_FINANCIAL_MISMATCH: Math.floor(totalProjects * 0.06), // ~18
    PAYMENT_PATTERN_SIGNAL: Math.floor(totalProjects * 0.05), // ~15
    CONTRACTOR_CONCENTRATION: Math.floor(totalProjects * 0.05), // ~15
    MISSING_DOCUMENTATION: Math.floor(totalProjects * 0.05), // ~15
    MULTI_SIGNAL: 0, // remainder
  };

  const currentAssigned = Object.values(scenarioDistribution).reduce((a, b) => a + b, 0);
  scenarioDistribution.MULTI_SIGNAL = totalProjects - currentAssigned;

  const scenarioPool: ScenarioType[] = [];
  for (const [sc, count] of Object.entries(scenarioDistribution) as [ScenarioType, number][]) {
    for (let i = 0; i < count; i++) {
      scenarioPool.push(sc);
    }
  }
  const shuffledScenarios = prng.shuffle(scenarioPool);

  const projects: ProjectRecord[] = [];
  const payments: PaymentRecord[] = [];
  const progressEvents: PhysicalProgressRecord[] = [];
  const documents: DocumentRecord[] = [];

  let paymentCounter = 1;
  let progressCounter = 1;
  let documentCounter = 1;

  for (let i = 0; i < totalProjects; i++) {
    const projectIndex = i + 1;
    const projectCode = `MPLAD-DEMO-${String(projectIndex).padStart(6, "0")}`;
    const scenario = shuffledScenarios[i];

    // Pick State, District, Constituency, Block
    const stateObj = prng.choice(referenceData.states);
    const districtObj = prng.choice(stateObj.districts);
    const constituency = prng.choice(districtObj.constituencies);
    const block = prng.choice(districtObj.blocks);

    // Synthetic base coordinates for Indian districts
    const baseLat = stateObj.state === "Karnataka" ? 12.9 + prng.next() * 0.4 :
                    stateObj.state === "Maharashtra" ? 18.9 + prng.next() * 0.4 :
                    stateObj.state === "Delhi" ? 28.5 + prng.next() * 0.3 :
                    stateObj.state === "Tamil Nadu" ? 11.0 + prng.next() * 0.5 :
                    26.8 + prng.next() * 0.5; // UP

    const baseLng = stateObj.state === "Karnataka" ? 77.5 + prng.next() * 0.3 :
                    stateObj.state === "Maharashtra" ? 72.8 + prng.next() * 0.4 :
                    stateObj.state === "Delhi" ? 77.1 + prng.next() * 0.2 :
                    stateObj.state === "Tamil Nadu" ? 77.0 + prng.next() * 0.5 :
                    80.9 + prng.next() * 0.4; // UP

    // Sector & Work Category
    const sectorObj = prng.choice(referenceData.sectors);
    const workTitle = prng.choice(sectorObj.categories);
    const agency = prng.choice(agencies);

    // Contractor selection (Concentration scenario biases toward CON-001 or CON-002)
    let contractor = prng.choice(contractors);
    if (scenario === "CONTRACTOR_CONCENTRATION") {
      contractor = contractors[0]; // Venkateshwara Infrastructure Ltd
    }

    // Base financial figures (INR)
    const sanctionedAmount = prng.nextStep(sectorObj.cost_range[0], sectorObj.cost_range[1], 100000);

    // Dates generation: Year 2023 - 2024
    const recYear = 2023 + prng.nextInt(0, 1);
    const recMonth = prng.nextInt(1, 10);
    const recDay = prng.nextInt(1, 28);
    const recDate = `${recYear}-${String(recMonth).padStart(2, "0")}-${String(recDay).padStart(2, "0")}`;

    // Sanction date 15-45 days later
    const sanctionDayOffset = prng.nextInt(15, 45);
    const sanctionDateObj = new Date(new Date(recDate).getTime() + sanctionDayOffset * 86400000);
    const sanctionDate = sanctionDateObj.toISOString().split("T")[0];

    // Start date 10-30 days after sanction
    const startDayOffset = prng.nextInt(10, 30);
    const startDateObj = new Date(sanctionDateObj.getTime() + startDayOffset * 86400000);
    const startDate = startDateObj.toISOString().split("T")[0];

    // Planned completion 180-365 days after start
    const plannedDuration = prng.nextInt(180, 360);
    const plannedDateObj = new Date(startDateObj.getTime() + plannedDuration * 86400000);
    const plannedCompletionDate = plannedDateObj.toISOString().split("T")[0];
    const expectedCompletionDate = plannedCompletionDate;

    // Determine baseline status and financial execution
    let status: ProjectStatus = "In Progress";
    let releasedAmount = Math.round(sanctionedAmount * (prng.nextInt(50, 90) / 100) / 50000) * 50000;
    let expenditureAmount = Math.round(releasedAmount * (prng.nextInt(60, 95) / 100) / 50000) * 50000;
    let physicalProgress = prng.nextInt(40, 85);
    let actualCompletionDate: string | null = null;
    let verificationStatus: VerificationStatus = "Verified";
    let documentationStatus: DocumentationStatus = "Complete";
    let scenarioDescription = "Standard compliant project lifecycle with regular physical and financial milestones.";

    // Apply Scenario-Specific Ground Truth
    switch (scenario) {
      case "NORMAL":
        if (physicalProgress > 80 && prng.next() > 0.5) {
          status = "Completed";
          physicalProgress = 100;
          releasedAmount = sanctionedAmount;
          expenditureAmount = sanctionedAmount;
          actualCompletionDate = new Date(startDateObj.getTime() + (plannedDuration - 15) * 86400000).toISOString().split("T")[0];
        } else {
          status = "In Progress";
        }
        break;

      case "DUPLICATE_SIGNAL":
        scenarioDescription = "Geographic coordinates registered within 40m perimeter of previously executed civil asset.";
        verificationStatus = "Inspection Required";
        break;

      case "EXPENDITURE_SHIFT":
        // 95-100% expenditure recorded within initial 45 days of project start
        expenditureAmount = releasedAmount;
        scenarioDescription = "Unusual rapid disbursement shift: 100% expenditure recorded prior to midpoint stage review.";
        verificationStatus = "Inspection Required";
        break;

      case "TIMELINE_INCONSISTENCY":
        // Inverted milestone dates for testing
        scenarioDescription = "Ground truth anomaly: Start date registered 12 days prior to formal administrative sanction.";
        verificationStatus = "Documentation Flagged";
        break;

      case "PHYSICAL_FINANCIAL_MISMATCH":
        // 90-100% funds disbursed, but physical progress is under 30%
        releasedAmount = sanctionedAmount;
        expenditureAmount = Math.round(sanctionedAmount * 0.95);
        physicalProgress = prng.nextInt(15, 28);
        status = "Delayed";
        verificationStatus = "Inspection Required";
        scenarioDescription = "Severe physical-financial divergence: 95% funds expended but physical progress under 30%.";
        break;

      case "PAYMENT_PATTERN_SIGNAL":
        // Payments released without prerequisite stage completion certificate
        scenarioDescription = "Fund disbursement released without prerequisite engineering stage progress certificate.";
        verificationStatus = "Inspection Required";
        break;

      case "CONTRACTOR_CONCENTRATION":
        scenarioDescription = `Contractor concentration cluster: ${contractor.name} holds disproportionate share of works in ${districtObj.name}.`;
        verificationStatus = "Pending Review";
        break;

      case "MISSING_DOCUMENTATION":
        documentationStatus = "Missing Key Milestones";
        verificationStatus = "Documentation Flagged";
        scenarioDescription = "Statutory documentation gap: Mandatory stage completion certificate and UC-19B missing.";
        break;

      case "MULTI_SIGNAL":
        releasedAmount = sanctionedAmount;
        expenditureAmount = Math.round(sanctionedAmount * 0.98);
        physicalProgress = prng.nextInt(20, 35);
        documentationStatus = "Missing Key Milestones";
        verificationStatus = "Inspection Required";
        status = "Delayed";
        scenarioDescription = "Multi-signal compound risk: Low physical progress, rapid disbursement, and missing statutory certificates.";
        break;
    }

    const project: ProjectRecord = {
      project_code: projectCode,
      project_title: `${workTitle} (${block})`,
      recommendation_date: recDate,
      status,
      state: stateObj.state,
      constituency,
      district: districtObj.name,
      block_or_town: block,
      latitude: Number(baseLat.toFixed(6)),
      longitude: Number(baseLng.toFixed(6)),
      sector: sectorObj.name,
      work_category: workTitle,
      implementing_agency: agency.name,
      contractor_id: contractor.id,
      contractor_name: contractor.name,
      sanctioned_amount: sanctionedAmount,
      released_amount: releasedAmount,
      expenditure_amount: expenditureAmount,
      planned_completion_date: plannedCompletionDate,
      actual_or_reported_completion_date: actualCompletionDate,
      physical_progress: physicalProgress,
      sanction_date: sanctionDate,
      start_date: startDate,
      expected_completion_date: expectedCompletionDate,
      last_updated: "2026-09-04",
      verification_status: verificationStatus,
      documentation_status: documentationStatus,
      scenario_type: scenario,
      scenario_description: scenarioDescription,
    };

    projects.push(project);

    // 3. Generate Corroborating Payments
    const tranche1Amount = Math.round(expenditureAmount * 0.5);
    const tranche2Amount = expenditureAmount - tranche1Amount;

    payments.push({
      id: `PAY-${String(paymentCounter++).padStart(6, "0")}`,
      project_code: projectCode,
      payment_date: new Date(startDateObj.getTime() + 20 * 86400000).toISOString().split("T")[0],
      amount: tranche1Amount,
      tranche_number: 1,
      reference_number: `PFMS-TR-${projectIndex}-01`,
      status: "Disbursed",
    });

    if (tranche2Amount > 0) {
      payments.push({
        id: `PAY-${String(paymentCounter++).padStart(6, "0")}`,
        project_code: projectCode,
        payment_date: new Date(startDateObj.getTime() + 90 * 86400000).toISOString().split("T")[0],
        amount: tranche2Amount,
        tranche_number: 2,
        reference_number: `PFMS-TR-${projectIndex}-02`,
        status: scenario === "PAYMENT_PATTERN_SIGNAL" ? "Pending Clearance" : "Disbursed",
      });
    }

    // 4. Generate Physical Progress Logs
    progressEvents.push({
      id: `PROG-${String(progressCounter++).padStart(6, "0")}`,
      project_code: projectCode,
      record_date: new Date(startDateObj.getTime() + 30 * 86400000).toISOString().split("T")[0],
      stage_name: "Excavation & Plinth Foundation",
      progress_percentage: Math.min(30, physicalProgress),
      inspection_officer: `Assistant Engineer, ${agency.name}`,
    });

    if (physicalProgress > 30) {
      progressEvents.push({
        id: `PROG-${String(progressCounter++).padStart(6, "0")}`,
        project_code: projectCode,
        record_date: new Date(startDateObj.getTime() + 100 * 86400000).toISOString().split("T")[0],
        stage_name: "Superstructure & Core Masonry",
        progress_percentage: Math.min(70, physicalProgress),
        inspection_officer: `Executive Engineer, ${agency.name}`,
      });
    }

    // 5. Generate Statutory Documents
    documents.push({
      id: `DOC-${String(documentCounter++).padStart(6, "0")}`,
      project_code: projectCode,
      document_type: "Sanction Order",
      document_name: `Administrative_Sanction_${projectCode}.pdf`,
      upload_date: sanctionDate,
      verification_status: "Verified",
    });

    documents.push({
      id: `DOC-${String(documentCounter++).padStart(6, "0")}`,
      project_code: projectCode,
      document_type: "Technical Estimate",
      document_name: `DPR_Detailed_Estimate_${projectCode}.pdf`,
      upload_date: sanctionDate,
      verification_status: "Verified",
    });

    documents.push({
      id: `DOC-${String(documentCounter++).padStart(6, "0")}`,
      project_code: projectCode,
      document_type: "Stage Completion Certificate",
      document_name: `Stage_Progress_Certificate_${projectCode}.pdf`,
      upload_date: new Date(startDateObj.getTime() + 95 * 86400000).toISOString().split("T")[0],
      verification_status:
        scenario === "MISSING_DOCUMENTATION" || scenario === "MULTI_SIGNAL"
          ? "Missing"
          : "Verified",
    });
  }

  return {
    metadata: {
      dataset_name: "MPLAD SENTINEL Canonical Synthetic Dataset",
      version: "1.0.0",
      generated_at: new Date().toISOString(),
      seed,
      record_count: projects.length,
      disclaimer: "DEMO DATA — NOT OFFICIAL GOVERNMENT DATA. Scenario labels represent synthetic ground truth for testing future detection models.",
      scenario_distribution: scenarioDistribution,
    },
    constituencies,
    districts,
    implementing_agencies: agencies,
    contractors,
    projects,
    payments,
    physical_progress_events: progressEvents,
    documents,
  };
}
