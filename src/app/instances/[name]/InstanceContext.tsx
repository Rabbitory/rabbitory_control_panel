"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Instance } from "@/types/instance";

interface InstanceContextType {
  instance: Instance | null;
  setInstance: (instance: Instance) => void;
}

const InstanceContext = createContext<InstanceContextType | undefined>(
  undefined,
);

export function useInstanceContext() {
  const context = useContext(InstanceContext);
  if (context === undefined) {
    throw new Error(
      "useInstanceContext must be used within an InstanceProvider",
    );
  }
  return context;
}

interface InstanceProviderProps {
  children: ReactNode;
}

export function InstanceProvider({ children }: InstanceProviderProps) {
  const [instance, setInstance] = useState<Instance | null>(null);

  return (
    <InstanceContext.Provider value={{ instance, setInstance }}>
      {children}
    </InstanceContext.Provider>
  );
}
