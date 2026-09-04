"use client";

import React, { useState } from "react";
import { AuditWorkflowStatus, HumanAuditActionType } from "@/types/project-investigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  ShieldAlert,
  ClipboardCheck,
  Calendar,
  FileQuestion,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface HumanVerificationPanelProps {
  currentStatus: AuditWorkflowStatus | string;
  onAction: (actionType: HumanAuditActionType, newStatus: AuditWorkflowStatus, actionLabel: string) => void;
}

export const HumanVerificationPanel: React.FC<HumanVerificationPanelProps> = ({
  currentStatus,
  onAction,
}) => {
  const { showToast } = useToast();
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [dismissReason, setDismissReason] = useState("");

  const handleSimpleAction = (
    actionType: HumanAuditActionType,
    newStatus: AuditWorkflowStatus,
    actionLabel: string,
    actionDetail: string
  ) => {
    onAction(actionType, newStatus, actionLabel);
    showToast({
      type: "success",
      title: `Workflow Action Recorded: ${actionLabel}`,
      message: `${actionDetail} Project review status updated.`,
    });
  };

  const handleConfirmDismiss = () => {
    if (!dismissReason.trim()) return;

    onAction(
      "DISMISS_SIGNAL",
      "Signal Dismissed",
      `Signal Dismissed: ${dismissReason.trim()}`
    );
    setIsDismissModalOpen(false);
    setDismissReason("");
    showToast({
      type: "warning",
      title: "Signal Dismissed",
      message:
        "Project status updated to 'Signal Dismissed'. This changes review status only and does not determine whether fraud occurred.",
    });
  };

  return (
    <>
      <Card variant="default">
        <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "14px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#EBF5FF",
                  color: "#0080FF",
                  border: "1px solid #B3D7FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ClipboardCheck style={{ width: "18px", height: "18px", color: "#0080FF" }} />
              </div>
              <div>
                <CardTitle style={{ fontSize: "15px", fontWeight: 700, color: "#0F1724" }}>
                  Human Verification & Audit Workflow
                </CardTitle>
                <p style={{ fontSize: "11px", color: "#6B7A8E", margin: "2px 0 0" }}>
                  Human-in-the-loop audit actions. Automated anomaly signals require verification by an authorized auditor.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "#6B7A8E", fontWeight: 600 }}>Review Status:</span>
              <Badge variant="info" size="md">
                {currentStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Recommended Next Step Callout */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: "#F8F9FB",
              border: "1px solid #DDE2EA",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#0080FF",
                fontWeight: 700,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <ShieldAlert style={{ width: "14px", height: "14px", color: "#0080FF" }} />
              Recommended Next Step
            </div>
            <p style={{ fontSize: "12px", color: "#3D4B5C", lineHeight: 1.5, margin: 0 }}>
              Human verification is required before drawing conclusions. The system flags discrepancies based on
              available records; an auditor or inspection team must confirm facts through physical inspection or statutory documentation.
            </p>
          </div>

          {/* Action Button Grid */}
          <div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#6B7A8E",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Auditor Actions
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "8px" }}>
              {/* Action 1: Mark for Physical Verification */}
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleSimpleAction(
                    "MARK_PHYSICAL_VERIFICATION",
                    "Physical Verification Required",
                    "Mark for Physical Verification",
                    "Project marked for priority physical inspection."
                  )
                }
                leftIcon={<ClipboardCheck style={{ width: "13px", height: "13px" }} />}
              >
                Physical Verification
              </Button>

              {/* Action 2: Schedule Inspection */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSimpleAction(
                    "SCHEDULE_INSPECTION",
                    "Inspection Scheduled",
                    "Schedule Inspection",
                    "Site inspection visit scheduled with district monitoring team."
                  )
                }
                leftIcon={<Calendar style={{ width: "13px", height: "13px", color: "#0080FF" }} />}
              >
                Schedule Inspection
              </Button>

              {/* Action 3: Request Additional Evidence */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSimpleAction(
                    "REQUEST_ADDITIONAL_EVIDENCE",
                    "Additional Evidence Requested",
                    "Request Additional Evidence",
                    "Formal documentation request logged for implementing agency."
                  )
                }
                leftIcon={<FileQuestion style={{ width: "13px", height: "13px", color: "#B76E00" }} />}
              >
                Request Evidence
              </Button>

              {/* Action 4: Acknowledge Signal */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleSimpleAction(
                    "ACKNOWLEDGE_SIGNAL",
                    "Signal Acknowledged",
                    "Acknowledge Signal",
                    "Signal acknowledged by auditor."
                  )
                }
                leftIcon={<CheckCircle2 style={{ width: "13px", height: "13px", color: "#00875A" }} />}
              >
                Acknowledge Signal
              </Button>

              {/* Action 5: Dismiss Signal (Requires Modal Confirmation) */}
              <Button
                variant="ghost"
                size="sm"
                style={{
                  color: "#DE350B",
                  border: "1px solid #FFEBE6",
                  background: "#FFF5F5",
                }}
                onClick={() => setIsDismissModalOpen(true)}
                leftIcon={<XCircle style={{ width: "13px", height: "13px" }} />}
              >
                Dismiss Signal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Consequential Action: Dismiss Signal */}
      <Modal isOpen={isDismissModalOpen} onClose={() => setIsDismissModalOpen(false)} maxWidth="md">
        <ModalHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#DE350B", marginBottom: "4px" }}>
            <AlertTriangle style={{ width: "18px", height: "18px", color: "#DE350B" }} />
            <ModalTitle>Confirm Signal Dismissal</ModalTitle>
          </div>
          <ModalDescription>Consequential Action Confirmation</ModalDescription>
        </ModalHeader>

        <ModalContent style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              background: "#FFEBE6",
              border: "1px solid #FFBDAD",
              fontSize: "12px",
              color: "#BF2600",
              lineHeight: 1.5,
            }}
          >
            This changes the current review status. It does not determine whether fraud occurred.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="dismiss-reason-input" style={{ fontSize: "11px", fontWeight: 700, color: "#0F1724" }}>
              Auditor Justification (Required):
            </label>
            <textarea
              id="dismiss-reason-input"
              rows={3}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="Record reason for dismissal (e.g., Physical site verification confirmed distinct structure; co-location approved by competent authority)..."
              style={{
                width: "100%",
                fontSize: "12px",
                padding: "8px 10px",
                borderRadius: "6px",
                background: "#FFFFFF",
                border: "1px solid #DDE2EA",
                color: "#0F1724",
                outline: "none",
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
          </div>
        </ModalContent>

        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setIsDismissModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!dismissReason.trim()}
            onClick={handleConfirmDismiss}
            leftIcon={<XCircle style={{ width: "13px", height: "13px" }} />}
          >
            Confirm Dismissal
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
