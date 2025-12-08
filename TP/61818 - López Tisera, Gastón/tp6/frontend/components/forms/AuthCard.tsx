import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-10 shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

