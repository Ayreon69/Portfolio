"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SystemVisibility = {
  hidden: boolean;
  toggle: () => void;
};

const Ctx = createContext<SystemVisibility | null>(null);

export function SystemVisibilityProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <Ctx.Provider value={{ hidden, toggle: () => setHidden((h) => !h) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSystemVisibility() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useSystemVisibility doit être utilisé sous SystemVisibilityProvider"
    );
  }
  return ctx;
}
