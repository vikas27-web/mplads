"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F9FB",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((p) => !p)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,36,0.4)",
            zIndex: 40,
          }}
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transform: isMobileSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
        className="md:hidden flex"
      >
        <Sidebar isCollapsed={false} onToggleCollapse={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* Main content column */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen((p) => !p)} />
        <main
          style={{
            flex: 1,
            padding: "24px 28px",
            maxWidth: "1280px",
            width: "100%",
            margin: "0 auto",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
