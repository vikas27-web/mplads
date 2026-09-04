import React from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "#0080FF",
    color: "#FFFFFF",
    border: "1px solid #0080FF",
  },
  outline: {
    background: "transparent",
    color: "#3D4B5C",
    border: "1px solid #DDE2EA",
  },
  ghost: {
    background: "transparent",
    color: "#3D4B5C",
    border: "1px solid transparent",
  },
  secondary: {
    background: "#F1F3F7",
    color: "#3D4B5C",
    border: "1px solid #DDE2EA",
  },
  danger: {
    background: "#FEF2F2",
    color: "#C0392B",
    border: "1px solid #FECACA",
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: "12px", padding: "5px 10px", gap: "4px" },
  md: { fontSize: "13px", padding: "7px 14px", gap: "6px" },
  lg: { fontSize: "14px", padding: "9px 18px", gap: "8px" },
};

export const Button: React.FC<ButtonProps> = ({
  variant = "outline",
  size = "md",
  leftIcon,
  rightIcon,
  loading,
  children,
  disabled,
  style,
  ...props
}) => {
  const vs = VARIANT_STYLES[variant];
  const ss = SIZE_STYLES[size];

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "inherit",
        fontWeight: 500,
        borderRadius: "6px",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.55 : 1,
        transition: "background 0.12s, opacity 0.12s",
        whiteSpace: "nowrap",
        ...vs,
        ...ss,
        ...style,
      }}
      {...props}
    >
      {leftIcon}
      {loading ? "Loading…" : children}
      {rightIcon}
    </button>
  );
};
