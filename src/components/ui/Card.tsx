import React from "react";

type CardVariant = "default" | "elevated";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPad?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  noPad,
  style,
  ...props
}) => {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DDE2EA",
        borderRadius: "8px",
        boxShadow: variant === "elevated"
          ? "0 2px 6px 0 rgba(15,23,36,0.08)"
          : "0 1px 2px 0 rgba(15,23,36,0.04)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader: React.FC<CardHeaderProps> = ({ children, style, ...props }) => (
  <div
    style={{
      padding: "16px 20px 12px",
      borderBottom: "1px solid #F1F3F7",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle: React.FC<CardTitleProps> = ({ children, style, ...props }) => (
  <h3
    style={{
      fontSize: "14px",
      fontWeight: 600,
      color: "#0F1724",
      margin: 0,
      lineHeight: 1.3,
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export const CardDescription: React.FC<CardDescriptionProps> = ({ children, style, ...props }) => (
  <p
    style={{
      fontSize: "12px",
      color: "#6B7A8E",
      margin: "4px 0 0",
      lineHeight: 1.5,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardContent: React.FC<CardContentProps> = ({ children, style, ...props }) => (
  <div
    style={{ padding: "16px 20px", ...style }}
    {...props}
  >
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardFooter: React.FC<CardFooterProps> = ({ children, style, ...props }) => (
  <div
    style={{
      padding: "12px 20px",
      borderTop: "1px solid #F1F3F7",
      display: "flex",
      alignItems: "center",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
