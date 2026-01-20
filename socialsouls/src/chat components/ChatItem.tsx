import Ghost from "../assets/ghosts.png";
import { useChat } from "../context/ChatContext";

type Props = {
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

export const ChatItem = ({ chat, isActive }: Props) => {
  const { setActiveChatId } = useChat();

  return (
    <div
      onClick={() => setActiveChatId(chat.chatId)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition
        ${isActive ? "bg-purple-600/30" : "hover:bg-purple-500/10"}
      `}
    >
      <img
        src={chat.otherUser.profilePic || Ghost}
        className="w-8 h-8 rounded-full"
      />

      <span className="text-sm text-gray-200 truncate">
        {chat.otherUser.username}
      </span>
    </div>
  );
};
