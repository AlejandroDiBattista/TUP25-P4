"use client";

import "./globals.css";
import DebugClicks from "./components/DebugClicks";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <DebugClicks />
        {children}
      </body>
    </html>
  );
}