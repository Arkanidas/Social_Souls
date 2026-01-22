import { useChat } from "../context/ChatContext";
import { ChatItem } from "./ChatItem";

export const ChatTab = () => {
  const { openChats, activeChatId } = useChat();
  

  if (openChats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 mt-4">
        No open chats...
      </div>
    );
  }

  return (
    <div className="flex flex-col ">
      {openChats.map(chat => (
        <ChatItem
          key={chat.chatId}
          chat={chat}
          isActive={chat.chatId === activeChatId}
        />
      ))}
    </div>
  );
};