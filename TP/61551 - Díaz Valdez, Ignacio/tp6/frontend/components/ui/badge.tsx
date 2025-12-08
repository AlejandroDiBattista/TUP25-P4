import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  const base =
    variant === "default"
      ? "bg-indigo-600 text-white"
      : variant === "outline"
      ? "border border-gray-300 text-gray-700"
      : "bg-gray-100 text-gray-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        base,
        className
      )}
      {...props}
    />
  );
}
