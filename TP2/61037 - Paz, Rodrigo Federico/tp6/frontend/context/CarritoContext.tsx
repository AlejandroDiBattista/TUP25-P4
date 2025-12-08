"use client";
import { createContext, useContext, useState } from "react";

interface CarritoContextType {
  actualizarCarrito: () => void;
}

const CarritoContext = createContext<CarritoContextType>({
  actualizarCarrito: () => {},
});

export function useCarrito() {
  return useContext(CarritoContext);
}

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [updateFlag, setUpdateFlag] = useState(false);

  function actualizarCarrito() {
    setUpdateFlag((prev) => !prev);
  }

  return (
    <CarritoContext.Provider value={{ actualizarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
}