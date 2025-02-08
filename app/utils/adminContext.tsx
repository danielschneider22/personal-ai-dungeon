"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdminContextType {
  isAdmin: boolean;
  toggleAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleAdmin = () => setIsAdmin((prev) => !prev);

  return (
    <AdminContext.Provider value={{ isAdmin, toggleAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
