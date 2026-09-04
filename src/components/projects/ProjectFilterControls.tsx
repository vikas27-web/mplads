"use client";

import React from "react";
import { ProjectFilterParams } from "@/types/project";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ProjectFilterControlsProps {
  params: ProjectFilterParams;
  onChange: (updatedParams: Partial<ProjectFilterParams>) => void;
  onReset: () => void;
  availableStates?: string[];
  availableDistricts?: string[];
  availableSectors?: string[];
  availableStatuses?: string[];
  availableSignalTypes?: string[];
}

const SELECT_STYLE: React.CSSProperties = {
  background: "#F8F9FB",
  border: "1px solid #DDE2EA",
  borderRadius: "6px",
  padding: "7px 12px",
  fontSize: "12px",
  color: "#0F1724",
  outline: "none",
  cursor: "pointer",
};

export const ProjectFilterControls: React.FC<ProjectFilterControlsProps> = ({
  params,
  onChange,
  onReset,
  availableStates = [],
  availableSignalTypes = [],
}) => {
  const {
    search = "",
    state = "ALL",
    severity = "ALL",
    signalType = "ALL",
  } = params;

  const activeCount = [
    search.trim() !== "",
    state !== "ALL",
    severity !== "ALL",
    signalType !== "ALL",
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto auto",
          gap: "10px",
          alignItems: "center",
        }}
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
      >
        {/* Search */}
        <div style={{ position: "relative" }}>
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
            value={search}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Search MP name, constituency, state, record code..."
            style={{
              ...SELECT_STYLE,
              paddingLeft: "32px",
              width: "100%",
            }}
          />
        </div>

        {/* State Filter */}
        <select
          value={state}
          onChange={(e) => onChange({ state: e.target.value, page: 1 })}
          style={SELECT_STYLE}
        >
          <option value="ALL">All States &amp; UTs</option>
          {availableStates.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {/* Review Priority */}
        <select
          value={severity}
          onChange={(e) => onChange({ severity: e.target.value, page: 1 })}
          style={SELECT_STYLE}
        >
          <option value="ALL">All Review Priorities</option>
          <option value="CRITICAL">Critical Review</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low (Baseline)</option>
        </select>

        {/* Signal Type */}
        <select
          value={signalType}
          onChange={(e) => onChange({ signalType: e.target.value, page: 1 })}
          style={SELECT_STYLE}
        >
          <option value="ALL">All Signal Types</option>
          {availableSignalTypes.map((sig) => (
            <option key={sig} value={sig}>
              {sig}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {activeCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw style={{ width: "12px", height: "12px" }} />}
              onClick={onReset}
              style={{ fontSize: "12px", color: "#6B7A8E" }}
            >
              Clear ({activeCount})
            </Button>
          ) : (
            <span style={{ fontSize: "11px", color: "#9BA8B5", padding: "0 6px" }}>
              Filter: State • Priority • Signal
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
