import React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  className,
  ...props
}) => {
  if (orientation === "vertical") {
    return <div className={cn("w-px h-full bg-[#DDE2EA] shrink-0", className)} {...props} />;
  }

  return <div className={cn("w-full h-px bg-[#DDE2EA] shrink-0 my-4", className)} {...props} />;
};
