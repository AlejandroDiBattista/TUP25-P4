"use client";

import { useEffect } from "react";

export default function DebugClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      console.log("Global click -> tag:", t?.tagName, "class:", t?.className, "innerText:", (t?.innerText || "").slice(0, 30));
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);
  return null;
}