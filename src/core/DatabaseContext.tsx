import React, { createContext, useContext, useState, ReactNode } from "react";

interface DatabaseContextType {
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  tables: any[];
  setTables: React.Dispatch<React.SetStateAction<any[]>>;
  history: any[];
  setHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  return (
    <DatabaseContext.Provider
      value={{
        products,
        setProducts,
        tables,
        setTables,
        history,
        setHistory,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
