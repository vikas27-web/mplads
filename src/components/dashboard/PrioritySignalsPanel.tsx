import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { PrioritySignal } from "@/types/dashboard";
import { ExternalLink } from "lucide-react";

interface PrioritySignalsPanelProps {
  signals: PrioritySignal[];
}

export const PrioritySignalsPanel: React.FC<PrioritySignalsPanelProps> = ({ signals }) => {
  return (
    <Card>
      <CardHeader>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <CardTitle>Priority Audit Signals</CardTitle>
            <p style={{ fontSize: "11px", color: "#9BA8B5", marginTop: "2px" }}>
              CRITICAL &amp; HIGH severity signals requiring field verification
            </p>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              background: "#FEF2F2",
              color: "#C0392B",
              border: "1px solid #FECACA",
              borderRadius: "4px",
            }}
          >
            {signals.length} flagged
          </span>
        </div>
      </CardHeader>
      <CardContent style={{ padding: "0" }}>
        {signals.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#9BA8B5", fontSize: "13px" }}>
            No high-priority signals detected.
          </div>
        ) : (
          <div>
            {signals.slice(0, 8).map((signal, idx) => (
              <div
                key={signal.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 20px",
                  borderBottom: idx < signals.length - 1 ? "1px solid #F1F3F7" : "none",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <SeverityBadge severity={signal.severity} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontFamily: "JetBrains Mono, monospace",
                        color: "#0080FF",
                        fontWeight: 500,
                      }}
                    >
                      {signal.projectCode}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#3D4B5C",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {signal.signalType}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", color: "#9BA8B5" }}>{signal.constituency}</span>
                  <Link
                    href={`/projects/${signal.projectCode}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      color: "#0080FF",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Review
                    <ExternalLink style={{ width: "10px", height: "10px" }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
