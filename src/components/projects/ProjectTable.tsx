import React from "react";
import Link from "next/link";
import { ProjectRecord } from "@/types/project";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatCurrency } from "@/lib/formatters";
import { ExternalLink } from "lucide-react";

export interface ProjectTableProps {
  projects: ProjectRecord[];
}

function extractMpName(title: string): string {
  const cleaned = title
    .replace(/^MPLAD Allocation Limit\s*—\s*/i, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
  return cleaned || title;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hon&apos;ble MP / Record</TableHead>
          <TableHead>Constituency</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Allocated Limit</TableHead>
          <TableHead>Review Priority</TableHead>
          <TableHead>Signal Status</TableHead>
          <TableHead style={{ textAlign: "right" }}>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => {
          const mpName = extractMpName(p.title);
          const hasAnomaly = p.severity === "CRITICAL" || p.severity === "HIGH" || p.severity === "MEDIUM";

          return (
            <TableRow key={p.projectCode}>
              <TableCell style={{ maxWidth: "240px" }}>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0F1724",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mpName}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#6B7A8E",
                      marginTop: "2px",
                    }}
                  >
                    {p.projectCode}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "#0F1724" }}>
                  {p.constituency}
                </div>
                {p.district && p.district !== p.constituency && (
                  <div style={{ fontSize: "10px", color: "#9BA8B5" }}>{p.district}</div>
                )}
              </TableCell>

              <TableCell style={{ fontSize: "12px", color: "#3D4B5C" }}>
                {p.state}
              </TableCell>

              <TableCell>
                <div>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "12px",
                      color: "#0F1724",
                      fontWeight: 700,
                    }}
                  >
                    ₹{(p.recommendedAmount / 10000000).toFixed(2)} Cr
                  </span>
                  <div style={{ fontSize: "10px", color: "#9BA8B5" }}>
                    {formatCurrency(p.recommendedAmount)}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <SeverityBadge severity={p.severity} />
              </TableCell>

              <TableCell>
                {hasAnomaly ? (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "3px 8px",
                      background: "#FFF1F2",
                      color: "#9F1239",
                      borderRadius: "4px",
                      border: "1px solid #FFE4E6",
                      display: "inline-block",
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.signal || "Potential Anomaly Signal"}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      background: "#F8FAFC",
                      color: "#475569",
                      borderRadius: "4px",
                      border: "1px solid #E2E8F0",
                      display: "inline-block",
                    }}
                  >
                    Baseline Allocation
                  </span>
                )}
              </TableCell>

              <TableCell style={{ textAlign: "right" }}>
                <Link
                  href={`/projects/${p.projectCode}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11px",
                    color: "#0080FF",
                    textDecoration: "none",
                    fontWeight: 600,
                    padding: "5px 10px",
                    border: "1px solid rgba(0,128,255,0.25)",
                    borderRadius: "4px",
                    background: "rgba(0,128,255,0.04)",
                  }}
                >
                  View Dossier
                  <ExternalLink style={{ width: "11px", height: "11px" }} />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
