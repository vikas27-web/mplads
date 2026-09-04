"use client";

import React from "react";
import { AuditTrailEntry } from "@/types/project-investigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, UserCheck, Clock } from "lucide-react";

interface InvestigationAuditTrailProps {
  auditTrail: AuditTrailEntry[];
}

export const InvestigationAuditTrail: React.FC<InvestigationAuditTrailProps> = ({ auditTrail }) => {
  return (
    <Card variant="default">
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
              <ShieldCheck style={{ width: "15px", height: "15px", color: "#0080FF" }} />
            </div>
            <div>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                Audit Trail & Review Log
              </CardTitle>
              <p style={{ fontSize: "11px", color: "#6B7A8E", margin: "2px 0 0" }}>
                Chronological record of screening signals, auditor reviews, and workflow actions
              </p>
            </div>
          </div>
          <Badge variant="outline" size="sm">
            {auditTrail.length} {auditTrail.length === 1 ? "Event" : "Events"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent style={{ paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {auditTrail.length === 0 ? (
          <p style={{ fontSize: "11px", color: "#6B7A8E", fontStyle: "italic", padding: "12px 0", textAlign: "center" }}>
            No audit trail entries recorded yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
            {auditTrail.map((entry) => (
              <div
                key={entry.id}
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
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F1724" }}>{entry.actionType}</span>
                    {entry.isSessionAction ? (
                      <Badge variant="info" size="sm">
                        Auditor Review Action
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm">
                        System Event
                      </Badge>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#6B7A8E",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Clock style={{ width: "11px", height: "11px" }} />
                    {entry.timestamp}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "11px",
                    color: "#3D4B5C",
                    background: "#F8F9FB",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    border: "1px solid #DDE2EA",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {entry.notes}
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
                    <UserCheck style={{ width: "12px", height: "12px", color: "#6B7A8E" }} />
                    Actor: <strong style={{ color: "#0F1724" }}>{entry.actor}</strong>
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace" }}>Ref: {entry.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
