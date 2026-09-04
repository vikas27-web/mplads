"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const MAX_WIDTHS = { sm: "400px", md: "560px", lg: "720px", xl: "880px" };

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidth = "md" }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handler);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(15,23,36,0.45)",
      }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        style={{
          width: "100%",
          maxWidth: MAX_WIDTHS[maxWidth],
          background: "#FFFFFF",
          border: "1px solid #DDE2EA",
          borderRadius: "8px",
          boxShadow: "0 8px 32px rgba(15,23,36,0.18)",
          padding: "24px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            padding: "4px",
            borderRadius: "4px",
            border: "1px solid #DDE2EA",
            background: "transparent",
            cursor: "pointer",
            color: "#6B7A8E",
          }}
        >
          <X style={{ width: "14px", height: "14px" }} />
        </button>
        {children}
      </div>
    </div>
  );
};

export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className, style }) => (
  <div className={className} style={{ paddingRight: "24px", marginBottom: "16px", ...style }}>{children}</div>
);

export const ModalTitle: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className, style }) => (
  <h3 className={className} style={{ fontSize: "16px", fontWeight: 700, color: "#0F1724", margin: 0, ...style }}>{children}</h3>
);

export const ModalDescription: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className, style }) => (
  <p className={className} style={{ fontSize: "12px", color: "#6B7A8E", margin: "4px 0 0", lineHeight: 1.5, ...style }}>{children}</p>
);

export const ModalContent: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className, style }) => (
  <div className={className} style={{ fontSize: "13px", color: "#3D4B5C", ...style }}>{children}</div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className, style }) => (
  <div
    className={className}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "8px",
      paddingTop: "16px",
      borderTop: "1px solid #DDE2EA",
      marginTop: "16px",
      ...style,
    }}
  >
    {children}
  </div>
);
