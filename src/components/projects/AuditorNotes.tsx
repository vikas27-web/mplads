"use client";

import React, { useState } from "react";
import { AuditorNote } from "@/types/project-investigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { FileEdit, Send, Clock, User } from "lucide-react";

interface AuditorNotesProps {
  notes: AuditorNote[];
  onAddNote: (newNote: AuditorNote) => void;
}

export const AuditorNotes: React.FC<AuditorNotesProps> = ({ notes, onAddNote }) => {
  const { showToast } = useToast();
  const [noteContent, setNoteContent] = useState("");
  const [authorName, setAuthorName] = useState("Field Auditor");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const newNote: AuditorNote = {
      id: `NOTE-${Date.now()}`,
      timestamp:
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " " +
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) +
        " IST",
      author: authorName.trim() || "Auditor",
      note: noteContent.trim(),
      isSessionOnly: true,
    };

    onAddNote(newNote);
    setNoteContent("");

    showToast({
      type: "info",
      title: "Auditor Note Recorded",
      message: "Observation appended to the project audit record.",
    });
  };

  return (
    <Card variant="default">
      <CardHeader style={{ borderBottom: "1px solid #DDE2EA", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                padding: "6px",
                borderRadius: "6px",
                background: "#EBF5FF",
                color: "#0080FF",
                border: "1px solid #B3D7FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileEdit style={{ width: "15px", height: "15px", color: "#0080FF" }} />
            </div>
            <div>
              <CardTitle style={{ fontSize: "14px", fontWeight: 700, color: "#0F1724" }}>
                Human Auditor Notes
              </CardTitle>
              <p style={{ fontSize: "11px", color: "#6B7A8E", margin: "2px 0 0" }}>
                Auditor observations, site inspection remarks, and factual annotations
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ paddingTop: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Form to submit note */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "12px",
            borderRadius: "8px",
            background: "#F8F9FB",
            border: "1px solid #DDE2EA",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#6B7A8E" }}>
            <User style={{ width: "13px", height: "13px", color: "#0080FF" }} />
            <span style={{ fontWeight: 600 }}>Auditor:</span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              style={{
                background: "#FFFFFF",
                border: "1px solid #DDE2EA",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "11px",
                color: "#0F1724",
                outline: "none",
              }}
              placeholder="Auditor Name / Designation"
            />
          </div>

          <textarea
            rows={3}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Enter factual observations, discrepancy checks, or site inspection notes..."
            style={{
              width: "100%",
              fontSize: "12px",
              padding: "8px 10px",
              borderRadius: "6px",
              background: "#FFFFFF",
              border: "1px solid #DDE2EA",
              color: "#0F1724",
              outline: "none",
              lineHeight: 1.5,
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!noteContent.trim()}
              leftIcon={<Send style={{ width: "13px", height: "13px" }} />}
            >
              Add Note
            </Button>
          </div>
        </form>

        {/* Notes List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7A8E" }}>
            Auditor Notes ({notes.length})
          </span>

          {notes.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#6B7A8E", fontStyle: "italic", padding: "8px 0" }}>
              No auditor notes recorded yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
              {notes.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: "#FFFFFF",
                    border: "1px solid #DDE2EA",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F1724" }}>{item.author}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "JetBrains Mono, monospace",
                        color: "#6B7A8E",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock style={{ width: "11px", height: "11px" }} />
                      {item.timestamp}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "11px",
                      color: "#3D4B5C",
                      lineHeight: 1.5,
                      background: "#F8F9FB",
                      padding: "8px 10px",
                      borderRadius: "4px",
                      border: "1px solid #DDE2EA",
                      margin: 0,
                    }}
                  >
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
