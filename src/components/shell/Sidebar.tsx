"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderSearch,
  BarChart3,
  FileSearch,
  AlertTriangle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Project Explorer", path: "/projects", icon: FolderSearch },
  { label: "Audit Signals", path: "/signals", icon: AlertTriangle },
  { label: "Investigations", path: "/investigations", icon: FileSearch },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, className }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <aside
      style={{
        width: isCollapsed ? "56px" : "240px",
        minWidth: isCollapsed ? "56px" : "240px",
        transition: "width 0.2s, min-width 0.2s",
        background: "#FFFFFF",
        borderRight: "1px solid #DDE2EA",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 30,
        flexShrink: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
      aria-label="Main Navigation"
      className={className}
    >
      {/* Brand */}
      <div
        style={{
          height: "56px",
          borderBottom: "1px solid #DDE2EA",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          flexShrink: 0,
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", overflow: "hidden" }}
          aria-label="MPLAD SENTINEL Home"
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              background: "#0080FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck style={{ width: "16px", height: "16px", color: "white" }} />
          </div>
          {!isCollapsed && (
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F1724", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                MPLAD SENTINEL
              </span>
              <span style={{ fontSize: "10px", color: "#6B7A8E", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                Audit Intelligence
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            display: "none",
            padding: "4px",
            borderRadius: "4px",
            border: "1px solid #DDE2EA",
            background: "transparent",
            cursor: "pointer",
            color: "#6B7A8E",
            flexShrink: 0,
          }}
          className="md:flex"
        >
          {isCollapsed ? (
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          ) : (
            <ChevronLeft style={{ width: "14px", height: "14px" }} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: active ? 600 : 400,
                fontSize: "13px",
                color: active ? "#0080FF" : "#3D4B5C",
                background: active ? "rgba(0,128,255,0.08)" : "transparent",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "#F1F3F7";
                  (e.currentTarget as HTMLElement).style.color = "#0F1724";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#3D4B5C";
                }
              }}
            >
              <Icon
                style={{
                  width: "16px",
                  height: "16px",
                  flexShrink: 0,
                  color: active ? "#0080FF" : "#6B7A8E",
                }}
              />
              {!isCollapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div
          style={{
            padding: "12px 12px",
            borderTop: "1px solid #DDE2EA",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#3D4B5C" }}>SIH26102</span>
          </div>
          <p style={{ fontSize: "10px", color: "#9BA8B5", lineHeight: 1.4, margin: 0 }}>
            AI Anomaly Detection — MPLAD Scheme
          </p>
        </div>
      )}
    </aside>
  );
};
