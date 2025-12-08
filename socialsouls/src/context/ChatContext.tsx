import { createContext, useContext, useState } from "react";

const ChatContext = createContext<any>(null);

export function ChatProvider({ children }: any) {
  const [activeChatUser, setActiveChatUser] = useState(null); 

  return (
    <ChatContext.Provider value={{ activeChatUser, setActiveChatUser }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}