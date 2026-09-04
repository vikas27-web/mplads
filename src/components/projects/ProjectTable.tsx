import React from "react";
import Link from "next/link";
import { ProjectRecord } from "@/types/project";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ExternalLink } from "lucide-react";

export interface ProjectTableProps {
  projects: ProjectRecord[];
}

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project Code</TableHead>
          <TableHead>Work Title</TableHead>
          <TableHead>Constituency / District</TableHead>
          <TableHead>Sector</TableHead>
          <TableHead>Sanctioned</TableHead>
          <TableHead>Signal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={{ textAlign: "right" }}>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => (
          <TableRow key={p.projectCode}>
            <TableCell>
              <Link
                href={`/projects/${p.projectCode}`}
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  color: "#0080FF",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {p.projectCode}
              </Link>
            </TableCell>
            <TableCell style={{ maxWidth: "220px" }}>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#0F1724",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.title}
                </div>
                <div style={{ fontSize: "10px", color: "#9BA8B5" }}>{p.implementingAgency}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div style={{ fontSize: "12px", color: "#0F1724" }}>{p.constituency}</div>
                <div style={{ fontSize: "10px", color: "#9BA8B5" }}>{p.district}</div>
              </div>
            </TableCell>
            <TableCell style={{ fontSize: "12px", color: "#6B7A8E" }}>{p.sector}</TableCell>
            <TableCell>
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  color: "#0F1724",
                  fontWeight: 600,
                }}
              >
                {formatCurrency(p.recommendedAmount)}
              </span>
            </TableCell>
            <TableCell>
              <SeverityBadge severity={p.severity} />
            </TableCell>
            <TableCell>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 6px",
                  background: "#F1F3F7",
                  color: "#3D4B5C",
                  borderRadius: "3px",
                  border: "1px solid #DDE2EA",
                }}
              >
                {p.status}
              </span>
            </TableCell>
            <TableCell style={{ textAlign: "right" }}>
              <Link
                href={`/projects/${p.projectCode}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: "#0080FF",
                  textDecoration: "none",
                  fontWeight: 500,
                  padding: "4px 8px",
                  border: "1px solid rgba(0,128,255,0.20)",
                  borderRadius: "4px",
                  background: "rgba(0,128,255,0.04)",
                }}
              >
                Inspect
                <ExternalLink style={{ width: "10px", height: "10px" }} />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
