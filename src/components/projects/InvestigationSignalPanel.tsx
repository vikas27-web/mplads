"use client";

import React from "react";
import { AnomalySignal } from "@/types/project-investigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, FileSearch, ShieldCheck, Eye, Activity, Cpu, Layers } from "lucide-react";

interface InvestigationSignalPanelProps {
  signals: AnomalySignal[];
}

export const InvestigationSignalPanel: React.FC<InvestigationSignalPanelProps> = ({ signals }) => {
  return (
    <Card variant="default">
      <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
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
              <AlertCircle style={{ width: "18px", height: "18px", color: "#0080FF" }} />
            </div>
            <div>
              <CardTitle style={{ fontSize: "15px", fontWeight: 700, color: "#0F1724" }}>
                Why This Was Flagged — Anomaly Signals & Mathematical Evidence
              </CardTitle>
              <p style={{ fontSize: "11px", color: "#6B7A8E", margin: "2px 0 0" }}>
                Explainable anomaly signals, observed thresholds, and affected features identified for physical verification
              </p>
            </div>
          </div>
          <Badge variant="warning" size="sm">
            {signals.length} Potential Anomaly {signals.length === 1 ? "Signal" : "Signals"} Detected
          </Badge>
        </div>
      </CardHeader>

      <CardContent style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {signals.map((signal, index) => (
          <div
            key={signal.id || index}
            style={{
              padding: "16px",
              borderRadius: "8px",
              background: "#FFFFFF",
              border: "1px solid #DDE2EA",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Header: Signal Name, Score & Badges */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                borderBottom: "1px solid #F0F3F7",
                paddingBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "#F0F3F7",
                    color: "#3D4B5C",
                    border: "1px solid #DDE2EA",
                  }}
                >
                  Signal #{index + 1}
                </span>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0F1724", margin: 0 }}>
                  {signal.signalName}
                </h4>
                {signal.signalType && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#6B7A8E",
                      background: "#F8F9FB",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    {signal.signalType}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {signal.score !== undefined && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 700,
                      color: "#DE350B",
                      background: "#FFEBE6",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: "1px solid #FFBDAD",
                    }}
                  >
                    Score: {signal.score.toFixed(3)}
                  </span>
                )}
                <Badge variant="outline" size="sm">
                  {signal.detectorId || signal.category}
                </Badge>
                <Badge
                  variant={
                    signal.evidenceStatus === "Verification Required" || signal.evidenceStatus === "Flagged"
                      ? "anomaly"
                      : "warning"
                  }
                  size="sm"
                >
                  {signal.evidenceStatus}
                </Badge>
              </div>
            </div>

            {/* Plain-Language Explanation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6B7A8E",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FileSearch style={{ width: "13px", height: "13px", color: "#0080FF" }} />
                Explanation
              </span>
              <p
                style={{
                  fontSize: "12px",
                  color: "#3D4B5C",
                  lineHeight: 1.55,
                  background: "#F8F9FB",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #DDE2EA",
                  margin: 0,
                }}
              >
                {signal.explanation}
              </p>
            </div>

            {/* Side-by-Side: Observed vs Reference Values & Direction */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "#FFF8E6",
                  border: "1px solid #FFE399",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#B76E00",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Eye style={{ width: "12px", height: "12px" }} />
                  Observed Value
                </span>
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#7A4100",
                    fontWeight: 600,
                    margin: "4px 0 0",
                  }}
                >
                  {signal.observedValue}
                </p>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "#F8F9FB",
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
                  }}
                >
                  Reference / Baseline
                </span>
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#3D4B5C",
                    margin: "4px 0 0",
                  }}
                >
                  {signal.referenceValue || "Standard statutory audit baseline"}
                </p>
              </div>

              {signal.direction && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: "#F8F9FB",
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
                    <Activity style={{ width: "12px", height: "12px", color: "#0080FF" }} />
                    Deviation Direction
                  </span>
                  <p
                    style={{
                      fontSize: "12px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#0080FF",
                      fontWeight: 600,
                      margin: "4px 0 0",
                      textTransform: "uppercase",
                    }}
                  >
                    {signal.direction.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>

            {/* Affected Features List */}
            {signal.affectedFeatures && signal.affectedFeatures.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
                  Affected Features:
                </span>
                {signal.affectedFeatures.map((feat) => (
                  <span
                    key={feat}
                    style={{
                      fontSize: "10px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#3D4B5C",
                      background: "#F0F3F7",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid #DDE2EA",
                    }}
                  >
                    {feat}
                  </span>
                ))}
              </div>
            )}

            {/* Verification Requirement & Evidence Source */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                borderTop: "1px solid #F0F3F7",
                paddingTop: "8px",
                fontSize: "11px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", color: "#3D4B5C", flex: 1, minWidth: "200px" }}>
                <ShieldCheck style={{ width: "14px", height: "14px", color: "#00875A", flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <strong style={{ color: "#0F1724" }}>Required Verification: </strong>
                  <span>{signal.verificationRequirement}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#6B7A8E", flexWrap: "wrap" }}>
                {signal.generatedAt && (
                  <span style={{ fontSize: "10px", fontFamily: "JetBrains Mono, monospace" }}>
                    Generated: {signal.generatedAt.split("T")[0]}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Engine:</span>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#3D4B5C",
                      fontWeight: 600,
                      background: "#F0F3F7",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid #DDE2EA",
                      fontSize: "10px",
                    }}
                  >
                    v{signal.engineVersion || "1.0.0"} (F:v{signal.featureVersion || "1.0.0"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
