"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Currency } from "@/lib/pricing";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("€");

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency") as Currency;
    if (savedCurrency && (savedCurrency === "€" || savedCurrency === "$")) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency to localStorage when changed
  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "€" ? "$" : "€"));
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
