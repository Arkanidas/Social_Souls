import Ghost from "../assets/ghosts.png";
import { useChat } from "../context/ChatContext";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";


type UserProps = {
  chat: {
    chatId: string;
    otherUser: {
      uid: string;
      username: string;
      profilePic: string;
    };
  };
  isActive: boolean;
};

export const ChatItem = ({ chat, isActive }: UserProps) => {


  const { setActiveChatId, closeChat } = useChat();
  const [status, setStatus] = useState<"online" | "idle" | "offline">("offline");
  const [unread, setUnread] = useState(0); 
  
useEffect(() => {
  const userRef = doc(db, "users", chat.otherUser.uid);

  const unsub = onSnapshot(userRef, (snap) => {
    const data = snap.data();
    if (data?.status?.state) {
      setStatus(data.status.state);
    }
  });

  return () => unsub();
}, [chat.otherUser.uid]);

const handleChatClick = async () => {
  setActiveChatId(chat.chatId);

  const currentUser = auth.currentUser;
  if (!currentUser || unread === 0) return;


  await updateDoc(doc(db, "Chats", chat.chatId), {
    [`unreadCount.${currentUser.uid}`]: 0,
  });
};

useEffect(() => {
  const ref = doc(db, "Chats", chat.chatId);

  const unsub = onSnapshot(ref, (snap) => {
    const data = snap.data();
    if (!data) return;

    const currentUser = auth.currentUser?.uid;
    if (!currentUser) return;

    setUnread(data.unreadCount?.[currentUser] || 0);
  });

  return () => unsub();
}, [chat.chatId]);

  return (
    
    <div
      onClick={handleChatClick} 
      className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition  
        ${isActive ? "bg-purple-600/30" : "hover:bg-purple-500/10"}
      `}
    >
      <img
        src={chat.otherUser.profilePic || Ghost}
        className="w-10 h-10 rounded-full border border-purple-500 object-cover"
      />

      <span className="text-xl font-[ChatFont] text-gray-200 truncate">
        {chat.otherUser.username}
      </span>

      <span
    className={`w-2 h-2 rounded-full shrink-0 relative right-1
      ${status === "online"
        ? "bg-green-500"
        : status === "idle"
        ? "bg-yellow-500"
        : "bg-gray-500"}
    `}
  />

       <button
        onClick={(e) => {e.stopPropagation(); closeChat(chat.chatId);}}
        className="p-1 rounded-md float-right text-gray-400 cursor-pointer hover:text-white transition absolute right-3"
        title="Close chat"
      >
        <X size={20} />
      </button>

      {!isActive && unread > 0 && (
  <div className="ml-auto bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full relative right-20">
    {unread}
  </div>
)}
    </div>
  );
};
