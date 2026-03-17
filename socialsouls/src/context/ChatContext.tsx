import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";




const ChatContext = createContext<{
  openChats: OpenChat[];
  activeChatId: string | null;
  openChat: (chat: OpenChat) => Promise<void>;
  closeChat: (chatId: string) => Promise<void>;
  setActiveChatId: (chatId: string) => void;
  userChats: any[];
}>({
  openChats: [],
  activeChatId: null,
  openChat: async () => {},
  closeChat: async () => {},
  setActiveChatId: () => {},
  userChats: [],
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
const [userChats, setUserChats] = useState<any[]>([]);

useEffect(() => {
  if (!user) return;

  const q = query(
    collection(db, "Chats"),
    where("participants", "array-contains", user.uid),
    orderBy("lastMessageAt", "desc")
  );

  const unsubChats = onSnapshot(q, (snapshot) => {

    const chats = snapshot.docs.map(doc => ({
      chatId: doc.id,
      ...doc.data(),
    }));

    setUserChats(chats);

    chats.forEach((chat: any) => {

      const unread = chat.unreadCount?.[user.uid] || 0;

      if (unread > 0) {

        setOpenChats(prev => {

          const exists = prev.some(c => c.chatId === chat.chatId);
          if (exists) return prev;

          const otherUid = chat.participants.find(
            (p: string) => p !== user.uid
          );

          const otherUserData = chat.userData?.[otherUid];
          
          const newChat = {
            chatId: chat.chatId,
            otherUser: {
             uid: otherUid,
             username: otherUserData?.username || "Unknown",
             profilePic: otherUserData?.profilePic || ""
  }
};

          return [...prev, newChat];
        });
      }
    });
  });

  return () => unsubChats();

}, [user]);


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




const openChat = async (chat: OpenChat) => {
  if (!user) return;

  const exists = openChats.some(c => c.chatId === chat.chatId);
  const updatedChats = exists ? openChats : [...openChats, chat];

  await updateDoc(doc(db, "users", user.uid), {
    openChats: updatedChats,
    activeChatId: chat.chatId,
  });

  // reset unread count
  await updateDoc(doc(db, "Chats", chat.chatId), {
    [`unreadCount.${user.uid}`]: 0
  });
};


const closeChat = async (chatId: string): Promise<void> => {
  if (!user) return;

  const updated = openChats.filter(c => c.chatId !== chatId);
  const nextActive = activeChatId === chatId ? updated[0]?.chatId || null : activeChatId;

  await updateDoc(doc(db, "users", user.uid), {
    openChats: updated,
    activeChatId: nextActive,
  });
};


  return (
    <ChatContext.Provider value={{openChats, activeChatId, openChat, closeChat, setActiveChatId, userChats}}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}