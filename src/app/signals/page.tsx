"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { ResponsibleAiBanner } from "@/components/ui/ResponsibleAiBanner";
import { getDashboardData } from "@/lib/api/dashboardProvider";
import { PrioritySignal } from "@/types/dashboard";
import {
  AlertTriangle,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function SignalsPage() {
  const [signals, setSignals] = useState<PrioritySignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadSignals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDashboardData();
      if (res.success && res.data) {
        setSignals(res.data.prioritySignals || []);
      } else {
        setError(res.error?.message || "Failed to load audit signals.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, []);

  const filteredSignals = useMemo(() => {
    return signals.filter((sig) => {
      const matchesSeverity =
        severityFilter === "ALL" || sig.severity === severityFilter;
      const matchesSearch =
        searchQuery === "" ||
        sig.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sig.signalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sig.constituency.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [signals, severityFilter, searchQuery]);

  return (
    <PageContainer
      title="Priority Audit Signals"
      subtitle="CRITICAL & HIGH severity signals identified for field inspection and human review."
      badge={
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "4px 10px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#991B1B",
            borderRadius: "4px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <AlertTriangle style={{ width: "13px", height: "13px", color: "#991B1B" }} />
          {signals.length} Priority Signals
        </span>
      }
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={loadSignals}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          Refresh
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Responsible AI Notice */}
        <ResponsibleAiBanner />

        {/* Search & Filter Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FFFFFF",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #DDE2EA",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "260px", maxWidth: "440px" }}>
            <Search
              style={{
                width: "14px",
                height: "14px",
                color: "#6B7A8E",
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search by code, signal type, constituency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "32px",
                paddingRight: "12px",
                paddingTop: "7px",
                paddingBottom: "7px",
                background: "#F8F9FB",
                border: "1px solid #DDE2EA",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#0F1724",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <Filter style={{ width: "13px", height: "13px", color: "#6B7A8E" }} />
            <span style={{ fontSize: "11px", color: "#6B7A8E", fontWeight: 600 }}>Severity:</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {(["ALL", "CRITICAL", "HIGH"] as const).map((sev) => {
                const isSelected = severityFilter === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    style={{
                      padding: "4px 10px",
                      fontSize: "11px",
                      borderRadius: "4px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1px solid #0080FF" : "1px solid #DDE2EA",
                      background: isSelected ? "#0080FF" : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : "#4A5568",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {sev === "ALL" ? "All" : sev}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content States */}
        {isLoading ? (
          <div style={{ padding: "48px 0" }}>
            <LoadingState
              title="Loading Priority Signals..."
              description="Scanning official parliamentary allocations for statistical anomalies."
            />
          </div>
        ) : error ? (
          <div style={{ padding: "48px 0" }}>
            <ErrorState
              title="Unable to Load Signals"
              description={error}
              onRetry={loadSignals}
            />
          </div>
        ) : filteredSignals.length === 0 ? (
          <div style={{ padding: "48px 0" }}>
            <EmptyState
              title="No Matching Audit Signals"
              description="No anomaly signals match your selected criteria."
              action={
                searchQuery || severityFilter !== "ALL"
                  ? {
                      label: "Reset Filters",
                      onClick: () => {
                        setSearchQuery("");
                        setSeverityFilter("ALL");
                      },
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <Card>
            <CardHeader style={{ paddingBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <CardTitle style={{ fontSize: "14px" }}>Detected Anomaly Signals</CardTitle>
                <span style={{ fontSize: "11px", color: "#64748B" }}>
                  Showing {filteredSignals.length} of {signals.length} signals
                </span>
              </div>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              {filteredSignals.map((signal, idx) => (
                <div
                  key={`${signal.projectCode}-${signal.signalType}-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 18px",
                    borderBottom: idx < filteredSignals.length - 1 ? "1px solid #F1F3F7" : "none",
                    background: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "240px" }}>
                    <SeverityBadge severity={signal.severity} />
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#0080FF",
                          fontWeight: 700,
                        }}
                      >
                        {signal.projectCode}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1E293B",
                          marginTop: "2px",
                        }}
                      >
                        {signal.signalType}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#475569",
                        background: "#E2E8F0",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 500,
                      }}
                    >
                      {signal.constituency}
                    </span>

                    <Link
                      href={`/projects/${signal.projectCode}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        color: "#0080FF",
                        textDecoration: "none",
                        fontWeight: 600,
                        padding: "4px 10px",
                        border: "1px solid rgba(0,128,255,0.25)",
                        borderRadius: "4px",
                        background: "rgba(0,128,255,0.04)",
                      }}
                    >
                      Review
                      <ExternalLink style={{ width: "11px", height: "11px" }} />
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
