"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [auditorId, setAuditorId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFillDemo = (id: string, pass: string) => {
    setAuditorId(id);
    setPassword(pass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditorId.trim() || !password) {
      setErrorMessage("Please enter both Auditor ID and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditorId: auditorId.trim(),
          password,
          remember,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Successful login
        router.push(from);
        router.refresh();
      } else {
        setErrorMessage(data.error || "Authentication failed. Invalid auditor credentials.");
      }
    } catch {
      setErrorMessage("Connection error while communicating with audit authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F9FB",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: "#0F1724",
      }}
    >
      {/* Top Institutional Header Banner */}
      <header
        style={{
          borderBottom: "1px solid #DDE2EA",
          background: "#FFFFFF",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              background: "#0080ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
            }}
          >
            <Shield style={{ width: "18px", height: "18px" }} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em", color: "#0F1724" }}>
              MPLAD SENTINEL
            </div>
            <div style={{ fontSize: "11px", color: "#6B7A8E", fontWeight: 500 }}>
              AI-Powered MPLAD Scheme Audit Intelligence • SIH26102
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 10px",
              background: "#F0F7FF",
              border: "1px solid #B3D7FF",
              color: "#0052B3",
              borderRadius: "4px",
              letterSpacing: "0.02em",
            }}
          >
            OFFICIAL SIH DATASET • AUDIT PROTOTYPE
          </span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
          }}
        >
          {/* Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #DDE2EA",
              borderRadius: "8px",
              padding: "32px 32px 28px",
              boxShadow: "0 1px 3px rgba(15, 23, 36, 0.04), 0 4px 12px rgba(15, 23, 36, 0.03)",
            }}
          >
            {/* Header within Card */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#0080ff",
                  background: "rgba(0, 128, 255, 0.08)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  marginBottom: "12px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                <Lock style={{ width: "12px", height: "12px" }} />
                Secure Auditor Access
              </div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0F1724",
                  marginBottom: "6px",
                  letterSpacing: "-0.02em",
                }}
              >
                Sign In to Sentinel
              </h1>
              <p style={{ fontSize: "13px", color: "#6B7A8E", lineHeight: "1.5" }}>
                Enter your authorized audit credentials to inspect project anomalies, vouchers, and statutory dossiers.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  borderRadius: "6px",
                  color: "#991B1B",
                  fontSize: "13px",
                  marginBottom: "20px",
                  lineHeight: "1.4",
                }}
              >
                <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "2px" }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Auditor ID field */}
              <div>
                <label
                  htmlFor="auditorId"
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#2C3A4B",
                    marginBottom: "6px",
                  }}
                >
                  Official Email / Auditor ID
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9BA8B5",
                      pointerEvents: "none",
                      display: "flex",
                    }}
                  >
                    <User style={{ width: "16px", height: "16px" }} />
                  </div>
                  <input
                    id="auditorId"
                    type="text"
                    value={auditorId}
                    onChange={(e) => setAuditorId(e.target.value)}
                    placeholder="auditor@mplad.gov.in or AUD-26102"
                    autoComplete="username"
                    required
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 36px",
                      fontSize: "13px",
                      border: "1px solid #DDE2EA",
                      borderRadius: "6px",
                      color: "#0F1724",
                      background: "#FFFFFF",
                      outline: "none",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0080ff")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#DDE2EA")}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#2C3A4B",
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9BA8B5",
                      pointerEvents: "none",
                      display: "flex",
                    }}
                  >
                    <Lock style={{ width: "16px", height: "16px" }} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%",
                      padding: "9px 38px 9px 36px",
                      fontSize: "13px",
                      border: "1px solid #DDE2EA",
                      borderRadius: "6px",
                      color: "#0F1724",
                      background: "#FFFFFF",
                      outline: "none",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0080ff")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#DDE2EA")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#9BA8B5",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: "16px", height: "16px" }} />
                    ) : (
                      <Eye style={{ width: "16px", height: "16px" }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember session checkbox */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "#4B5B6E",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{
                      accentColor: "#0080ff",
                      width: "14px",
                      height: "14px",
                      cursor: "pointer",
                    }}
                  />
                  Remember this session (7 days)
                </label>

                <span style={{ fontSize: "11px", color: "#9BA8B5" }}>SIH26102 Secure Portal</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "10px 16px",
                  background: isLoading ? "#75B4FF" : "#0080ff",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "background-color 0.15s ease",
                  marginTop: "4px",
                }}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Audit Sentinel</span>
                    <ArrowRight style={{ width: "15px", height: "15px" }} />
                  </>
                )}
              </button>
            </form>

            {/* SIH Demo Quick Fill Helper */}
            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid #EDF1F6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "#6B7A8E",
                  }}
                >
                  Demo Evaluator Access
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#059669",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                  SIH Prototype Authentication
                </span>
              </div>

              <div
                style={{
                  background: "#F8F9FB",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  fontSize: "12px",
                  color: "#334155",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Auditor ID:</span>
                  <code style={{ fontWeight: 600, color: "#0F172A" }}>auditor@mplad.gov.in</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Password:</span>
                  <code style={{ fontWeight: 600, color: "#0F172A" }}>Sentinel@2024</code>
                </div>

                <button
                  type="button"
                  onClick={() => handleFillDemo("auditor@mplad.gov.in", "Sentinel@2024")}
                  style={{
                    marginTop: "6px",
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "4px",
                    padding: "5px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#0080ff",
                    cursor: "pointer",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Auto-fill Prototype Credentials
                </button>
                <div style={{ fontSize: "10px", color: "#64748B", textAlign: "center", marginTop: "4px" }}>
                  Prototype demonstration credentials for SIH26102 evaluation — not actual government credentials.
                </div>
              </div>
            </div>
          </div>

          {/* Access notice under card */}
          <div
            style={{
              textAlign: "center",
              marginTop: "16px",
              fontSize: "12px",
              color: "#6B7A8E",
            }}
          >
            Authorized Audit Personnel Only • Department of Audit & Program Implementation
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer
        style={{
          borderTop: "1px solid #DDE2EA",
          background: "#FFFFFF",
          padding: "14px 28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          fontSize: "11px",
          color: "#6B7A8E",
        }}
      >
        <div>
          <strong>Responsible AI Notice:</strong> Anomaly signal does not equal fraud. Physical verification & human
          investigation required.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>SIH26102 • MPLAD Audit Intelligence Platform</span>
          <span>Version 1.0.0</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#F8F9FB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', sans-serif",
            color: "#6B7A8E",
            fontSize: "14px",
          }}
        >
          Loading Sentinel Security Portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
