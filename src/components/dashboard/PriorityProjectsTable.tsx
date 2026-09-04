import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { PriorityProject } from "@/types/dashboard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface PriorityProjectsTableProps {
  projects: PriorityProject[];
}

export const PriorityProjectsTable: React.FC<PriorityProjectsTableProps> = ({ projects }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Projects — Inspection Queue</CardTitle>
        <p style={{ fontSize: "11px", color: "#9BA8B5", marginTop: "2px" }}>
          Projects with CRITICAL or HIGH anomaly signals requiring field audit
        </p>
      </CardHeader>
      <CardContent style={{ padding: "0 0 0 0" }}>
        {projects.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#9BA8B5", fontSize: "13px" }}>
            No priority projects match current filters.
          </div>
        ) : (
          <Table style={{ border: "none", borderRadius: "0", boxShadow: "none" }}>
            <TableHeader>
              <TableRow>
                <TableHead>Project Code</TableHead>
                <TableHead>Constituency</TableHead>
                <TableHead>Type / Sector</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Primary Signal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.slice(0, 15).map((p) => (
                <TableRow key={p.projectCode}>
                  <TableCell>
                    <Link
                      href={`/projects/${p.projectCode}`}
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "12px",
                        color: "#0080FF",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      {p.projectCode}
                    </Link>
                  </TableCell>
                  <TableCell style={{ fontSize: "12px" }}>{p.constituency}</TableCell>
                  <TableCell style={{ fontSize: "12px", color: "#6B7A8E" }}>{p.projectType}</TableCell>
                  <TableCell>
                    <SeverityBadge severity={p.severity} />
                  </TableCell>
                  <TableCell style={{ fontSize: "11px", color: "#6B7A8E", maxWidth: "200px" }}>
                    <span
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {typeof p.signal === "string"
                        ? p.signal.replace(/_/g, " ")
                        : "Signal Detected"}
                    </span>
                  </TableCell>
                  <TableCell style={{ fontSize: "11px", color: "#6B7A8E" }}>{p.status}</TableCell>
                  <TableCell style={{ fontSize: "11px", color: "#9BA8B5", fontFamily: "JetBrains Mono, monospace" }}>
                    {formatDate(p.lastUpdated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
