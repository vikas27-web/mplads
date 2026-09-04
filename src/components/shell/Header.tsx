"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, LogOut } from "lucide-react";

export interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/dashboard": "Audit Portfolio Dashboard",
  "/projects": "Project Explorer",
  "/signals": "Priority Audit Signals",
  "/investigations": "Audit Investigation Queue",
  "/analytics": "Regional & Statistical Analytics",
};

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed with redirect regardless
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const getTitle = () => {
    if (routeTitles[pathname]) return routeTitles[pathname];
    if (pathname.startsWith("/projects/")) return "Project Investigation";
    if (pathname.startsWith("/investigations/")) return "Investigation Dossier";
    return "MPLAD SENTINEL";
  };

  return (
    <header
      style={{
        height: "56px",
        background: "#FFFFFF",
        borderBottom: "1px solid #DDE2EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Left: breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden"
          style={{
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #DDE2EA",
            background: "transparent",
            cursor: "pointer",
            color: "#6B7A8E",
          }}
          aria-label="Toggle navigation"
        >
          <Menu style={{ width: "16px", height: "16px" }} />
        </button>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "11px", color: "#9BA8B5", letterSpacing: "0.02em" }}>
            MPLAD SENTINEL
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#0F1724", lineHeight: 1.2 }}>
            {getTitle()}
          </span>
        </div>
      </div>

      {/* Right: notices + auditor identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Official dataset notice */}
        <span
          className="hidden sm:inline-flex items-center gap-1"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 9px",
            background: "#F0F7FF",
            border: "1px solid #B3D7FF",
            color: "#0052B3",
            borderRadius: "4px",
            letterSpacing: "0.02em",
          }}
        >
          OFFICIAL SIH DATASET • AUDIT PROTOTYPE
        </span>

        {/* Responsible AI notice */}
        <span
          className="hidden lg:inline-flex"
          style={{
            fontSize: "10px",
            padding: "3px 8px",
            background: "#F8F9FA",
            border: "1px solid #E2E8F0",
            color: "#475569",
            borderRadius: "4px",
          }}
        >
          Anomaly signal does not equal fraud. Evidence requires human verification.
        </span>

        {/* System status */}
        <span
          className="hidden sm:inline-flex items-center gap-1.5"
          style={{
            fontSize: "11px",
            padding: "2px 10px",
            background: "#F0FFF4",
            border: "1px solid #A7F3D0",
            color: "#276749",
            borderRadius: "12px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#276749",
              display: "inline-block",
            }}
          />
          Systems Operational
        </span>

        {/* Auditor avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingLeft: "12px",
            borderLeft: "1px solid #DDE2EA",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#F1F3F7",
              border: "1px solid #DDE2EA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User style={{ width: "14px", height: "14px", color: "#6B7A8E" }} />
          </div>
          <div className="hidden xl:flex" style={{ flexDirection: "column" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#0F1724" }}>SIH Auditor</span>
            <span style={{ fontSize: "10px", color: "#9BA8B5" }}>Field Verification</span>
          </div>
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign Out of Auditor Session"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 10px",
            fontSize: "12px",
            fontWeight: 500,
            color: "#6B7A8E",
            background: "#F8F9FB",
            border: "1px solid #DDE2EA",
            borderRadius: "6px",
            cursor: isLoggingOut ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#DC2626";
            e.currentTarget.style.borderColor = "#FCA5A5";
            e.currentTarget.style.background = "#FEF2F2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7A8E";
            e.currentTarget.style.borderColor = "#DDE2EA";
            e.currentTarget.style.background = "#F8F9FB";
          }}
          aria-label="Sign out"
        >
          <LogOut style={{ width: "13px", height: "13px" }} />
          <span className="hidden sm:inline">{isLoggingOut ? "Signing Out..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
};
