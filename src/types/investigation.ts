/**
 * Backwards compatibility re-export for Phase 5 types.
 * Canonical definitions reside in @/types/project-investigation.
 */
export * from "./project-investigation";

// Legacy aliases for components migrating to new contracts
export type {
  AnomalySignal as EvidenceSignalItem,
  DocumentEvidenceItem as DocumentArtifact,
  AuditTrailEntry as AuditTrailItem,
  PaymentReferenceRecord as FinancialLedgerItem,
} from "./project-investigation";
