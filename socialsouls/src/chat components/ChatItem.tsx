import Ghost from "../assets/ghosts.png";
import { useChat } from "../context/ChatContext";
import { X } from "lucide-react";

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
