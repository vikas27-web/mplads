import React from "react";

/* ============================================================
   Institutional Table Components
   ============================================================ */

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Table: React.FC<TableProps> = ({ children, style, ...props }) => (
  <div
    style={{
      width: "100%",
      overflowX: "auto",
      border: "1px solid #DDE2EA",
      borderRadius: "8px",
      background: "#FFFFFF",
      ...style,
    }}
    {...props}
  >
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px",
      }}
    >
      {children}
    </table>
  </div>
);

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export const TableHeader: React.FC<TableHeaderProps> = ({ children, ...props }) => (
  <thead
    style={{ background: "#F8F9FB", borderBottom: "1px solid #DDE2EA" }}
    {...props}
  >
    {children}
  </thead>
);

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export const TableBody: React.FC<TableBodyProps> = ({ children, ...props }) => (
  <tbody {...props}>{children}</tbody>
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
export const TableRow: React.FC<TableRowProps> = ({ children, style, ...props }) => (
  <tr
    style={{
      borderBottom: "1px solid #F1F3F7",
      transition: "background 0.1s",
      ...style,
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.background = "#F8F9FB";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.background = "transparent";
    }}
    {...props}
  >
    {children}
  </tr>
);

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
export const TableHead: React.FC<TableHeadProps> = ({ children, style, ...props }) => (
  <th
    style={{
      padding: "10px 14px",
      textAlign: "left",
      fontSize: "11px",
      fontWeight: 600,
      color: "#6B7A8E",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      ...style,
    }}
    {...props}
  >
    {children}
  </th>
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}
export const TableCell: React.FC<TableCellProps> = ({ children, style, ...props }) => (
  <td
    style={{
      padding: "10px 14px",
      color: "#3D4B5C",
      verticalAlign: "middle",
      ...style,
    }}
    {...props}
  >
    {children}
  </td>
);
