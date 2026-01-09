import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { XIcon, MoreVertical } from "lucide-react";
import  Ghost  from "../assets/ghosts.png";
import { useChat } from '../context/ChatContext';
import { useSidebar } from "../context/SidebarContext";

type FriendRequestItemProps = {
  userId: string;
  onAccept: (friendId: string) => void;
  onDecline: (friendId: string) => void;
  
};


export const FriendsTab = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const { setActiveChatUser } = useChat();
  const { setActiveTab } = useSidebar();
  
  const user = auth.currentUser;


  const handleOpenChat = async (friend:any) => {
   if (!user) return;

  const currentUserId = user.uid;
  const friendId = friend.uid;

  // 1️⃣ Deterministic chatId
  const chatId = [currentUserId, friendId].sort().join("_");

  const chatRef = doc(db, "Chats", chatId);
  const chatSnap = await getDoc(chatRef);

  // 2️⃣ Create chat if it doesn't exist
  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [currentUserId, friendId],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    });
  }

  console.log("Chat opened with ID:", chatId);


  setActiveChatUser({
    chatId,
    otherUser: {
      uid: friend.uid,
      username: friend.username,
      profilePic: friend.profilePic,
    },
  });


  setActiveTab("chats");
};
 


  if (!user) {
  console.error("No user is logged in, Please log in again!");
  return null; 
}

  useEffect(() => {
    if (!user) return;

   const userRef = doc(db, "users", user.uid);

  const unsubscribe = onSnapshot(userRef, (snap:any) => {
    if (snap.exists()) {
      const data = snap.data();
      setFriendRequests(data.friendRequests || []);
      setFriends(data.friends || []);
      setSentRequests(data.sentRequests || []);
    }
  });

  return () => unsubscribe();
  
  }, [user]);







  const handleCancelSentRequest = async (friendId: string) => {
  const userRef = doc(db, "users", user.uid);
  const friendRef = doc(db, "users", friendId);

  await updateDoc(userRef, {
    sentRequests: arrayRemove(friendId)
  });

  await updateDoc(friendRef, {
    friendRequests: arrayRemove(user.uid)
  });

  setSentRequests(prev => prev.filter(id => id !== friendId));
};

  

  const handleAccept = async (friendId: string) => {
    const userRef = doc(db, "users", user.uid);
    const friendRef = doc(db, "users", friendId);

   
    await updateDoc(userRef, {
      friends: arrayUnion(friendId),
      friendRequests: arrayRemove(friendId)
    });

    await updateDoc(friendRef, {
      friends: arrayUnion(user.uid),
      sentRequests: arrayRemove(user.uid)
    });

    setFriendRequests(prev => prev.filter((id) => id !== friendId));
  };

  const handleDecline = async (friendId: string) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      friendRequests: arrayRemove(friendId)
    });
    setFriendRequests(prev => prev.filter((id) => id !== friendId));
  };


