import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../utils/appHelpers";
import { CompanyTenant } from "../utils/companyCatalog";

export type AppMode = 
  | "login"
  | "floorplan"
  | "menu"
  | "review"
  | "table-details"
  | "checkout"
  | "admin"
  | "manage-menu"
  | "suppliers"
  | "customers"
  | "reports"
  | "reporte-movimientos"
  | "corte-nuevo"
  | "corte-express"
  | "corte-tabla"
  | "corte-tabla-2"
  | "corte-x"
  | "expenses"
  | "gestion_cuentas";

interface AppStateContextType {
  appMode: AppMode;
  setAppMode: React.Dispatch<React.SetStateAction<AppMode>>;
  
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  
  selectedTenant: CompanyTenant | null;
  setSelectedTenant: React.Dispatch<React.SetStateAction<CompanyTenant | null>>;

  isOnline: boolean;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appMode, setAppMode] = useState<AppMode>("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<CompanyTenant | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  return (
    <AppStateContext.Provider
      value={{
        appMode,
        setAppMode,
        currentUser,
        setCurrentUser,
        selectedTenant,
        setSelectedTenant,
        isOnline,
        setIsOnline,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within a AppStateProvider");
  }
  return context;
};
