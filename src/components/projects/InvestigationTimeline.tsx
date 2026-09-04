"use client";

import React from "react";
import { TimelineEvent } from "@/types/project-investigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/formatters";
import {
  Clock,
  FolderPlus,
  CheckCircle2,
  IndianRupee,
  MapPin,
  AlertCircle,
  UserCheck,
} from "lucide-react";

interface InvestigationTimelineProps {
  events: TimelineEvent[];
}

const eventTypeIcons: Record<TimelineEvent["type"], React.ReactNode> = {
  project_registered: <FolderPlus style={{ width: "14px", height: "14px", color: "#0080FF" }} />,
  admin_approval: <CheckCircle2 style={{ width: "14px", height: "14px", color: "#00875A" }} />,
  financial_record: <IndianRupee style={{ width: "14px", height: "14px", color: "#B76E00" }} />,
  physical_evidence: <MapPin style={{ width: "14px", height: "14px", color: "#6554C0" }} />,
  anomaly_signal: <AlertCircle style={{ width: "14px", height: "14px", color: "#DE350B" }} />,
  human_review: <UserCheck style={{ width: "14px", height: "14px", color: "#0080FF" }} />,
};

const eventBadgeStyles: Record<TimelineEvent["type"], { bg: string; text: string; border: string }> = {
  project_registered: { bg: "#EBF5FF", text: "#0080FF", border: "#B3D7FF" },
  admin_approval: { bg: "#E3FCEF", text: "#00875A", border: "#ABF5D1" },
  financial_record: { bg: "#FFF8E6", text: "#B76E00", border: "#FFE399" },
  physical_evidence: { bg: "#F3F0FF", text: "#6554C0", border: "#D8CCF4" },
  anomaly_signal: { bg: "#FFEBE6", text: "#DE350B", border: "#FFBDAD" },
  human_review: { bg: "#EBF5FF", text: "#0080FF", border: "#B3D7FF" },
};

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({ events }) => {
  return (
    <Card variant="default">
      <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              <Clock style={{ width: "15px", height: "15px" }} />
            </div>
            <div>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                Investigation & Milestone Timeline
              </CardTitle>
              <p style={{ fontSize: "11px", color: "#6B7A8E", margin: "2px 0 0" }}>
                Chronological sequence of project registration, financial releases, and anomaly signals
              </p>
            </div>
          </div>
          <span
            style={{
              fontSize: "10px",
              fontFamily: "JetBrains Mono, monospace",
              color: "#6B7A8E",
              background: "#F0F3F7",
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid #DDE2EA",
            }}
          >
            Demo Audit History
          </span>
        </div>
      </CardHeader>

      <CardContent style={{ paddingTop: "16px" }}>
        <div
          style={{
            position: "relative",
            paddingLeft: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Timeline continuous vertical rule */}
          <div
            style={{
              position: "absolute",
              left: "9px",
              top: "6px",
              bottom: "6px",
              width: "2px",
              background: "#DDE2EA",
            }}
          />

          {events.map((event) => {
            const icon = eventTypeIcons[event.type] || <Clock style={{ width: "14px", height: "14px", color: "#6B7A8E" }} />;
            const badgeStyle =
              eventBadgeStyles[event.type] || { bg: "#F0F3F7", text: "#4A5568", border: "#DDE2EA" };

            return (
              <div key={event.id} style={{ position: "relative" }}>
                {/* Node icon */}
                <div
                  style={{
                    position: "absolute",
                    left: "-24px",
                    top: "2px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    border: "1px solid #DDE2EA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 1px 2px rgba(15,23,36,0.05)",
                  }}
                >
                  {icon}
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                    border: "1px solid #DDE2EA",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#0F1724", margin: 0 }}>{event.title}</h4>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: "999px",
                          background: badgeStyle.bg,
                          color: badgeStyle.text,
                          border: `1px solid ${badgeStyle.border}`,
                        }}
                      >
                        {event.actor}
                      </span>
                    </div>
                    <span style={{ fontSize: "10px", fontFamily: "JetBrains Mono, monospace", color: "#6B7A8E" }}>
                      {formatDate(event.timestamp)}
                    </span>
                  </div>

                  <p style={{ fontSize: "11px", color: "#4A5568", lineHeight: 1.5, margin: 0 }}>{event.description}</p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "10px",
                      color: "#6B7A8E",
                      borderTop: "1px solid #F0F3F7",
                      paddingTop: "4px",
                    }}
                  >
                    <span style={{ fontStyle: "italic" }}>Source: {event.source}</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace" }}>ID: {event.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "8px 12px",
            borderRadius: "6px",
            background: "#F8F9FB",
            border: "1px solid #DDE2EA",
            fontSize: "11px",
            color: "#6B7A8E",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Audit chronological trail established from registered project milestones.</span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "#0080FF" }}>Verified Sequence</span>
        </div>
      </CardContent>
    </Card>
  );
};
