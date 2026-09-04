"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSeverity: string;
  onSeverityChange: (s: string) => void;
  onReset: () => void;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  onReset,
}) => {
  const severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        padding: "12px 16px",
        background: "#FFFFFF",
        border: "1px solid #DDE2EA",
        borderRadius: "6px",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "360px" }}>
        <Search
          style={{
            width: "14px",
            height: "14px",
            color: "#9BA8B5",
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <input
          type="text"
          placeholder="Filter priority projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            paddingLeft: "32px",
            paddingRight: "12px",
            paddingTop: "6px",
            paddingBottom: "6px",
            fontSize: "13px",
            border: "1px solid #DDE2EA",
            borderRadius: "5px",
            outline: "none",
            background: "#F8F9FB",
            color: "#0F1724",
          }}
        />
      </div>

      {/* Severity tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "11px", color: "#6B7A8E", fontWeight: 500, marginRight: "4px" }}>
          Priority:
        </span>
        {severities.map((sev) => (
          <button
            key={sev}
            onClick={() => onSeverityChange(sev)}
            style={{
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 500,
              borderRadius: "4px",
              border: "1px solid",
              cursor: "pointer",
              transition: "all 0.12s",
              borderColor: selectedSeverity === sev ? "#0080FF" : "#DDE2EA",
              background: selectedSeverity === sev ? "rgba(0,128,255,0.08)" : "transparent",
              color: selectedSeverity === sev ? "#0080FF" : "#6B7A8E",
            }}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Reset */}
      {(searchQuery || selectedSeverity !== "ALL") && (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw style={{ width: "12px", height: "12px" }} />}
          onClick={onReset}
          style={{ fontSize: "11px", color: "#6B7A8E" }}
        >
          Reset
        </Button>
      )}
    </div>
  );
};
