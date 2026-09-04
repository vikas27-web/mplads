import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ProjectPaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export const ProjectPagination: React.FC<ProjectPaginationProps> = ({
  page,
  totalPages,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
}) => {
  const start = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalCount);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 16px",
        background: "#FFFFFF",
        border: "1px solid #DDE2EA",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#6B7A8E",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span>
          Showing{" "}
          <strong style={{ color: "#0F1724", fontVariantNumeric: "tabular-nums" }}>{start}</strong>–
          <strong style={{ color: "#0F1724", fontVariantNumeric: "tabular-nums" }}>{end}</strong>{" "}
          of{" "}
          <strong style={{ color: "#0F1724", fontVariantNumeric: "tabular-nums" }}>
            {totalCount.toLocaleString()}
          </strong>{" "}
          projects
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            paddingLeft: "12px",
            borderLeft: "1px solid #DDE2EA",
          }}
        >
          <span>Rows:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{
              background: "#F8F9FB",
              border: "1px solid #DDE2EA",
              borderRadius: "4px",
              padding: "2px 6px",
              fontSize: "12px",
              color: "#0F1724",
              outline: "none",
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span>
          Page{" "}
          <strong style={{ color: "#0F1724" }}>{page}</strong> of{" "}
          <strong style={{ color: "#0F1724" }}>{totalPages}</strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          style={{ padding: "4px 8px" }}
        >
          <ChevronLeft style={{ width: "14px", height: "14px" }} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          style={{ padding: "4px 8px" }}
        >
          <ChevronRight style={{ width: "14px", height: "14px" }} />
        </Button>
      </div>
    </div>
  );
};
