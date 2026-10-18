import { createContext, useContext, useState, type ReactNode } from "react";

import { clampServings } from "~/lib/format/quantity";

interface ServingsState {
  /** The recipe's own servings, which the quantities are written for. */
  base: number;
  servings: number;
  setServings: (servings: number) => void;
  /** Multiply amounts by this. */
  factor: number;
}

const ServingsContext = createContext<ServingsState | null>(null);

/** Shares the chosen servings between the quick facts and the recipe card. */
export function ServingsProvider({
  base,
  children,
}: {
  base: number;
  children: ReactNode;
}) {
  const [servings, setRaw] = useState(base);
  const value: ServingsState = {
    base,
    servings,
    setServings: (next) => setRaw(clampServings(next)),
    factor: servings / base,
  };
  return (
    <ServingsContext.Provider value={value}>
      {children}
    </ServingsContext.Provider>
  );
}

export function useServings(): ServingsState {
  const value = useContext(ServingsContext);
  if (!value)
    throw new Error("useServings must be used inside ServingsProvider");
  return value;
}
