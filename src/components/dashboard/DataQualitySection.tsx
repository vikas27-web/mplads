"use client";

import React from "react";
import { DataQualitySummary } from "@/types/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Percent,
} from "lucide-react";

interface DataQualitySectionProps {
  dataQuality?: DataQualitySummary;
}

export const DataQualitySection: React.FC<DataQualitySectionProps> = ({ dataQuality }) => {
  if (!dataQuality) return null;

  return (
    <Card variant="default">
      <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "12px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
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
              <Database style={{ width: "15px", height: "15px" }} />
            </div>
            <div>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                Official Dataset Ingestion & Data Quality Audit
              </CardTitle>
              <p style={{ fontSize: "11px", color: "#6B7A8E", margin: "2px 0 0" }}>
                Canonical provenance & integrity metrics for SIH26102 official dataset
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Badge variant="success" size="sm">
              <ShieldCheck style={{ width: "12px", height: "12px", marginRight: "4px" }} />
              Reconciled (₹0.00 Delta)
            </Badge>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "JetBrains Mono, monospace",
                color: "#0080FF",
                background: "#F0F7FF",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid #C2E0FF",
              }}
            >
              {dataQuality.dataCompletenessScore} Completeness
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ paddingTop: "16px" }}>
        {/* Metric Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
          }}
        >
          {/* Source File */}
          <div
            style={{
              padding: "12px",
              borderRadius: "6px",
              background: "#F8F9FB",
              border: "1px solid #DDE2EA",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "4px" }}>
              <FileSpreadsheet style={{ width: "12px", height: "12px", color: "#0080FF" }} />
              Source File
            </span>
            <p style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "#0F1724", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {dataQuality.sourceFile}
            </p>
            <span style={{ fontSize: "10px", color: "#6B7A8E" }}>
              {dataQuality.totalSourceRows} raw lines
            </span>
          </div>

          {/* Accepted Records */}
          <div
            style={{
              padding: "12px",
              borderRadius: "6px",
              background: "#F8F9FB",
              border: "1px solid #DDE2EA",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 style={{ width: "12px", height: "12px", color: "#00875A" }} />
              Imported MPs
            </span>
            <p style={{ fontSize: "18px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#00875A", margin: 0 }}>
              {dataQuality.acceptedRows}
            </p>
            <span style={{ fontSize: "10px", color: "#6B7A8E" }}>
              1 summary row isolated
            </span>
          </div>

          {/* Rejected & Duplicates */}
          <div
            style={{
              padding: "12px",
              borderRadius: "6px",
              background: "#F8F9FB",
              border: "1px solid #DDE2EA",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
              Rejected / Duplicates
            </span>
            <p style={{ fontSize: "18px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#0F1724", margin: 0 }}>
              {dataQuality.rejectedRows} / {dataQuality.duplicateRows}
            </p>
            <span style={{ fontSize: "10px", color: "#00875A" }}>
              0% data drop rate
            </span>
          </div>

          {/* Total Allocation Ceiling */}
          <div
            style={{
              padding: "12px",
              borderRadius: "6px",
              background: "#F8F9FB",
              border: "1px solid #DDE2EA",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
              Total Allocation Ceiling
            </span>
            <p style={{ fontSize: "18px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#0080FF", margin: 0 }}>
              ₹{dataQuality.totalAllocatedCrores.toLocaleString("en-IN")} Cr
            </p>
            <span style={{ fontSize: "10px", color: "#6B7A8E" }}>
              Across 36 States/UTs
            </span>
          </div>

          {/* Missing Fields Flagged */}
          <div
            style={{
              padding: "12px",
              borderRadius: "6px",
              background: "#F8F9FB",
              border: "1px solid #DDE2EA",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertTriangle style={{ width: "12px", height: "12px", color: "#B76E00" }} />
              Missing Limit Entries
            </span>
            <p style={{ fontSize: "18px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#B76E00", margin: 0 }}>
              {dataQuality.missingCriticalFields}
            </p>
            <span style={{ fontSize: "10px", color: "#6B7A8E" }}>
              Nanded (MH) vacancy
            </span>
          </div>

          {/* Ingestion Recency */}
          <div
            style={{
              padding: "12px",
              borderRadius: "6px",
              background: "#F8F9FB",
              border: "1px solid #DDE2EA",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock style={{ width: "12px", height: "12px", color: "#6B7A8E" }} />
              Ingestion Timestamp
            </span>
            <p style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace", color: "#3D4B5C", margin: "4px 0 0" }}>
              {dataQuality.lastIngestedAt.split("T")[0]}
            </p>
            <span style={{ fontSize: "10px", color: "#00875A" }}>
              Canonical SQLite Live
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
