"use client";
import { createContext, useState, ReactNode } from "react";

export const SelectedCarContext = createContext<any>(null);

export const SelectedCarProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  return (
    <SelectedCarContext.Provider value={{ selectedCar, setSelectedCar, finalPrice, setFinalPrice }}>
      {children}
    </SelectedCarContext.Provider>
  );
};
