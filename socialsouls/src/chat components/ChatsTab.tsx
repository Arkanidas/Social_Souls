import { useChat } from "../context/ChatContext";
import Ghost from "../assets/ghosts.png";

export const ChatTab = () => {
  const { activeChatUser } = useChat();

  if (!activeChatUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        👻 Select a friend to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-purple-600/20 hover:bg-purple-500/10 transition cursor-pointer">
        <img
          src={activeChatUser.profilePic || Ghost}
          className="w-10 h-10 rounded-full border border-purple-500"
        />
        <h2 className="text-gray-200 text-lg font-semibold">
          {activeChatUser.username}
        </h2>
      </div>

    
     
     
    </div>
  );
};
