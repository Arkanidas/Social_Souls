import Ghost from "../assets/ghosts.png";
import { useChat } from "../context/ChatContext";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";


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

  
useEffect(() => {
  const rtdb = getDatabase();
  const statusRef = ref(rtdb, `status/${chat.otherUser.uid}`);

  const unsub = onValue(statusRef, (snap) => {
    if (!snap.exists()) {
      setStatus("offline");
      return;
    }

    const data = snap.val();
    setStatus(data.state || "offline");
  });

  return () => unsub();
}, [chat.otherUser.uid]);


  return (
    <div
      onClick={() => setActiveChatId(chat.chatId)}
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
        onClick={(e) => {
          e.stopPropagation();
          closeChat(chat.chatId);
        }}
        className="p-1 rounded-md float-right text-gray-400 cursor-pointer hover:text-white transition absolute right-3"
        title="Close chat"
      >
        <X size={20} />
      </button>
    </div>
  );
};
