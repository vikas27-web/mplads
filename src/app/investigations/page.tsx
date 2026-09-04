"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { ResponsibleAiBanner } from "@/components/ui/ResponsibleAiBanner";
import { getInvestigations } from "@/lib/api-client";
import type { InvestigationItem } from "../../../backend/api/types.ts";
import {
  FileSearch,
  ArrowRight,
  Filter,
  Search,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getInvestigations();
      if (res.success && res.data) {
        setInvestigations(res.data.investigations);
      } else {
        setError(res.error?.message || "Failed to retrieve investigation cases.");
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
      title="Audit Investigations & Field Reviews"
      subtitle="Prioritized queue of potential anomaly signals requiring physical verification and human audit inspection"
      badge={<Badge variant="warning">{investigations.length} Flagged Works</Badge>}
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
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Responsible AI Persistent Notice */}
        <ResponsibleAiBanner />

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
                width: "15px",
                height: "15px",
                color: "#6B7A8E",
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search by code, title, constituency, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "34px",
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter style={{ width: "14px", height: "14px", color: "#6B7A8E" }} />
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
                    {sev}
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
              description="Connecting to backend REST API (GET /api/investigations) and retrieving case evidence."
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
              title="No Investigation Cases Found"
              description={
                searchQuery || severityFilter !== "ALL"
                  ? "No cases match your filter criteria. Try broadening your search or resetting filters."
                  : "All projects currently adhere to baseline thresholds. No immediate field verifications queued."
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
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                variant="default"
              >
                <CardHeader style={{ paddingBottom: "10px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <SeverityBadge severity={item.severity as any} />
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", fontWeight: 700, color: "#0080FF" }}>
                        {item.projectCode}
                      </span>
                      <Badge variant="outline" size="sm">
                        {item.signalType.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "#B76E00",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "#FFF8E6",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: "1px solid #FFE399",
                      }}
                    >
                      <AlertTriangle style={{ width: "13px", height: "13px", color: "#B76E00" }} />
                      {item.reviewPriority}
                    </div>
                  </div>

                  <CardTitle style={{ fontSize: "14px", color: "#0F1724", marginTop: "8px" }}>
                    {item.title}
                  </CardTitle>

                  <CardDescription style={{ fontSize: "11px", color: "#6B7A8E" }}>
                    Constituency: <strong style={{ color: "#3D4B5C" }}>{item.constituency}</strong> | District:{" "}
                    <strong style={{ color: "#3D4B5C" }}>{item.district}</strong> | Sector:{" "}
                    <strong style={{ color: "#3D4B5C" }}>{item.sector}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent style={{ paddingTop: 0 }}>
                  <div
                    style={{
                      background: "#F8F9FB",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #DDE2EA",
                      marginBottom: "12px",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "#3D4B5C", lineHeight: 1.5, margin: 0 }}>
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
                      fontSize: "11px",
                      color: "#6B7A8E",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span>
                        Evidence Items: <strong style={{ color: "#0F1724" }}>{item.evidenceCount}</strong>
                      </span>
                      <span>
                        Anomaly Score:{" "}
                        <strong style={{ color: "#DE350B", fontFamily: "JetBrains Mono, monospace" }}>
                          {item.overallSignalScore.toFixed(3)}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Link href={`/projects/${item.projectCode}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          rightIcon={<ArrowRight style={{ width: "13px", height: "13px" }} />}
                        >
                          Open Investigation Dossier
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
