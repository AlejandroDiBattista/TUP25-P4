import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

