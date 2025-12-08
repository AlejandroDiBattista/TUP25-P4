import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 ${className ?? ""}`}
      {...props}
    />
  ),
);
Input.displayName = "Input";

