"use client";

import React from "react";
import {
  FinancialEvidence,
  PhysicalVerificationEvidence,
  DocumentEvidenceItem,
} from "@/types/project-investigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  IndianRupee,
  MapPin,
  FileText,
  Clock,
  Camera,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

interface InvestigationEvidenceProps {
  financialEvidence: FinancialEvidence;
  physicalVerificationEvidence: PhysicalVerificationEvidence;
  documentEvidence: DocumentEvidenceItem[];
}

export const InvestigationEvidence: React.FC<InvestigationEvidenceProps> = ({
  financialEvidence,
  physicalVerificationEvidence,
  documentEvidence,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F1724", margin: 0 }}>
          Corroborating Evidence Dossier
        </h3>
        <p style={{ fontSize: "11px", color: "#6B7A8E", margin: "2px 0 0" }}>
          Multi-modal evidence repository cross-referencing financial, physical, and statutory records
        </p>
      </div>

      {/* Grid containing Evidence Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {/* Category 1: Financial Evidence */}
        <Card variant="default" style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    background: "#E3FCEF",
                    color: "#00875A",
                    border: "1px solid #ABF5D1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IndianRupee style={{ width: "15px", height: "15px" }} />
                </div>
                <CardTitle style={{ fontSize: "13px", fontWeight: 700, color: "#0F1724" }}>Financial Evidence</CardTitle>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#6B7A8E",
                  background: "#F0F3F7",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid #DDE2EA",
                }}
              >
                {financialEvidence.source}
              </span>
            </div>
          </CardHeader>

          <CardContent style={{ paddingTop: "14px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Amounts Display without client calculations */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "#F8F9FB",
                  border: "1px solid #DDE2EA",
                }}
              >
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                    Sanctioned
                  </span>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F1724", margin: "2px 0 0" }}>
                    {formatCurrency(financialEvidence.sanctionedAmount)}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                    Expenditure Disbursed
                  </span>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#00875A", margin: "2px 0 0" }}>
                    {formatCurrency(financialEvidence.expenditureAmount)}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ color: "#6B7A8E" }}>Evidence Status:</span>
                <Badge variant="warning" size="sm">
                  {financialEvidence.evidenceStatus}
                </Badge>
              </div>

              {/* Payment Records List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                  Disbursement Tranches
                </span>
                {financialEvidence.paymentRecords.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
                    {financialEvidence.paymentRecords.map((pay) => (
                      <div
                        key={pay.id}
                        style={{
                          padding: "8px 10px",
                          borderRadius: "6px",
                          background: "#FFFFFF",
                          border: "1px solid #DDE2EA",
                          fontSize: "11px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#0080FF", fontSize: "11px", fontWeight: 600 }}>
                            {pay.referenceNumber}
                          </span>
                          <span style={{ fontWeight: 700, color: "#0F1724" }}>{formatCurrency(pay.amount)}</span>
                        </div>
                        <p style={{ fontSize: "11px", color: "#6B7A8E", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {pay.description}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "10px",
                            color: "#6B7A8E",
                            borderTop: "1px solid #F0F3F7",
                            paddingTop: "4px",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock style={{ width: "11px", height: "11px" }} />
                            {formatDate(pay.date)}
                          </span>
                          <span style={{ color: "#B76E00", fontWeight: 600 }}>{pay.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "14px 12px", borderRadius: "6px", background: "#F8F9FB", border: "1px dashed #DDE2EA", fontSize: "11px", color: "#6B7A8E", textAlign: "center" }}>
                    <strong style={{ color: "#3D4B5C" }}>Not available in source dataset</strong>
                    <p style={{ fontSize: "10px", margin: "4px 0 0", color: "#8C9BAE" }}>
                      Official SIH26102 dataset provides parliamentary allocation limits without itemized payment tranches.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#6B7A8E",
                borderTop: "1px solid #DDE2EA",
                paddingTop: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>PFMS Reconciliation Ledger</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "#00875A" }}>Audit Ready</span>
            </div>
          </CardContent>
        </Card>

        {/* Category 2: Physical Verification Evidence */}
        <Card variant="default" style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    background: "#EBF5FF",
                    color: "#0080FF",
                    border: "1px solid #B3D7FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MapPin style={{ width: "15px", height: "15px" }} />
                </div>
                <CardTitle style={{ fontSize: "13px", fontWeight: 700, color: "#0F1724" }}>
                  Physical Verification Evidence
                </CardTitle>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#6B7A8E",
                  background: "#F0F3F7",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid #DDE2EA",
                }}
              >
                {physicalVerificationEvidence.source}
              </span>
            </div>
          </CardHeader>

          <CardContent style={{ paddingTop: "14px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Completion & Inspection States */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "#F8F9FB",
                  border: "1px solid #DDE2EA",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                    Reported Completion State
                  </span>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#0F1724", margin: "2px 0 0" }}>
                    {physicalVerificationEvidence.reportedCompletionState}
                  </p>
                </div>
                <div style={{ borderTop: "1px solid #DDE2EA", paddingTop: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                    Inspection State
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <ShieldAlert style={{ width: "14px", height: "14px", color: "#B76E00", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "#B76E00", fontWeight: 600 }}>
                      {physicalVerificationEvidence.inspectionState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Geo-Location Record State */}
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "#FFFFFF",
                  border: "1px solid #DDE2EA",
                }}
              >
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                  Geo-Location Record State
                </span>
                <p style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace", color: "#3D4B5C", margin: "2px 0 0" }}>
                  {physicalVerificationEvidence.geoLocationRecordState}
                </p>
              </div>

              {/* Photo & Document Availability */}
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "#FFFFFF",
                  border: "1px solid #DDE2EA",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#6B7A8E",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Camera style={{ width: "12px", height: "12px", color: "#0080FF" }} />
                  Photographic Evidence State
                </span>
                <p style={{ fontSize: "11px", color: "#3D4B5C", margin: "2px 0 0" }}>
                  {physicalVerificationEvidence.photoDocumentAvailability}
                </p>
              </div>

              {/* Inspection Logs snippet */}
              {physicalVerificationEvidence.verificationLogs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                    Field Inspection Logs ({physicalVerificationEvidence.verificationLogs.length})
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
                    {physicalVerificationEvidence.verificationLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "4px",
                          background: "#F8F9FB",
                          border: "1px solid #DDE2EA",
                          fontSize: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#6B7A8E" }}>
                          <span style={{ fontWeight: 600, color: "#3D4B5C" }}>{log.inspectorName}</span>
                          <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{formatDate(log.inspectionDate)}</span>
                        </div>
                        <p style={{ color: "#4A5568", margin: 0, lineHeight: 1.4 }}>{log.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px", borderRadius: "6px", background: "#F8F9FB", border: "1px dashed #DDE2EA", fontSize: "11px", color: "#6B7A8E", textAlign: "center" }}>
                  <strong style={{ color: "#3D4B5C" }}>Not available in source dataset</strong>
                  <p style={{ fontSize: "10px", margin: "4px 0 0", color: "#8C9BAE" }}>
                    Official dataset specifies parliamentary allocations without geo-tagged inspection logs.
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#6B7A8E",
                borderTop: "1px solid #DDE2EA",
                paddingTop: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Geo-Telemetry Verification</span>
              <span style={{ color: "#B76E00", fontWeight: 600 }}>Survey Pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Category 3: Document Evidence */}
        <Card variant="default" style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    background: "#F3F0FF",
                    color: "#6554C0",
                    border: "1px solid #D8CCF4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText style={{ width: "15px", height: "15px" }} />
                </div>
                <CardTitle style={{ fontSize: "13px", fontWeight: 700, color: "#0F1724" }}>Document Evidence</CardTitle>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#6B7A8E",
                  background: "#F0F3F7",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid #DDE2EA",
                }}
              >
                {documentEvidence.length > 0 ? "Statutory Documents" : "Official Source Registry"}
              </span>
            </div>
          </CardHeader>

          <CardContent style={{ paddingTop: "14px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
              {documentEvidence.length > 0 ? (
                documentEvidence.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: "#FFFFFF",
                    border: "1px solid #DDE2EA",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <FileCheck style={{ width: "14px", height: "14px", color: "#0080FF", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <h5 style={{ fontSize: "12px", fontWeight: 600, color: "#0F1724", margin: 0 }}>
                          {doc.documentName}
                        </h5>
                        <p style={{ fontSize: "10px", color: "#6B7A8E", margin: "2px 0 0" }}>{doc.documentType}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        doc.availability === "Available"
                          ? "success"
                          : doc.availability === "Missing"
                          ? "anomaly"
                          : "warning"
                      }
                      size="sm"
                    >
                      {doc.availability}
                    </Badge>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "10px",
                      paddingTop: "6px",
                      borderTop: "1px solid #F0F3F7",
                    }}
                  >
                    <span style={{ color: "#6B7A8E" }}>Verification:</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          doc.verificationStatus === "Verified by Auditor"
                            ? "#00875A"
                            : doc.verificationStatus === "Discrepancy Found"
                            ? "#DE350B"
                            : "#B76E00",
                      }}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>
                </div>
              ))
              ) : (
                <div style={{ padding: "14px 12px", borderRadius: "6px", background: "#F8F9FB", border: "1px dashed #DDE2EA", fontSize: "11px", color: "#6B7A8E", textAlign: "center" }}>
                  <strong style={{ color: "#3D4B5C" }}>Not available in source dataset</strong>
                  <p style={{ fontSize: "10px", margin: "4px 0 0", color: "#8C9BAE" }}>
                    Official SIH26102 dataset provides parliamentary allocation limits without statutory document attachments.
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#6B7A8E",
                borderTop: "1px solid #DDE2EA",
                paddingTop: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Statutory Compliance Registry</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "#0080FF" }}>Auditor Review</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
