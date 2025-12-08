'use client';

import React from 'react';
import { ToastProvider } from "@/app/hooks/useToast";
import { ToastContainer } from "@/app/components/ToastContainer";
import Navbar from "@/app/components/Navbar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps): React.ReactElement {
  return (
    <ToastProvider>
      <Navbar />
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
