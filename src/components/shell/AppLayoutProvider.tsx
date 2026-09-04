"use client";

import React from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { AppShell } from "./AppShell";

export const AppLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
};
