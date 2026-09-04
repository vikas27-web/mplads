"use client";

import React from "react";
import { Database, ShieldCheck, FileText, CheckCircle2, Layers } from "lucide-react";

interface DataProvenanceCardProps {
  compact?: boolean;
}

export const DataProvenanceCard: React.FC<DataProvenanceCardProps> = ({ compact = false }) => {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DDE2EA",
        borderRadius: "8px",
        padding: compact ? "14px 18px" : "18px 22px",
        boxShadow: "0 1px 3px rgba(15, 23, 36, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #EDF1F6",
          paddingBottom: "10px",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              padding: "5px",
              borderRadius: "5px",
              background: "#EBF5FF",
              color: "#0080FF",
              display: "flex",
            }}
          >
            <Database style={{ width: "16px", height: "16px" }} />
          </div>
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0F1724", margin: 0 }}>
              DATA PROVENANCE
            </h4>
            <p style={{ fontSize: "11px", color: "#6B7A8E", margin: 0 }}>
              Official SIH26102 Primary Operational Dataset
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "4px",
            background: "#ECFDF5",
            color: "#065F46",
            border: "1px solid #A7F3D0",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <ShieldCheck style={{ width: "12px", height: "12px" }} />
          Canonical Operational Source
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact
            ? "repeat(auto-fit, minmax(180px, 1fr))"
            : "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          fontSize: "12px",
        }}
      >
        <div style={{ padding: "10px 12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748B", fontWeight: 600 }}>
            Source
          </span>
          <p style={{ fontWeight: 600, color: "#0F172A", margin: "2px 0 0", fontSize: "12px" }}>
            SIH26102 Official Dataset
          </p>
          <span style={{ fontSize: "10px", color: "#64748B" }}>Allocated Limit for Hon&apos;ble MPs</span>
        </div>

        <div style={{ padding: "10px 12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748B", fontWeight: 600 }}>
            Official Records
          </span>
          <p style={{ fontWeight: 700, color: "#0F172A", margin: "2px 0 0", fontSize: "14px", fontFamily: "JetBrains Mono, monospace" }}>
            543
          </p>
          <span style={{ fontSize: "10px", color: "#64748B" }}>18th Lok Sabha MPs (100% Ingested)</span>
        </div>

        <div style={{ padding: "10px 12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748B", fontWeight: 600 }}>
            Coverage
          </span>
          <p style={{ fontWeight: 700, color: "#0F172A", margin: "2px 0 0", fontSize: "14px", fontFamily: "JetBrains Mono, monospace" }}>
            36 States / UTs
          </p>
          <span style={{ fontSize: "10px", color: "#64748B" }}>Pan-India Parliamentary Outlay</span>
        </div>

        <div style={{ padding: "10px 12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748B", fontWeight: 600 }}>
            Unavailable Fields Policy
          </span>
          <p style={{ fontWeight: 600, color: "#92400E", margin: "2px 0 0", fontSize: "11px" }}>
            Explicitly &quot;Not available in source dataset&quot;
          </p>
          <span style={{ fontSize: "10px", color: "#64748B" }}>Zero fabrication · Honest audit semantics</span>
        </div>

        <div style={{ padding: "10px 12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: "10px", textTransform: "uppercase", color: "#64748B", fontWeight: 600 }}>
            Benchmark Separation
          </span>
          <p style={{ fontWeight: 600, color: "#475569", margin: "2px 0 0", fontSize: "11px" }}>
            Synthetic benchmark isolated
          </p>
          <span style={{ fontSize: "10px", color: "#64748B" }}>Retained for unit tests only · Never shown in UI</span>
        </div>
      </div>
    </div>
  );
};
