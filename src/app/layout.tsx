import type { Metadata } from "next";
import "./globals.css";
import { AppLayoutProvider } from "@/components/shell/AppLayoutProvider";

export const metadata: Metadata = {
  title: "MPLAD SENTINEL — Audit Intelligence Platform",
  description:
    "Anomaly detection and audit intelligence platform for the MPLAD Scheme (SIH26102). Official SIH26102 dataset with explainable audit intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppLayoutProvider>{children}</AppLayoutProvider>
      </body>
    </html>
  );
}
