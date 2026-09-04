"use client";

import React from "react";
import { ProjectFilterParams, SortField, SortDirection } from "@/types/project";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ProjectFilterControlsProps {
  params: ProjectFilterParams;
  onChange: (updatedParams: Partial<ProjectFilterParams>) => void;
  onReset: () => void;
  availableDistricts: string[];
  availableSectors: string[];
  availableStatuses: string[];
}

const SELECT_STYLE: React.CSSProperties = {
  background: "#F8F9FB",
  border: "1px solid #DDE2EA",
  borderRadius: "5px",
  padding: "6px 10px",
  fontSize: "12px",
  color: "#0F1724",
  outline: "none",
  cursor: "pointer",
};

export const ProjectFilterControls: React.FC<ProjectFilterControlsProps> = ({
  params,
  onChange,
  onReset,
  availableDistricts,
  availableSectors,
  availableStatuses,
}) => {
  const {
    search = "",
    district = "ALL",
    sector = "ALL",
    severity = "ALL",
    status = "ALL",
    sortBy = "projectCode",
    sortOrder = "asc",
  } = params;

  const activeCount = [
    search.trim() !== "",
    district !== "ALL",
    sector !== "ALL",
    severity !== "ALL",
    status !== "ALL",
  ].filter(Boolean).length;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DDE2EA",
        borderRadius: "8px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Row 1: Search + district + sector + severity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto",
          gap: "10px",
          alignItems: "center",
        }}
        className="grid-cols-1 sm:grid-cols-4"
      >
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            style={{
              width: "13px",
              height: "13px",
              color: "#9BA8B5",
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Search code, title, constituency, contractor..."
            style={{
              ...SELECT_STYLE,
              paddingLeft: "30px",
              width: "100%",
            }}
          />
        </div>

        <select
          value={district}
          onChange={(e) => onChange({ district: e.target.value, page: 1 })}
          style={SELECT_STYLE}
        >
          <option value="ALL">All Districts</option>
          {availableDistricts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={sector}
          onChange={(e) => onChange({ sector: e.target.value, page: 1 })}
          style={SELECT_STYLE}
        >
          <option value="ALL">All Sectors</option>
          {availableSectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={severity}
          onChange={(e) => onChange({ severity: e.target.value, page: 1 })}
          style={SELECT_STYLE}
        >
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Row 2: Status + sort + reset */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          flexWrap: "wrap",
          paddingTop: "10px",
          borderTop: "1px solid #F1F3F7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <select
            value={status}
            onChange={(e) => onChange({ status: e.target.value, page: 1 })}
            style={SELECT_STYLE}
          >
            <option value="ALL">All Statuses</option>
            {availableStatuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <span style={{ fontSize: "11px", color: "#9BA8B5" }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as SortField, page: 1 })}
            style={SELECT_STYLE}
          >
            <option value="projectCode">Project Code</option>
            <option value="severity">Severity</option>
            <option value="recommendedAmount">Sanctioned Amount</option>
            <option value="lastUpdated">Last Updated</option>
          </select>

          <button
            onClick={() => onChange({ sortOrder: sortOrder === "asc" ? "desc" : "asc" })}
            style={{
              ...SELECT_STYLE,
              fontFamily: "JetBrains Mono, monospace",
              padding: "6px 10px",
            }}
          >
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw style={{ width: "12px", height: "12px" }} />}
            onClick={onReset}
            style={{ fontSize: "12px", color: "#6B7A8E" }}
          >
            Clear {activeCount} filter{activeCount > 1 ? "s" : ""}
          </Button>
        )}
      </div>
    </div>
  );
};
