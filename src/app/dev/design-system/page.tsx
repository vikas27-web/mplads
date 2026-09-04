"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Divider } from "@/components/ui/Divider";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import { Bell, Info, ShieldAlert, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Internal Design System Showcase"
        description="Development verification view for Phase 2 UI primitives, accessibility attributes, and shell components."
        badge={<Badge variant="info">Dev Only</Badge>}
      />

      {/* 1. Severity Badges */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Severity & Signal Primitives</CardTitle>
          <CardDescription>
            Presentational severity indicators communicating signals through text labels, Lucide icons, and borders (color is not the only signal).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <SeverityBadge severity="LOW" />
          <SeverityBadge severity="MEDIUM" />
          <SeverityBadge severity="HIGH" />
          <SeverityBadge severity="CRITICAL" />
          <SeverityBadge severity="ANOMALY" />
        </CardContent>
      </Card>

      {/* 2. Interactive Toasts & Modals */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Interactive Elements (Modal & Toasts)</CardTitle>
          <CardDescription>Test accessible modal dialogs and dynamic notification triggers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Bell className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Open Verification Modal
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              onClick={() => showToast({ type: "success", title: "Audit Log Recorded", message: "Physical inspection log saved." })}
            >
              Trigger Success Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
              onClick={() => showToast({ type: "warning", title: "Inconsistency Flag", message: "Potential expenditure gap flagged." })}
            >
              Trigger Warning Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
              onClick={() => showToast({ type: "error", title: "Connection Failed", message: "Unable to reach audit endpoint." })}
            >
              Trigger Error Toast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Table Primitive */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Table Foundation Primitive</CardTitle>
          <CardDescription>Standard styling for project ledgers, audit cases, and analytics tables.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample Code</TableHead>
                <TableHead>Constituency</TableHead>
                <TableHead>Signal Level</TableHead>
                <TableHead>Verification Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-slate-300">MPLAD-EX-001</TableCell>
                <TableCell>Bangalore South</TableCell>
                <TableCell><SeverityBadge severity="LOW" size="sm" /></TableCell>
                <TableCell><Badge variant="success" dot>Verified</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-slate-300">MPLAD-EX-002</TableCell>
                <TableCell>Mysore</TableCell>
                <TableCell><SeverityBadge severity="HIGH" size="sm" /></TableCell>
                <TableCell><Badge variant="warning" dot>Pending Inspection</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Divider />

      {/* 4. State Primitives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LoadingState title="Loading ledgers..." description="Fetching official audit data." />
        <EmptyState title="No records found" description="Adjust your filter parameters." />
        <ErrorState title="Failed to load" description="Unable to connect to backend." onRetry={() => {}} />
      </div>

      {/* Modal Dialog Instance */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Sample Audit Verification Dialog</ModalTitle>
          <ModalDescription>
            Reusable modal container for evidence details, filter configurations, and human verification confirmation.
          </ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div style={{ padding: "12px", background: "#F8F9FB", borderRadius: "6px", border: "1px solid #DDE2EA", fontSize: "12px", color: "#3D4B5C" }}>
            <p style={{ margin: 0 }}><strong>Note:</strong> Closing this modal via backdrop, X button, or ESC key satisfies accessible keyboard navigation requirements.</p>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setIsModalOpen(false); showToast({ type: "info", title: "Action Confirmed" }); }}>
            Confirm Action
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
