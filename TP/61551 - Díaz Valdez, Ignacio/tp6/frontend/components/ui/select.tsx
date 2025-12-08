import * as React from "react";
import { cn } from "@/lib/utils"; // utilidad de clases

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  emptyLabel?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, emptyLabel = "Sin opciones", ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "peer w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-8",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-gray-500">
              {placeholder}
            </option>
          )}
          {options.length === 0 && (
            <option value="" disabled>
              {emptyLabel}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    );
  }
);
Select.displayName = "Select";
