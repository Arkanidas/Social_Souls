import { createContext, useContext, useState, useEffect } from "react";




const ChatContext = createContext<{
  openChats: OpenChat[];
  activeChatId: string | null;
  openChat: (chat: OpenChat) => void;
  closeChat: (chatId: string) => void;
  setActiveChatId: (chatId: string) => void;
}>({
  openChats: [],
  activeChatId: null,
  openChat: () => {},
  closeChat: () => {},
  setActiveChatId: () => {},
});


type OpenChat = {
  chatId: string;
  otherUser: {
    uid: string;
    username: string;
    profilePic: string;
  };
};


export function ChatProvider({ children }: any) {

const [openChats, setOpenChats] = useState<OpenChat[]>([]);
const [activeChatId, setActiveChatId] = useState<string | null>(null);



  useEffect(() => {
  const saved = localStorage.getItem("chatState");
  if (saved) {
    const parsed = JSON.parse(saved);
    setOpenChats(parsed.openChats || []);
    setActiveChatId(parsed.activeChatId || null);
  }
}, []);

useEffect(() => {
  localStorage.setItem(
    "chatState",
    JSON.stringify({ openChats, activeChatId })
  );
}, [openChats, activeChatId]);

const openChat = (chat: OpenChat) => {
  setOpenChats(prev => {
    const exists = prev.some(c => c.chatId === chat.chatId);
      if (exists) return prev;    
    return [...prev, chat]; 
  });

  setActiveChatId(chat.chatId);
};

const closeChat = (chatId: string) => {
  setOpenChats(prev => prev.filter(c => c.chatId !== chatId));

  setActiveChatId(prev =>
    prev === chatId ? null : prev
  );
};


  return (
    <ChatContext.Provider value={{openChats, activeChatId, openChat, closeChat, setActiveChatId}}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}