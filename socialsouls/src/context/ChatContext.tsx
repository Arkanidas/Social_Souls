import { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext<{
  activeChatUser: ActiveChat;
  setActiveChatUser: (chat: ActiveChat) => void;
}>({
  activeChatUser: null,
  setActiveChatUser: () => {},
});



type ActiveChat = {
  chatId: string;
  otherUser: {
    uid: string;
    username: string;
    profilePic: string;
  };
} | null;

export function ChatProvider({ children }: any) {
  const [activeChatUser, setActiveChatUserState] = useState<ActiveChat>(null);

  useEffect(() => {
    const savedChat = localStorage.getItem("activeChat");
    if (savedChat) {
     setActiveChatUserState(JSON.parse(savedChat));
    }
  }, []);

   const setActiveChatUser = (chat: ActiveChat) => {
    setActiveChatUserState(chat);

    if (chat) {
      localStorage.setItem("activeChat", JSON.stringify(chat));
    } else {
      localStorage.removeItem("activeChat");
    }
  };


  return (
    <ChatContext.Provider value={{ activeChatUser, setActiveChatUser }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}