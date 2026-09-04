import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, LayoutDashboard, FolderSearch, BarChart3, FileSearch, ArrowRight } from "lucide-react";

export default function HomePage() {
  const routes = [
    {
      title: "Audit Dashboard",
      description: "Scheme-wide portfolio overview and high-level anomaly breakdown.",
      path: "/dashboard",
      icon: <LayoutDashboard style={{ width: "20px", height: "20px", color: "#0080FF" }} />,
      status: "Phase 8 Pipeline",
    },
    {
      title: "Project Explorer",
      description: "Search, filter, and inspect recommended works across constituencies.",
      path: "/projects",
      icon: <FolderSearch style={{ width: "20px", height: "20px", color: "#276749" }} />,
      status: "Phase 6 Database",
    },
    {
      title: "Statistical Analytics",
      description: "Agency concentration, time-series shifts, and distribution patterns.",
      path: "/analytics",
      icon: <BarChart3 style={{ width: "20px", height: "20px", color: "#B7791F" }} />,
      status: "Phase 7 Features",
    },
    {
      title: "Audit Investigations",
      description: "Field verification logging, evidence dossiers, and physical audits.",
      path: "/investigations",
      icon: <FileSearch style={{ width: "20px", height: "20px", color: "#C0392B" }} />,
      status: "Phase 9 Integration",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Hero Banner */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #DDE2EA",
          borderRadius: "8px",
          padding: "24px 28px",
          boxShadow: "0 1px 3px 0 rgba(15,23,36,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "#0080FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck style={{ width: "20px", height: "20px", color: "white" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0F1724", margin: 0 }}>
                MPLAD SENTINEL
              </h1>
              <p style={{ fontSize: "12px", color: "#6B7A8E", margin: "2px 0 0" }}>
                AI Anomaly Detection &amp; Audit Intelligence Platform · SIH26102
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <Badge variant="info">Audit Prototype</Badge>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          {[
            {
              label: "Core Principle",
              title: "Anomaly Signal ≠ Fraud",
              body: "All flagged signals require physical inspection & human review before administrative action.",
            },
            {
              label: "Data Integrity",
              title: "Authoritative Backend",
              body: "Zero risk calculations performed on the client. All intelligence served from Phase 8 anomaly engine.",
            },
            {
              label: "Prototype",
              title: "SIH 2026 Demo",
              body: "Synthetic deterministic dataset (300 projects). For demonstration purposes only.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "14px 16px",
                background: "#F8F9FB",
                border: "1px solid #DDE2EA",
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#9BA8B5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#0F1724", marginTop: "4px" }}>{item.title}</div>
              <div style={{ fontSize: "11px", color: "#6B7A8E", marginTop: "4px", lineHeight: 1.5 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#0F1724", margin: "0 0 12px" }}>
          Application Modules
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {routes.map((route) => (
            <Card key={route.path} style={{ display: "flex", flexDirection: "column" }}>
              <CardHeader>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {route.icon}
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#9BA8B5",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {route.status}
                  </span>
                </div>
                <CardTitle style={{ marginTop: "8px" }}>{route.title}</CardTitle>
                <CardDescription>{route.description}</CardDescription>
              </CardHeader>
              <CardFooter style={{ marginTop: "auto" }}>
                <Link href={route.path} style={{ width: "100%", textDecoration: "none" }}>
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ArrowRight style={{ width: "12px", height: "12px" }} />}
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    Open Module
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
