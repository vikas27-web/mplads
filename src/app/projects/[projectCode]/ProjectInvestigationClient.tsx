"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ProjectInvestigation,
  AuditWorkflowStatus,
  HumanAuditActionType,
  AuditorNote,
  AuditTrailEntry,
} from "@/types/project-investigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Button } from "@/components/ui/Button";
import { HumanVerificationPanel } from "@/components/projects/HumanVerificationPanel";
import { AuditorNotes } from "@/components/projects/AuditorNotes";
import { InvestigationAuditTrail } from "@/components/projects/InvestigationAuditTrail";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  UserCheck,
  Coins,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Database,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

import { saveProjectAuditorNote, saveProjectAuditorReview } from "@/lib/api-client";

interface ProjectInvestigationClientProps {
  initialData: ProjectInvestigation;
}

export function ProjectInvestigationClient({ initialData }: ProjectInvestigationClientProps) {
  const router = useRouter();
  const [investigation, setInvestigation] = useState<ProjectInvestigation>(initialData);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Parse clean MP name from title
  const mpName =
    investigation.title
      .replace(/^MPLAD Allocation Limit — Hon'ble MP\s*/i, "")
      .replace(/\s*\([^)]*\)\s*$/, "") || investigation.title;

  const allocatedAmountInCr = (investigation.sanctionedAmount / 10000000).toFixed(2);
  const hasAnomaly = investigation.signals && investigation.signals.length > 0;

  // Real human verification actions persisting to backend database
  const handleWorkflowAction = async (
    actionType: HumanAuditActionType,
    newStatus: AuditWorkflowStatus,
    actionLabel: string
  ) => {
    const timestamp = new Date().toISOString();
    const newEntry: AuditTrailEntry = {
      id: `EVT-${Date.now()}`,
      timestamp,
      actor: "Auditor Desk",
      actionType: actionLabel,
      notes: `Review status updated to "${newStatus}". Action recorded in audit trail.`,
      isSessionAction: false,
    };

    setInvestigation((prev) => ({
      ...prev,
      status: newStatus,
      auditTrail: [newEntry, ...prev.auditTrail],
    }));

    try {
      await saveProjectAuditorReview(investigation.projectCode, {
        status: newStatus,
        actionType,
        actionLabel,
        notes: `Review status updated to "${newStatus}". Action recorded in audit trail.`,
        actor: "Auditor Desk",
      });
    } catch (err) {
      console.error("Failed to persist workflow action to backend:", err);
    }
  };

  // Recording auditor notes into backend database
  const handleAddAuditorNote = async (newNote: AuditorNote) => {
    const trailFromNote: AuditTrailEntry = {
      id: `EVT-NOTE-${Date.now()}`,
      timestamp: newNote.timestamp,
      actor: newNote.author,
      actionType: "Auditor Note Added",
      notes: newNote.note,
      isSessionAction: false,
    };

    setInvestigation((prev) => ({
      ...prev,
      auditorNotes: [newNote, ...prev.auditorNotes],
      auditTrail: [trailFromNote, ...prev.auditTrail],
    }));

    try {
      await saveProjectAuditorNote(investigation.projectCode, {
        author: newNote.author,
        note: newNote.note,
      });
    } catch (err) {
      console.error("Failed to persist auditor note to backend:", err);
    }
  };

  // Source Data Audit Fields
  const sourceDataRows = [
    { field: "Allocated Amount Limit", value: `${formatCurrency(investigation.sanctionedAmount)} (₹${allocatedAmountInCr} Cr)`, availability: "Available", type: "AVAILABLE" },
    { field: "State / Union Territory", value: investigation.state, availability: "Available", type: "AVAILABLE" },
    { field: "Parliamentary Constituency", value: investigation.constituency, availability: "Available", type: "AVAILABLE" },
    { field: "Hon'ble Member of Parliament", value: mpName, availability: "Available", type: "AVAILABLE" },
    { field: "Implementing / Nodal Agency", value: investigation.implementingAgency || "District Collectorate / Parliamentary Nodal Authority", availability: "Available", type: "AVAILABLE" },
    { field: "Contractor Details", value: "Not available in source dataset", availability: "Not available", type: "NOT_AVAILABLE" },
    { field: "Physical Work Progress", value: "Not available in source dataset", availability: "Not available", type: "NOT_AVAILABLE" },
    { field: "Itemized Expenditure Vouchers", value: "Not available in source dataset", availability: "Not available", type: "NOT_AVAILABLE" },
    { field: "Physical Inspection Logs", value: "Not available in source dataset", availability: "Not available", type: "NOT_AVAILABLE" },
    { field: "Statutory DPR / Document Attachments", value: "Not available in source dataset", availability: "Not available", type: "NOT_AVAILABLE" },
  ];

  return (
    <PageContainer showDisclaimer={false} showAiNotice={false}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Navigation Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            paddingBottom: "8px",
            borderBottom: "1px solid #DDE2EA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/projects"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#0080FF",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <ArrowLeft style={{ width: "14px", height: "14px" }} />
              <span>Back to Project Explorer</span>
            </Link>
            <span style={{ color: "#DDE2EA" }}>•</span>
            <Link
              href="/investigations"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#6B7A8E",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <span>Audit Queue</span>
            </Link>
          </div>
        </div>

        {/* 1. HEADER */}
        <Card variant="default">
          <CardContent style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: "#EBF5FF",
                      color: "#0080FF",
                      border: "1px solid #B3D7FF",
                    }}
                  >
                    {investigation.projectCode}
                  </span>
                  <SeverityBadge severity={investigation.severity} size="md" />
                </div>

                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0F1724", margin: 0, lineHeight: 1.25 }}>
                  Hon&apos;ble MP {mpName}
                </h1>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "16px",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                    <MapPin style={{ width: "15px", height: "15px", color: "#0080FF" }} />
                    {investigation.constituency} • {investigation.district} • {investigation.state}
                  </span>
                  <span style={{ color: "#CBD5E1" }}>|</span>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>
                    Source: SIH26102 official dataset (Allocated Limit for Honble MPs.csv)
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  Print Dossier
                </Button>
                <Button variant="secondary" size="sm" onClick={() => router.push("/projects")}>
                  Project Explorer
                </Button>
              </div>
            </div>

            {/* Responsible AI Notice */}
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "5px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                fontSize: "11px",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Info style={{ width: "14px", height: "14px", color: "#0080FF", flexShrink: 0 }} />
              <span>
                <strong>Responsible AI Notice:</strong> Anomaly signal does not equal fraud. Evidence requires human verification.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. ALLOCATION SUMMARY (Primary large card + 3 small cards) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {/* Primary Large Card */}
          <Card variant="default" style={{ gridColumn: "span 1", borderLeft: "4px solid #0080FF" }}>
            <CardContent style={{ padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "6px" }}>
                <Coins style={{ width: "15px", height: "15px", color: "#0080FF" }} />
                Allocated Limit (Official Source)
              </span>
              <div style={{ fontSize: "28px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#0F1724", marginTop: "8px", lineHeight: 1.1 }}>
                ₹{allocatedAmountInCr} Cr
              </div>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
                {formatCurrency(investigation.sanctionedAmount)}
              </p>
              <span style={{ fontSize: "10px", color: "#0080FF", fontWeight: 600, display: "inline-block", marginTop: "6px" }}>
                Verified Official Allocation Ceiling
              </span>
            </CardContent>
          </Card>

          {/* State Card */}
          <Card variant="default">
            <CardContent style={{ padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                State / UT
              </span>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0F1724", marginTop: "6px" }}>
                {investigation.state}
              </div>
              <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0" }}>
                Parliamentary Allocation Node
              </p>
            </CardContent>
          </Card>

          {/* Constituency Card */}
          <Card variant="default">
            <CardContent style={{ padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                Constituency
              </span>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0F1724", marginTop: "6px" }}>
                {investigation.constituency}
              </div>
              <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0" }}>
                Lok Sabha Parliamentary Seat
              </p>
            </CardContent>
          </Card>

          {/* Member of Parliament Card */}
          <Card variant="default">
            <CardContent style={{ padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                Member of Parliament
              </span>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0F1724", marginTop: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {mpName}
              </div>
              <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0" }}>
                18th Lok Sabha Representative
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 3. AUDIT SIGNAL */}
        <Card variant="default">
          <CardHeader style={{ borderBottom: "1px solid #EDF1F6", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724", display: "flex", alignItems: "center", gap: "8px" }}>
                {hasAnomaly ? (
                  <AlertCircle style={{ width: "16px", height: "16px", color: "#C0392B" }} />
                ) : (
                  <CheckCircle2 style={{ width: "16px", height: "16px", color: "#276749" }} />
                )}
                Audit Signal & Review Status
              </CardTitle>
              <Badge variant={hasAnomaly ? "anomaly" : "success"} size="sm">
                {hasAnomaly ? "Potential Anomaly Signal" : "Routine Monitoring Baseline"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent style={{ paddingTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Review Priority:</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "4px",
                    background: hasAnomaly ? "#FFF5F5" : "#F0FDF4",
                    color: hasAnomaly ? "#C0392B" : "#166534",
                    border: hasAnomaly ? "1px solid #FED7D7" : "1px solid #BBF7D0",
                  }}
                >
                  {investigation.reviewPriority || "Desk Documentation Review"}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                leftIcon={showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              >
                {showTechnicalDetails ? "Hide Technical Details" : "Review Technical Evidence"}
              </Button>
            </div>

            <p style={{ fontSize: "13px", color: "#334155", lineHeight: 1.5, margin: 0 }}>
              {hasAnomaly
                ? (investigation.signals[0]?.explanation || "Constituency allocation ceiling differs materially from the national baseline reference. Recommended for administrative reconciliation of carried-over balances.")
                : "Constituency allocation limit aligns with standard parliamentary cycle entitlement. Standard routine documentation review applies."}
            </p>
          </CardContent>
        </Card>

        {/* 4. SOURCE DATA (Clean Compact Table) */}
        <Card variant="default">
          <CardHeader style={{ borderBottom: "1px solid #EDF1F6", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724", display: "flex", alignItems: "center", gap: "8px" }}>
                <Database style={{ width: "16px", height: "16px", color: "#0080FF" }} />
                Source Data & Operational Semantics
              </CardTitle>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                Official SIH26102 Source Attributes
              </span>
            </div>
          </CardHeader>
          <CardContent style={{ paddingTop: "12px", paddingBottom: "12px" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #DDE2EA", textAlign: "left", color: "#64748B" }}>
                    <th style={{ padding: "8px 12px", fontWeight: 600 }}>Field Name</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600 }}>Recorded Value</th>
                    <th style={{ padding: "8px 12px", fontWeight: 600, textAlign: "right" }}>Data Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceDataRows.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        background: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                      }}
                    >
                      <td style={{ padding: "9px 12px", fontWeight: 600, color: "#1E293B" }}>
                        {row.field}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          fontFamily: row.type === "AVAILABLE" ? "JetBrains Mono, monospace" : "inherit",
                          color: row.type === "NOT_AVAILABLE" ? "#94A3B8" : "#0F172A",
                          fontStyle: row.type === "NOT_AVAILABLE" ? "italic" : "normal",
                        }}
                      >
                        {row.value}
                      </td>
                      <td style={{ padding: "9px 12px", textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: "4px",
                            background:
                              row.type === "AVAILABLE"
                                ? "#ECFDF5"
                                : row.type === "DERIVED"
                                ? "#EFF6FF"
                                : "#F1F5F9",
                            color:
                              row.type === "AVAILABLE"
                                ? "#065F46"
                                : row.type === "DERIVED"
                                ? "#1E40AF"
                                : "#64748B",
                            border:
                              row.type === "AVAILABLE"
                                ? "1px solid #A7F3D0"
                                : row.type === "DERIVED"
                                ? "1px solid #BFDBFE"
                                : "1px solid #E2E8F0",
                          }}
                        >
                          {row.availability}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 5. EVIDENCE & TECHNICAL DETAILS (Collapsed by default) */}
        {showTechnicalDetails && (
          <Card variant="default" style={{ border: "1px solid #BFDBFE", background: "#F8FAFC" }}>
            <CardHeader style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <CardTitle style={{ fontSize: "13px", fontWeight: 700, color: "#1E3A8A" }}>
                  Evidence & Technical Detection Parameters
                </CardTitle>
                <span style={{ fontSize: "10px", color: "#64748B", fontFamily: "JetBrains Mono, monospace" }}>
                  Phase 8/12 Detector Matrix
                </span>
              </div>
            </CardHeader>
            <CardContent style={{ paddingTop: "14px", display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px" }}>
              {hasAnomaly ? (
                investigation.signals.map((sig, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "6px",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "#0F172A", fontFamily: "JetBrains Mono, monospace" }}>
                        {sig.detectorId || "RULE_ALLOCATION_LIMIT_OUTLIER"}
                      </span>
                      <SeverityBadge severity={sig.severity || "LOW"} size="sm" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", color: "#475569" }}>
                      <div>Detector Version: <strong>{sig.detectorVersion || "1.0.0"}</strong></div>
                      <div>Feature Version: <strong>{sig.featureVersion || "1.0.0"}</strong></div>
                      <div>Observed Value: <strong>{sig.observedValue || "—"}</strong></div>
                      <div>Reference Baseline: <strong>{sig.referenceValue || "₹15.32 Cr (National Median)"}</strong></div>
                      <div>Direction: <strong>{sig.direction || "Positive Outlier"}</strong></div>
                      <div>Affected Features: <strong>{sig.affectedFeatures?.join(", ") || "allocation_limit"}</strong></div>
                      <div>Timestamp: <strong>{sig.generatedAt || "04 Sept 2026"}</strong></div>
                      <div>API Source: <strong>GET /api/projects/{investigation.projectCode}</strong></div>
                    </div>

                    {sig.evidenceList && sig.evidenceList.length > 0 && (
                      <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #E2E8F0" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748B" }}>Observed Thresholds:</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                          {sig.evidenceList.map((ev, eIdx) => (
                            <div key={eIdx} style={{ fontSize: "11px", color: "#334155" }}>
                              • <strong>{ev.feature}:</strong> Observed: {ev.observedValue} | Baseline: {ev.referenceValue} ({ev.direction})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ color: "#64748B", fontStyle: "italic" }}>
                  Standard baseline: No technical outlier flags generated. Statistical dispersion within normal MAD bounds.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 6. Human Verification Panel & Consequent Action Confirmation */}
        <HumanVerificationPanel
          currentStatus={investigation.status}
          onAction={handleWorkflowAction}
        />

        {/* 7. Timeline and Audit Trail */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          <InvestigationAuditTrail auditTrail={investigation.auditTrail} />
          <AuditorNotes notes={investigation.auditorNotes} onAddNote={handleAddAuditorNote} />
        </div>
      </div>
    </PageContainer>
  );
}
