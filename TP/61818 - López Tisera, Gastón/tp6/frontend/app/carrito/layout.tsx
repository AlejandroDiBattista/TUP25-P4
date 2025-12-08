import type { ReactNode } from "react";

export default function CarritoLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white px-6 py-8">
      {children}
    </div>
  );
}

