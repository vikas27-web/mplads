"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { AppShell } from "./AppShell";

export const AppLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
};
