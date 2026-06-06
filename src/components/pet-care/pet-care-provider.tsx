"use client";

import { createContext, useContext } from "react";
import type { PetCareContext } from "@/lib/pet-queries";

const PetCareContextReact = createContext<PetCareContext | null>(null);

export function PetCareProvider({
  value,
  children,
}: {
  value: PetCareContext;
  children: React.ReactNode;
}) {
  return (
    <PetCareContextReact.Provider value={value}>
      {children}
    </PetCareContextReact.Provider>
  );
}

export function usePetCare(): PetCareContext {
  const ctx = useContext(PetCareContextReact);
  if (!ctx) {
    throw new Error("usePetCare must be used within PetCareProvider");
  }
  return ctx;
}
