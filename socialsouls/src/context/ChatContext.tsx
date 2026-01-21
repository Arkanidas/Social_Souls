import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";




const ChatContext = createContext<{
  openChats: OpenChat[];
  activeChatId: string | null;
  openChat: (chat: OpenChat) => Promise<void>;
  closeChat: (chatId: string) => Promise<void>;
  setActiveChatId: (chatId: string) => void;
}>({
  openChats: [],
  activeChatId: null,
  openChat: async () => {},
  closeChat: async () => {},
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


const [user, setUser] = useState(() => auth.currentUser);

useEffect(() => {
  const unsub = auth.onAuthStateChanged(u => {
    setUser(u);
    if (!u) {
      setOpenChats([]);
      setActiveChatId(null);
    }
  });
  return unsub;
}, []);


useEffect(() => {
  if (!user) return;

  const ref = doc(db, "users", user.uid);

  const unsub = onSnapshot(ref, snap => {
    if (!snap.exists()) return;

    const data = snap.data();
    setOpenChats(data.openChats || []);
    setActiveChatId(data.activeChatId || null);
  });

  return unsub;
}, [user]);



const openChat = async (chat: OpenChat): Promise<void> => {
  if (!user) return;

  const exists = openChats.some(c => c.chatId === chat.chatId);
  const updatedChats = exists ? openChats : [...openChats, chat];

  await updateDoc(doc(db, "users", user.uid), {
    openChats: updatedChats,
    activeChatId: chat.chatId,
  });
};



const closeChat = async (chatId: string): Promise<void> => {
  if (!user) return;

  const updated = openChats.filter(c => c.chatId !== chatId);
  const nextActive =
    activeChatId === chatId ? updated[0]?.chatId || null : activeChatId;

  await updateDoc(doc(db, "users", user.uid), {
    openChats: updated,
    activeChatId: nextActive,
  });
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