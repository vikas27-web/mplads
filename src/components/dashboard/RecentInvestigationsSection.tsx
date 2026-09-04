import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { InvestigationItem } from "../../../backend/api/types.ts";
import { ClipboardCheck, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

interface RecentInvestigationsSectionProps {
  investigations: InvestigationItem[];
}

export const RecentInvestigationsSection: React.FC<RecentInvestigationsSectionProps> = ({
  investigations,
}) => {
  const topCases = investigations.slice(0, 5);

  return (
    <Card variant="default">
      <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "12px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              <ClipboardCheck style={{ width: "16px", height: "16px", color: "#0080FF" }} />
            </div>
            <div>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                Recent Investigation &amp; Audit Activity
              </CardTitle>
              <p style={{ fontSize: "11px", color: "#6B7A8E", margin: "2px 0 0" }}>
                Active human review queues and inspection cases from live backend intelligence
              </p>
            </div>
          </div>
          <Link href="/investigations">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight style={{ width: "12px", height: "12px" }} />}>
              View All ({investigations.length})
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent style={{ padding: 0 }}>
        {topCases.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#6B7A8E", fontSize: "12px" }}>
            No active investigation cases queued.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {topCases.map((c, idx) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: idx < topCases.length - 1 ? "1px solid #F0F3F7" : "none",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
                  <SeverityBadge severity={c.severity as any} size="sm" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", fontWeight: 700, color: "#0080FF" }}>
                        {c.projectCode}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#6B7A8E",
                          background: "#F0F3F7",
                          padding: "1px 5px",
                          borderRadius: "3px",
                          border: "1px solid #DDE2EA",
                        }}
                      >
                        {c.id}
                      </span>
                      <Badge variant="info" size="sm">
                        {c.status}
                      </Badge>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#0F1724" }}>
                      {c.title}
                    </span>
                    <span style={{ fontSize: "11px", color: "#6B7A8E" }}>
                      {c.constituency}, {c.district} | Sector: {c.sector}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#B76E00",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <AlertTriangle style={{ width: "12px", height: "12px" }} />
                      {c.reviewPriority}
                    </span>
                    <span style={{ fontSize: "10px", color: "#6B7A8E" }}>
                      Reviewer: <strong style={{ color: "#3D4B5C" }}>{c.assignedReviewer}</strong>
                    </span>
                  </div>

                  <Link href={`/projects/${c.projectCode}`}>
                    <Button variant="secondary" size="sm">
                      Dossier
                    </Button>
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
