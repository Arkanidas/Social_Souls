import { createContext, useContext, useState } from "react";

const SidebarContext = createContext<any>(null);

export function SidebarProvider({ children }: any) {
  const [activeTab, setActiveTab] = useState("friends"); 
 

  return (
    <SidebarContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
