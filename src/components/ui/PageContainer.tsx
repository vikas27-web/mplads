import React from "react";

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  showDisclaimer?: boolean;
  showAiNotice?: boolean;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  className,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className={className}>
      {/* Page header */}
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {title && (
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0F1724", margin: 0 }}>
                  {title}
                </h1>
              )}
              {badge}
            </div>
            {subtitle && (
              <p style={{ fontSize: "13px", color: "#6B7A8E", margin: 0, lineHeight: 1.5 }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      {children}
    </div>
  );
};
