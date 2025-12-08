"use client";

import { CarritoProvider } from "./components/CarritoContext";

export default function CarritoProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CarritoProvider>{children}</CarritoProvider>;
}