const handleFriendMenuClick = (friend: any) => {
  console.log("Kebab clicked for:", friend.username);
};


  return (

<div className="flex flex-col">
  {sentRequests.length > 0 && (
    <div className="mb-2">
      <h3 className="text-purple-400 mt-2 ml-2">💌 Sent Soulmate Requests</h3>
      {sentRequests.map((id) => (
        <SentRequestItem key={id} userId={id} onCancel={handleCancelSentRequest}/>
      ))}
    </div>
  )}
    
      {friendRequests.length > 0 && (
        <div className="mb-4">
          <h3 className="text-purple-400 mb-2">👻 New Soulmate Requests</h3>
          {friendRequests.map((id) => (
            <FriendRequestItem
              key={id}
              userId={id}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
          
        </div>
      )}
  
      {friends.length === 0 ? (
        <p  className="text-gray-500 text-sm overflow-y-scroll">No friends yet 👻</p>
      ) : (friends.map((id) => (<FriendItem key={id} userId={id} onOpenChat={handleOpenChat} /> ))
      )}
    </div>
  );
};



const FriendItem = ({ userId, onOpenChat }: { userId: string; onOpenChat:(friend:any) => void }) => {
  const [friendData, setFriendData] = useState<any>(null);

  useEffect(() => {

    const ref = doc(db, "users", userId);

    

   
   const unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();
    setFriendData({
      uid: snap.id,
      username: data.username,
      profilePic: data.profilePic || Ghost,
      status: data.status?.state || "offline",
      lastSeen: data.status?.lastSeen,
    });
  });

   

      return () => unsub();
  }, [userId]);

  if (!friendData) return null;

  

  const handleFriendMenuClick = () => {
    console.log("Menu opened for:");
  };

  return (
    <div onClick={() => onOpenChat(friendData)} key={friendData.uid ?? friendData.id} className="flex items-center gap-3 p-3 hover:bg-purple-500/10 rounded-md cursor-pointer">
  
      <img
        src={friendData.profilePic || Ghost}
        className="w-10 h-10 rounded-full border border-purple-500"
      />
      <div>
        <p className="text-gray-200">{friendData.username}</p>
        <div className="flex items-center gap-2">
  <span
    className={`w-2 h-2 rounded-full ${
      friendData.status === "online" ? "bg-green-500" : friendData.status === "idle" ? "bg-yellow-500" : "bg-gray-500"
    }`}
  />
  <p className="text-xs text-gray-400">
    {friendData.status === "online" ? "Active now" : friendData.status === "idle" ? "Idle" : "Offline"}
  </p>

   <button
    onClick={(e) => {
      e.stopPropagation(); 
      handleFriendMenuClick();
    }}
    className="
      p-2
      cursor-pointer
      rounded-full
      text-gray-400
      hover:text-white
      hover:bg-gray-700
      transition
     
     
      
    "
    title="More options"
  >
    <MoreVertical className="" size={18} />
  </button>

</div>

      </div>
    </div>
  );
};



const FriendRequestItem = ({ userId, onAccept, onDecline }: FriendRequestItemProps) => {
  const [friendData, setFriendData] = useState<any>(null);

  useEffect(() => {
    const fetchFriend = async () => {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) setFriendData(snap.data());
    };
    fetchFriend();
  }, [userId]);

  if (!friendData) return null;

  return (
    <div className="relative group flex items-center justify-between gap-3 p-3 hover:bg-purple-500/10 rounded-md transition">
      <div className="flex items-center gap-3">
        <img
          src={friendData.profilePic || Ghost}
          className="w-10 h-10 rounded-full border border-purple-500"
        />
        <div>
          <p className="text-gray-200">{friendData.username}</p>
          <p className="text-sm mt-1 text-purple-300 italic">wants to be your soulmate 💌</p>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
        <button
          onClick={() => onAccept(userId)}
          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(userId)}
          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

const SentRequestItem = ({ userId, onCancel }: { userId: string; onCancel:(id: string) => void}) => {
  const [friendData, setFriendData] = useState<any>(null);

  useEffect(() => {
      const fetchFriend = async () => {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) setFriendData(snap.data());
    };
    fetchFriend();
  }, [userId]);

  if (!friendData) return null;

  return (
    <div className="group flex items-center justify-between gap-3 p-5 hover:bg-purple-500/10 rounded-md transition">
      <img
        src={friendData.profilePic || Ghost}
        className="w-10 h-10 rounded-full border border-purple-500"
      />
      <div>
        <p className="text-gray-200">{friendData.username}</p>
        <p className="text-xs mt-1 text-purple-300 italic">awaiting their response</p>
      </div>

     
    <button onClick={() => onCancel(userId)} className="opacity-0 group-hover:opacity-100 bg-gray-500 text-white px-3 py-1 rounded-md text-sm transition-opacity duration-200 cursor-pointer">
      <XIcon className="h-3 w-3" />
    </button>
    </div>
  );
};
