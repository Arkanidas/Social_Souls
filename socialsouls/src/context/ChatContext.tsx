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
    profilePic: string | any;
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

const newOpenChats: OpenChat[] = [];

chats.forEach((chat: any) => {
  const unread = chat.unreadCount?.[user.uid] || 0;

  if (unread > 0) {
    const otherUid = chat.participants.find(
      (p: string) => p !== user.uid
    );

    const otherUserData = chat.userData?.[otherUid];


    newOpenChats.push({
      chatId: chat.chatId,
      otherUser: {
        uid: otherUid,
        username: otherUserData?.username || "Unknown ghost",
        profilePic: otherUserData?.profilePic || ""
      }
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

    setOpenChats(prev => {
  const fromDb = data.openChats || [];

  const merged = [...prev];

  fromDb.forEach((chat: OpenChat) => {
    if (!merged.some(c => c.chatId === chat.chatId)) {
      merged.push(chat);
    }
  });

  return merged;
});
    setActiveChatId(data.activeChatId || null);
  });

  return unsub;
}, [user]);


// function for adding a chat to ChatsTab between users 
const openChat = async (chat: OpenChat) => {
  if (!user) return;

  const exists = openChats.some(c => c.chatId === chat.chatId);
  const updatedChats = exists ? openChats : [...openChats, chat];

  setOpenChats(updatedChats);
  setActiveChatId(chat.chatId);

  await updateDoc(doc(db, "users", user.uid), {
    openChats: updatedChats,
    activeChatId: chat.chatId,
  });

  // reset unread count
  await updateDoc(doc(db, "Chats", chat.chatId), {
    [`unreadCount.${user.uid}`]: 0
  });
};

  // function for closing/removing a chat in chatsTab
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