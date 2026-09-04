"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { ResponsibleAiBanner } from "@/components/ui/ResponsibleAiBanner";
import { getInvestigations } from "@/lib/api-client";
import type { InvestigationItem } from "../../../backend/api/types.ts";
import { RecentInvestigationsSection } from "@/components/dashboard/RecentInvestigationsSection";
import {
  FileSearch,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  Calendar,
  FilePlus,
  CheckCircle2,
  ListFilter,
  History,
} from "lucide-react";

function extractMpName(title: string): string {
  const cleaned = title
    .replace(/^MPLAD Allocation Limit\s*—\s*/i, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
  return cleaned || title;
}

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "activity">("queue");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const invRes = await getInvestigations();

      if (invRes.success && invRes.data) {
        setInvestigations(invRes.data.investigations);
      } else {
        setError(invRes.error?.message || "Failed to retrieve investigation cases.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickAction = (actionName: string, projectCode: string) => {
    setActionFeedback(`${actionName} recorded for ${projectCode}. Opening review dossier...`);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  const filteredItems = useMemo(() => {
    return investigations.filter((item) => {
      const matchesSeverity =
        severityFilter === "ALL" || item.severity === severityFilter;
      const matchesSearch =
        searchQuery === "" ||
        item.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.constituency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [investigations, severityFilter, searchQuery]);

  return (
    <PageContainer
      title="Audit Investigations"
      subtitle="Human auditor review workflow — review status, auditor notes, and evidence verification."
      badge={
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "4px 10px",
            background: "#F0F7FF",
            border: "1px solid #B3D7FF",
            color: "#0052B3",
            borderRadius: "4px",
          }}
        >
          {investigations.length} Priority Review Items
        </span>
      }
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          Refresh Queue
        </Button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Responsible AI Notice */}
        <ResponsibleAiBanner />

        {/* Feedback Alert if action triggered */}
        {actionFeedback && (
          <div
            style={{
              padding: "10px 14px",
              background: "#F0FFF4",
              border: "1px solid #A7F3D0",
              borderRadius: "6px",
              color: "#166534",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {actionFeedback}
          </div>
        )}

        {/* Workspace View Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "1px solid #DDE2EA",
            paddingBottom: "10px",
          }}
        >
          <button
            onClick={() => setActiveTab("queue")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: activeTab === "queue" ? "1px solid #0080FF" : "1px solid #DDE2EA",
              background: activeTab === "queue" ? "#0080FF" : "#FFFFFF",
              color: activeTab === "queue" ? "#FFFFFF" : "#4A5568",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <ListFilter style={{ width: "13px", height: "13px" }} />
            Active Review Cases ({investigations.length})
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: activeTab === "activity" ? "1px solid #0080FF" : "1px solid #DDE2EA",
              background: activeTab === "activity" ? "#0080FF" : "#FFFFFF",
              color: activeTab === "activity" ? "#FFFFFF" : "#4A5568",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <History style={{ width: "13px", height: "13px" }} />
            Recent Audit Activity
          </button>
        </div>

        {/* Tab 2: Recent Activity */}
        {activeTab === "activity" && (
          <RecentInvestigationsSection investigations={investigations} />
        )}

        {/* Tab 1: Active Review Queue Cards */}
        {activeTab === "queue" && (
          <>
            {/* Filter Controls Bar */}
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
                  placeholder="Search by MP, constituency, record code..."
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
                <span style={{ fontSize: "11px", color: "#6B7A8E", fontWeight: 600 }}>Review Priority:</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  {(["ALL", "CRITICAL", "HIGH", "MEDIUM"] as const).map((sev) => {
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

            {/* Main Content States */}
            {isLoading ? (
              <div style={{ padding: "48px 0" }}>
                <LoadingState
                  title="Loading Audit Investigation Queue..."
                  description="Retrieving prioritized anomaly signals for human review."
                />
              </div>
            ) : error ? (
              <div style={{ padding: "48px 0" }}>
                <ErrorState
                  title="Failed to Load Investigation Queue"
                  description={error}
                  onRetry={loadData}
                />
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: "48px 0" }}>
                <EmptyState
                  icon={<FileSearch style={{ width: "32px", height: "32px", color: "#0080FF" }} />}
                  title="No Review Items Found"
                  description={
                    searchQuery || severityFilter !== "ALL"
                      ? "No cases match your filter criteria. Try resetting filters."
                      : "All official allocations adhere to baseline distribution thresholds."
                  }
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
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredItems.map((item) => {
                  const mpName = extractMpName(item.title);
                  const signalTitle = item.signalSummary || item.signalType.replace(/_/g, " ");

                  return (
                    <Card key={item.id} variant="default">
                      <CardHeader style={{ paddingBottom: "8px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <span
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#0080FF",
                              }}
                            >
                              {item.projectCode}
                            </span>

                            <SeverityBadge severity={item.severity as any} />

                            <span
                              style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                background: "#F1F5F9",
                                color: "#334155",
                                borderRadius: "4px",
                                border: "1px solid #CBD5E1",
                                fontWeight: 500,
                              }}
                            >
                              Status: {item.status}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#1E293B",
                              background: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              padding: "3px 8px",
                            }}
                          >
                            Signal: {signalTitle}
                          </span>
                        </div>

                        <CardTitle style={{ fontSize: "15px", color: "#0F1724", marginTop: "10px", marginBottom: "4px" }}>
                          {mpName}
                        </CardTitle>

                        <div style={{ fontSize: "12px", color: "#6B7A8E", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                          <span>Constituency: <strong style={{ color: "#1E293B" }}>{item.constituency}</strong></span>
                          <span>District: <strong style={{ color: "#1E293B" }}>{item.district}</strong></span>
                          <span>Review Priority: <strong style={{ color: "#0F1724" }}>{item.reviewPriority}</strong></span>
                        </div>
                      </CardHeader>

                      <CardContent style={{ paddingTop: "4px" }}>
                        <div
                          style={{
                            background: "#F8F9FB",
                            padding: "10px 14px",
                            borderRadius: "6px",
                            border: "1px solid #E2E8F0",
                            marginBottom: "14px",
                          }}
                        >
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748B", marginBottom: "2px" }}>
                            Why it was flagged:
                          </div>
                          <p style={{ fontSize: "12px", color: "#1E293B", lineHeight: 1.5, margin: 0 }}>
                            {item.explanation}
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            paddingTop: "8px",
                            borderTop: "1px solid #F1F5F9",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <Link href={`/projects/${item.projectCode}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Calendar style={{ width: "12px", height: "12px" }} />}
                                onClick={() => handleQuickAction("Inspection Schedule", item.projectCode)}
                                style={{ fontSize: "11px" }}
                              >
                                Schedule Review
                              </Button>
                            </Link>

                            <Link href={`/projects/${item.projectCode}#notes`}>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<FilePlus style={{ width: "12px", height: "12px" }} />}
                                onClick={() => handleQuickAction("Evidence note prompt", item.projectCode)}
                                style={{ fontSize: "11px" }}
                              >
                                Add Evidence
                              </Button>
                            </Link>

                            <Link href={`/projects/${item.projectCode}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<CheckCircle2 style={{ width: "12px", height: "12px" }} />}
                                onClick={() => handleQuickAction("Close determination", item.projectCode)}
                                style={{ fontSize: "11px", color: "#64748B" }}
                              >
                                Close Review
                              </Button>
                            </Link>
                          </div>

                          <div>
                            <Link href={`/projects/${item.projectCode}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                rightIcon={<ArrowRight style={{ width: "13px", height: "13px" }} />}
                              >
                                Open Review
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
