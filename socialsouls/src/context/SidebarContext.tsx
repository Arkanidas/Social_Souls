import { createContext, useContext, useState } from "react";

  type SidebarContextType = {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  friendRequests: string[];
  setFriendsRequests: React.Dispatch<React.SetStateAction<string[]>>;
};

const SidebarContext = createContext<SidebarContextType | null>(null);



export function SidebarProvider({ children }: any) {

  
  
  const [activeTab, setActiveTab] = useState("friends"); 
  const [friendRequests, setFriendsRequests] = useState<string[]>([]);


 

  return (
    <SidebarContext.Provider value={{ activeTab, setActiveTab, friendRequests, setFriendsRequests }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
}
