/**
 * MPLAD SENTINEL — Phase 7 Feature Pipeline
 * End-to-end extraction, validation, and export pipeline.
 *
 * Responsibilities:
 * 1. Load canonical data from SQLite ProjectRepository
 * 2. Construct global context (market share, district distributions)
 * 3. Extract strongly-typed, deterministic features for each project
 * 4. Validate all records against strict domain bounds and anti-leakage invariants
 * 5. Export machine-readable feature bundle to data/processed/project_features.json
 */

import fs from "node:fs";
import path from "node:path";
import { ProjectRepository } from "../repository/projectRepository.ts";
import {
  type FeatureRecord,
  type FeatureDatasetBundle,
  FEATURE_VERSION,
  REFERENCE_AUDIT_DATE,
} from "./types.ts";
import {
  buildGlobalContext,
  extractProjectFeatures,
  type GlobalFeatureContext,
} from "./extractor.ts";
import { validateFeatureDataset, validateFeatureRecord } from "./validator.ts";
import type {
  PaymentRecord,
  PhysicalProgressRecord,
  DocumentRecord,
} from "../types/project.ts";

export interface PipelineOptions {
  repo?: ProjectRepository;
  outputPath?: string;
}

/**
 * Generates feature record for a single project by its project code
 */
export function generateProjectFeatures(
  projectCode: string,
  repo?: ProjectRepository,
  providedContext?: GlobalFeatureContext
): FeatureRecord | null {
  const repository = repo || new ProjectRepository();
  const project = repository.getProjectByCode(projectCode);
  if (!project) return null;

  const payments = repository.getProjectPayments(projectCode);
  const progress = repository.getProjectProgress(projectCode);
  const documents = repository.getProjectDocuments(projectCode);

  let context = providedContext;
  if (!context) {
    const allProjects = repository.getAllProjects();
    context = buildGlobalContext(allProjects);
  }

  const featureRecord = extractProjectFeatures(
    project,
    payments,
    progress,
    documents,
    context
  );

  const validation = validateFeatureRecord(featureRecord);
  if (!validation.valid) {
    throw new Error(
      `Feature validation failed for project ${projectCode}: ${validation.errors.join("; ")}`
    );
  }

  return featureRecord;
}

/**
 * Generates features for all projects in the database with pre-aggregated batch loading.
 */
export function generateAllProjectFeatures(
  repo?: ProjectRepository
): FeatureDatasetBundle {
  const repository = repo || new ProjectRepository();

  // 1. Load data from SQLite
  const allProjects = repository.getAllProjects();
  const allPayments = repository.getAllPayments();
  const allProgress = repository.getAllProgress();
  const allDocuments = repository.getAllDocuments();

  // 2. Index related child records by project_code for O(1) retrieval
  const paymentsByProject = new Map<string, PaymentRecord[]>();
  for (const pay of allPayments) {
    if (!paymentsByProject.has(pay.project_code)) {
      paymentsByProject.set(pay.project_code, []);
    }
    paymentsByProject.get(pay.project_code)!.push(pay);
  }

  const progressByProject = new Map<string, PhysicalProgressRecord[]>();
  for (const prog of allProgress) {
    if (!progressByProject.has(prog.project_code)) {
      progressByProject.set(prog.project_code, []);
    }
    progressByProject.get(prog.project_code)!.push(prog);
  }

  const documentsByProject = new Map<string, DocumentRecord[]>();
  for (const doc of allDocuments) {
    if (!documentsByProject.has(doc.project_code)) {
      documentsByProject.set(doc.project_code, []);
    }
    documentsByProject.get(doc.project_code)!.push(doc);
  }

  // 3. Construct global contextual index
  const globalContext = buildGlobalContext(allProjects);

  // 4. Extract features for every project
  const featureRecords: FeatureRecord[] = [];
  for (const project of allProjects) {
    const payments = paymentsByProject.get(project.project_code) || [];
    const progress = progressByProject.get(project.project_code) || [];
    const documents = documentsByProject.get(project.project_code) || [];

    const record = extractProjectFeatures(
      project,
      payments,
      progress,
      documents,
      globalContext
    );
    featureRecords.push(record);
  }

  // 5. Validate entire feature set
  const validationResult = validateFeatureDataset(featureRecords);
  if (!validationResult.valid) {
    throw new Error(
      `Dataset feature validation failed! ${validationResult.invalidCount} invalid records: ` +
        JSON.stringify(validationResult.errors.slice(0, 3))
    );
  }

  // 6. Return typed bundle with deterministic metadata
  return {
    metadata: {
      dataset_name: "MPLAD_PROJECT_FEATURES",
      feature_version: FEATURE_VERSION,
      generated_at: "2026-09-04T00:00:00.000Z", // Deterministic timestamp for byte-for-byte reproducibility
      record_count: featureRecords.length,
      disclaimer:
        "DESCRIPTIVE FEATURES ONLY — NOT AN ANOMALY DETECTION DECISION. Ground-truth scenarios strictly excluded.",
    },
    features: featureRecords,
  };
}

/**
 * Executes full pipeline and writes the processed JSON artifact to disk.
 */
export function exportProjectFeatures(options: PipelineOptions = {}): {
  outputPath: string;
  recordCount: number;
} {
  const bundle = generateAllProjectFeatures(options.repo);

  const targetPath =
    options.outputPath ||
    path.join(process.cwd(), "data", "processed", "project_features.json");

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(targetPath, JSON.stringify(bundle, null, 2), "utf8");

  return {
    outputPath: targetPath,
    recordCount: bundle.features.length,
  };
}
