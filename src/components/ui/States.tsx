import React from "react";
import { Loader2, Inbox, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "./Button";

/* ============================================================
   Professional institutional state components
   ============================================================ */

export interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Loading data...",
  description = "Retrieving information from audit intelligence backend.",
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        gap: "12px",
        background: "#FFFFFF",
        border: "1px solid #DDE2EA",
        borderRadius: "8px",
      }}
    >
      <Loader2 style={{ width: "28px", height: "28px", color: "#0080FF" }} className="animate-spin" />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#0F1724" }}>{title}</span>
        {description && (
          <span style={{ fontSize: "12px", color: "#6B7A8E", maxWidth: "320px" }}>{description}</span>
        )}
      </div>
    </div>
  );
};

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "No data matches your specified query parameters.",
  action,
  icon,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        gap: "16px",
        background: "#FFFFFF",
        border: "1px solid #DDE2EA",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#F1F3F7",
          border: "1px solid #DDE2EA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9BA8B5",
        }}
      >
        {icon || <Inbox style={{ width: "20px", height: "20px" }} />}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "360px" }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#0F1724" }}>{title}</span>
        {description && (
          <span style={{ fontSize: "12px", color: "#6B7A8E", lineHeight: 1.5 }}>{description}</span>
        )}
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Unable to retrieve data",
  description = "An error occurred while fetching audit data. Please verify backend connectivity.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        gap: "16px",
        background: "#FEF2F2",
        border: "1px solid #FECACA",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C0392B",
        }}
      >
        <AlertCircle style={{ width: "20px", height: "20px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "400px" }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#C0392B" }}>{title}</span>
        {description && (
          <span style={{ fontSize: "12px", color: "#D35400", lineHeight: 1.5 }}>{description}</span>
        )}
      </div>
      {onRetry && (
        <Button
          variant="danger"
          size="sm"
          leftIcon={<RefreshCw style={{ width: "12px", height: "12px" }} />}
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export interface SuccessStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = "Complete",
  description = "The request finished successfully.",
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 24px",
        textAlign: "center",
        gap: "12px",
        background: "#F0FFF4",
        border: "1px solid #A7F3D0",
        borderRadius: "8px",
      }}
    >
      <CheckCircle2 style={{ width: "28px", height: "28px", color: "#276749" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#276749" }}>{title}</span>
        {description && (
          <span style={{ fontSize: "12px", color: "#276749", opacity: 0.8 }}>{description}</span>
        )}
      </div>
    </div>
  );
};
