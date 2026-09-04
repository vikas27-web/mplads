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
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Button } from "@/components/ui/Button";
import { DemoDisclaimer } from "@/components/ui/DemoDisclaimer";
import { ResponsibleAiBanner } from "@/components/ui/ResponsibleAiBanner";
import { InvestigationSignalPanel } from "@/components/projects/InvestigationSignalPanel";
import { InvestigationEvidence } from "@/components/projects/InvestigationEvidence";
import { InvestigationTimeline } from "@/components/projects/InvestigationTimeline";
import { HumanVerificationPanel } from "@/components/projects/HumanVerificationPanel";
import { AuditorNotes } from "@/components/projects/AuditorNotes";
import { InvestigationAuditTrail } from "@/components/projects/InvestigationAuditTrail";
import { formatDate } from "@/lib/formatters";
import { ArrowLeft, Building2, MapPin, Tag, Calendar, UserCheck } from "lucide-react";

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

        {/* SECTION 8: Why This Was Flagged — Signal Panel */}
        <InvestigationSignalPanel signals={investigation.signals} />

        {/* SECTION 11 & 12: Human Verification Panel & Consequent Action Confirmation */}
        <HumanVerificationPanel
          currentStatus={investigation.status}
          onAction={handleWorkflowAction}
        />

        {/* SECTION 9: Evidence Section (Financial, Physical, Document) */}
        <InvestigationEvidence
          financialEvidence={investigation.financialEvidence}
          physicalVerificationEvidence={investigation.physicalVerificationEvidence}
          documentEvidence={investigation.documentEvidence}
        />

        {/* SECTION 10 & 14: Timeline and Audit Trail */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          <InvestigationTimeline events={investigation.timelineEvents} />
          <InvestigationAuditTrail auditTrail={investigation.auditTrail} />
        </div>

        {/* SECTION 13: Auditor Notes */}
        <AuditorNotes
          notes={investigation.auditorNotes}
          onAddNote={handleAddAuditorNote}
        />
      </div>
    </PageContainer>
  );
}
