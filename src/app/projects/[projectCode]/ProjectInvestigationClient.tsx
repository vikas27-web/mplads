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
import { DemoDisclaimer } from "@/components/ui/DemoDisclaimer";
import { InvestigationSignalPanel } from "@/components/projects/InvestigationSignalPanel";
import { InvestigationEvidence } from "@/components/projects/InvestigationEvidence";
import { InvestigationTimeline } from "@/components/projects/InvestigationTimeline";
import { HumanVerificationPanel } from "@/components/projects/HumanVerificationPanel";
import { AuditorNotes } from "@/components/projects/AuditorNotes";
import { InvestigationAuditTrail } from "@/components/projects/InvestigationAuditTrail";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Tag,
  Calendar,
  UserCheck,
  Coins,
  TrendingUp,
  Clock,
  ShieldAlert,
  FileCheck2,
  Layers,
} from "lucide-react";

import { saveProjectAuditorNote, saveProjectAuditorReview } from "@/lib/api-client";

interface ProjectInvestigationClientProps {
  initialData: ProjectInvestigation;
}

export function ProjectInvestigationClient({ initialData }: ProjectInvestigationClientProps) {
  const router = useRouter();
  const [investigation, setInvestigation] = useState<ProjectInvestigation>(initialData);

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

    // Persist to backend database via API
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

    // Persist to backend database via API
    try {
      await saveProjectAuditorNote(investigation.projectCode, {
        author: newNote.author,
        note: newNote.note,
      });
    } catch (err) {
      console.error("Failed to persist auditor note to backend:", err);
    }
  };

  return (
    <PageContainer
      showDisclaimer={false}
      showAiNotice={false}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Navigation Breadcrumb & Disclaimers Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            paddingBottom: "12px",
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
            <span style={{ color: "#DDE2EA" }}>|</span>
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
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            <DemoDisclaimer />
          </div>
        </div>

        {/* SECTION A: Investigation Header Card */}
        <Card variant="default">
          <CardContent style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              {/* Title & Metadata */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "280px" }}>
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
                  <Badge variant="info" size="md">
                    {investigation.status}
                  </Badge>
                  {investigation.reviewPriority && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#B76E00",
                        fontWeight: 600,
                        background: "#FFF8E6",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: "1px solid #FFE399",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <ShieldAlert style={{ width: "12px", height: "12px" }} />
                      {investigation.reviewPriority}
                    </span>
                  )}
                </div>

                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0F1724", margin: 0, lineHeight: 1.3 }}>
                  {investigation.title}
                </h1>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "16px",
                    fontSize: "12px",
                    color: "#6B7A8E",
                    paddingTop: "4px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin style={{ width: "14px", height: "14px", color: "#6B7A8E" }} />
                    {investigation.constituency}, {investigation.district} ({investigation.state})
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Tag style={{ width: "14px", height: "14px", color: "#6B7A8E" }} />
                    Sector: <strong style={{ color: "#3D4B5C" }}>{investigation.sector}</strong>
                  </span>
                  {investigation.contractorName && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Building2 style={{ width: "14px", height: "14px", color: "#6B7A8E" }} />
                      Contractor: <strong style={{ color: "#3D4B5C" }}>{investigation.contractorName}</strong>
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Calendar style={{ width: "14px", height: "14px", color: "#6B7A8E" }} />
                    Last Updated:{" "}
                    <strong style={{ fontFamily: "JetBrains Mono, monospace", color: "#3D4B5C" }}>
                      {formatDate(investigation.lastUpdated)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Print Dossier
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push("/projects")}
                >
                  Project Explorer
                </Button>
              </div>
            </div>

            {/* Persistent Responsible AI Notice */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                background: "#EBF5FF",
                border: "1px solid #B3D7FF",
                fontSize: "12px",
                color: "#004799",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <UserCheck style={{ width: "15px", height: "15px", color: "#0080FF", flexShrink: 0, marginTop: "1px" }} />
              <p style={{ margin: 0, lineHeight: 1.45 }}>
                <strong>Responsible AI Notice:</strong> Anomaly signal does not equal fraud. Physical verification & human investigation required.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION B: Canonical Project Information & Execution Status */}
        <Card variant="default">
          <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                Canonical Project Information & Execution Overview
              </CardTitle>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#6B7A8E",
                  background: "#F8F9FB",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  border: "1px solid #DDE2EA",
                }}
              >
                Canonical SQLite Record (GET /api/projects/{investigation.projectCode})
              </span>
            </div>
          </CardHeader>
          <CardContent style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Financial & Physical Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #DDE2EA" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Coins style={{ width: "12px", height: "12px", color: "#0080FF" }} />
                  Sanctioned Amount
                </span>
                <p style={{ fontSize: "16px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#0F1724", margin: "6px 0 0" }}>
                  {formatCurrency(investigation.sanctionedAmount)}
                </p>
              </div>

              <div style={{ padding: "12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #DDE2EA" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Coins style={{ width: "12px", height: "12px", color: "#00875A" }} />
                  Released Amount
                </span>
                <p style={{ fontSize: "16px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#00875A", margin: "6px 0 0" }}>
                  {formatCurrency(investigation.releasedAmount || 0)}
                </p>
              </div>

              <div style={{ padding: "12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #DDE2EA" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "4px" }}>
                  <TrendingUp style={{ width: "12px", height: "12px", color: "#DE350B" }} />
                  Expenditure Amount
                </span>
                <p style={{ fontSize: "16px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#0F1724", margin: "6px 0 0" }}>
                  {formatCurrency(investigation.expenditureAmount)}
                </p>
              </div>

              <div style={{ padding: "12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #DDE2EA" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FileCheck2 style={{ width: "12px", height: "12px", color: "#0080FF" }} />
                  Physical Progress
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "6px" }}>
                  <p style={{ fontSize: "16px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#0F1724", margin: 0 }}>
                    {investigation.physicalProgress !== undefined ? `${investigation.physicalProgress}%` : "—"}
                  </p>
                  <span style={{ fontSize: "11px", color: "#6B7A8E" }}>completed</span>
                </div>
              </div>
            </div>

            {/* Governance Details & Dates Table Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", fontSize: "12px" }}>
              <div style={{ padding: "12px", background: "#FFFFFF", borderRadius: "6px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0F3F7", paddingBottom: "6px" }}>
                  <span style={{ color: "#6B7A8E" }}>Implementing Agency:</span>
                  <strong style={{ color: "#0F1724" }}>{investigation.implementingAgency}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0F3F7", paddingBottom: "6px" }}>
                  <span style={{ color: "#6B7A8E" }}>Contractor Name:</span>
                  <strong style={{ color: "#0F1724" }}>{investigation.contractorName || "Direct Departmental Execution"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0F3F7", paddingBottom: "6px" }}>
                  <span style={{ color: "#6B7A8E" }}>Governance Stage:</span>
                  <span style={{ fontWeight: 600, color: "#0080FF" }}>{investigation.projectStatus || "Sanctioned"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6B7A8E" }}>Work Category:</span>
                  <span style={{ color: "#3D4B5C" }}>{investigation.workCategory || investigation.sector}</span>
                </div>
              </div>

              <div style={{ padding: "12px", background: "#FFFFFF", borderRadius: "6px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0F3F7", paddingBottom: "6px" }}>
                  <span style={{ color: "#6B7A8E" }}>Recommendation Date:</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#0F1724" }}>
                    {investigation.recommendationDate ? formatDate(investigation.recommendationDate) : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0F3F7", paddingBottom: "6px" }}>
                  <span style={{ color: "#6B7A8E" }}>Sanction Date:</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#0F1724" }}>
                    {formatDate(investigation.sanctionDate)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0F3F7", paddingBottom: "6px" }}>
                  <span style={{ color: "#6B7A8E" }}>Planned Completion:</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#0F1724" }}>
                    {investigation.plannedCompletionDate ? formatDate(investigation.plannedCompletionDate) : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6B7A8E" }}>Reported Completion:</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#0F1724" }}>
                    {investigation.actualCompletionDate ? formatDate(investigation.actualCompletionDate) : "In Progress"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION C: Why This Was Flagged — Anomaly Signals & Mathematical Evidence */}
        <InvestigationSignalPanel signals={investigation.signals} />

        {/* SECTION D: Human Verification Panel & Consequent Action Confirmation */}
        <HumanVerificationPanel
          currentStatus={investigation.status}
          onAction={handleWorkflowAction}
        />

        {/* SECTION E: Evidence Section (Financial, Physical, Document) */}
        <InvestigationEvidence
          financialEvidence={investigation.financialEvidence}
          physicalVerificationEvidence={investigation.physicalVerificationEvidence}
          documentEvidence={investigation.documentEvidence}
        />

        {/* SECTION F & G: Timeline and Audit Trail */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          <InvestigationTimeline events={investigation.timelineEvents} />
          <InvestigationAuditTrail auditTrail={investigation.auditTrail} />
        </div>

        {/* SECTION H: Auditor Notes */}
        <AuditorNotes
          notes={investigation.auditorNotes}
          onAddNote={handleAddAuditorNote}
        />
      </div>
    </PageContainer>
  );
}
