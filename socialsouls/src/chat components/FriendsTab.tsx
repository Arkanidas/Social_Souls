import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useEffect, useState, useRef } from "react";
import { XIcon, MoreVertical, User, VolumeX, Skull, Check, Volume2, Ban,  } from "lucide-react";
import  Ghost  from "../assets/ghosts.png";
import { useChat } from '../context/ChatContext';
import { useSidebar } from "../context/SidebarContext";
import { showUserProfileModal } from "../chat components/ProfileModal";



type FriendRequestItemProps = {
  userId: string;
  onAccept: (friendId: string) => void;
  onDecline: (friendId: string) => void;
  
};


export const FriendsTab = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const { openChat, closeChat } = useChat();
  const { setActiveTab } = useSidebar();
  const [openMenuUid, setOpenMenuUid] = useState<string | null>(null);
  const user = auth.currentUser;
  



  


   // Open Chat on Friend Click
  const handleOpenChat = async (friend:any) => {
   if (!user) return;

  const currentUserId = user.uid;
  const friendId = friend.uid;

  const chatId = [currentUserId, friendId].sort().join("_");

  const chatRef = doc(db, "Chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [currentUserId, friendId],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    });
  }

  await openChat({
    chatId,
    otherUser: {
      uid: friend.uid,
      username: friend.username,
      profilePic: friend.profilePic,
    },
  });


  setActiveTab("chats");
};


 // Delete Friend
const handlePerishSoul = async (friendId: string) => {
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const friendRef = doc(db, "users", friendId);

  const chatId = [user.uid, friendId].sort().join("_");
  try {
   
    await Promise.all([
      updateDoc(userRef, {
        friends: arrayRemove(friendId),
      }),
      updateDoc(friendRef, {
        friends: arrayRemove(user.uid),
      }),
    ]);

    await closeChat(chatId);
    setOpenMenuUid(null);

  } catch (err) {
    console.error("Failed to perish soul:", err);
  }
};


 //function to mute/unmute a friend
const toggleMuteSoul = async (friendId: string) => {
  if (!auth.currentUser) return;

  const ref = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(ref);

  const muted = snap.data()?.mutedSouls || [];

  await updateDoc(ref, {
    mutedSouls: muted.includes(friendId)
      ? arrayRemove(friendId)
      : arrayUnion(friendId),
  });
};


 //function to block/unblock a friend
const toggleBlockSoul = async (friendId: string) => {
  if (!auth.currentUser) return;

  const ref = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(ref);

  const blocked = snap.data()?.blockedSouls || [];

  await updateDoc(ref, {
    blockedSouls: blocked.includes(friendId)
      ? arrayRemove(friendId)
      : arrayUnion(friendId),
  });
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



   // Cancel Sent Friend Request
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

  
     // Accept Friend Request
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


   // Decline Friend Request
  const handleDecline = async (friendId: string) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      friendRequests: arrayRemove(friendId)
    });
    setFriendRequests(prev => prev.filter((id) => id !== friendId));
  };


  return (
    <div className="flex flex-col">
     {sentRequests.length > 0 && (
    <div>
      <div className="p-2 mt-2 mb-2">
        <h3 className="text-white relative left-12 text-lg"> Sent Soulmate Requests 
         <span className="text-md text-purple-400"> ( {sentRequests.length} )</span>
        </h3>
      </div>
     {sentRequests.map((id) => (
      <SentRequestItem key={id} userId={id} onCancel={handleCancelSentRequest}/>))}
    </div>)}
    
     {friendRequests.length > 0 && (
      <div>
        <div className=" p-2 mt-2 mb-2">
          <h3 className="text-white relative left-12 text-lg"> New Soulmate Requests
             <span className="text-md text-purple-400"> ( {friendRequests.length} )</span>
          </h3>
        </div>
          {friendRequests.map((id) => (
            <FriendRequestItem
              key={id}
              userId={id}
              onAccept={handleAccept}
              onDecline={handleDecline}/>))}   
      </div>)}
  
      {friends.length === 0 ? (
        <p className="text-gray-500 text-sm overflow-y-scroll relative left-[30%] top-4">No friends yet...</p>
      ) : (friends.map((id) => (<FriendItem key={id} userId={id} onOpenChat={handleOpenChat} openMenuUid={openMenuUid}
           setOpenMenuUid={setOpenMenuUid} onPerishSoul={handlePerishSoul} toggleMuteSoul={toggleMuteSoul} toggleBlockSoul={toggleBlockSoul}/> )))}
    </div>
  );
};



const FriendItem = ({ userId, onOpenChat, openMenuUid, setOpenMenuUid, onPerishSoul, toggleMuteSoul, toggleBlockSoul }: { userId: string; onOpenChat:(friend:any) => void; openMenuUid: string | null;

  setOpenMenuUid: React.Dispatch<React.SetStateAction<string | null>>;
  onPerishSoul: (friendId: string) => void;
  toggleMuteSoul: (friendId: string) => void;
  toggleBlockSoul: (friendId: string) => void;}) => {

  const [friendData, setFriendData] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpenMenuUid(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

// creates a real-time listener array to check if the friend is muted
useEffect(() => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const ref = doc(db, "users", currentUser.uid);

  const unsub = onSnapshot(ref, (snap) => {
    const muted = snap.data()?.mutedSouls || [];
    setIsMuted(muted.includes(userId));
  });

  
  return () => unsub();
}, [userId]);

useEffect(() => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const ref = doc(db, "users", currentUser.uid);

  const unsub = onSnapshot(ref, (snap) => {
    const blocked = snap.data()?.blockedSouls || [];
    setIsBlocked(blocked.includes(userId));
  });

  return () => unsub();
}, [userId]);


  useEffect(() => {

    const ref = doc(db, "users", userId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;


    const data = snap.data();

const lastSeen = data.status?.lastSeen?.toDate?.()?.getTime() || 0;
const now = Date.now();
const AFK = now - lastSeen > 30000;

  setFriendData((prev:any) => ({
      ...prev,
      uid: snap.id,
      username: data.username,
      profilePic: data.profilePic || Ghost,
      status: AFK ? "offline" : data.status?.state || "offline",
    }));
  });

      return () => unsub();
  }, [userId]);

  if (!friendData) return null;

  
  const handleFriendMenuClick = (uid: string) => {
    setOpenMenuUid(prev => (prev === uid ? null : uid));
  };



  return (
    <div onClick={() => onOpenChat(friendData)} key={friendData.uid ?? friendData.id} className="relative flex items-center gap-3 p-3 hover:bg-purple-500/10 duration-200 cursor-pointer mt-0 border-b border-l-0 border-r-0 border-gray-800/50 border-1">
  
      <img
        src={friendData.profilePic || Ghost}
        className="w-10 h-10 rounded-full border border-purple-500 object-cover"
      />

      <div>
        <p className="text-gray-200 font-[ChatFont] text-xl">{friendData.username}</p>

      <div className="flex items-center gap-2">
       <span className={`w-2 h-2 rounded-full ${friendData.status === "online" ? "bg-green-500" : friendData.status === "idle" ? "bg-yellow-500" : "bg-gray-500"}`}/>
       <p className="text-xs text-gray-400 ">
        {friendData.status === "online" ? "Active now" : friendData.status === "idle" ? "Idle" : "Offline"}
       </p>

       </div>
      </div>

  <button onClick={(e) => {e.stopPropagation(); handleFriendMenuClick(friendData.uid);}}
    className="ml-auto p-2 cursor-pointer rounded-full text-gray-400 hover:text-white transition duration-200"
    title="More options">
    <MoreVertical size={21}/>
  </button>

{openMenuUid === friendData.uid && (
    <div
      ref={menuRef}
      className="absolute right-12 top-1/2 -translate-y-1/2 w-48 rounded-md bg-[#171717] border border-white/10 shadow-xl z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <MenuItem
      icon={<User size={16} />}
      text="View Soul Profile"
      onClick={() => {
       showUserProfileModal(friendData.uid);
       setOpenMenuUid(null);
  }}
    />

    <MenuItem
      icon={ isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      text={isMuted ? "Unmute Soul" : "Mute Soul"}
      onClick={() => {
        setOpenMenuUid(null);
        toggleMuteSoul(friendData.uid);
      }}
    />

    <MenuItem
      icon={ <Ban size={16}/>}
      text={isBlocked ? "Unblock Soul" : "Block Soul"}
      danger
      onClick={() => {
        setOpenMenuUid(null);
        toggleBlockSoul(friendData.uid);
      }}
    />

    <MenuItem
      icon={<Skull size={16} />}
      text="Perish Soul"
      danger
      onClick={() => {
        onPerishSoul(friendData.uid);
        setOpenMenuUid(null);
      }}/>
    </div>
  )}

{isMuted && (
  <div className="absolute top-7 left-1/2 translate-x-2  text-red-500 px-1 rounded ProfileModal duration-300 ghost-fade-in">
  <VolumeX size={20}/>
  </div>
)}

  </div>
  );
};



const MenuItem = ({
  text,
  icon,
  danger = false,
  onClick,
}: {
  text: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;

}) => {
  return (
    <button
    onClick={onClick}
      className={`group w-full flex items-center justify-start gap-3 p-3 text-sm transition cursor-pointer duration-200 border-b border-gray-800/40
        ${
          danger
            ? "text-red-400 hover:bg-red-500/10"
            : "text-gray-200 hover:bg-white/10"}`}>
      <span className="flex order-2  group-hover:translate-x-1.5 transition-all duration-200">{text}</span>
      <span className="opacity-80 order-1 transition-all duration-200 group-hover:opacity-100 group-hover:scale-115">{icon}</span>
    </button>
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
    <div className="relative group flex items-center justify-between gap-3 p-3 hover:bg-purple-500/10 transition border-gray-800 border-dashed border-b-2">
      <div className="flex items-center gap-3">
        <img
          src={friendData.profilePic || Ghost}
          className="w-10 h-10 rounded-full border border-purple-500 object-cover"
        />
        <div>
          <p className="text-gray-200 font-[Chatfont] text-xl">{friendData.username}</p>
          <p className="text-xs text-purple-300 italic">wants to be your soulmate</p>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 duration-500 flex gap-2 transition-opacity">
        <button onClick={() => onAccept(userId)}>
          <Check className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer" />
        </button>
        <button onClick={() => onDecline(userId)}>
           <XIcon className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer duration-500" />
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
    <div className=" relative group flex items-center justify-between gap-3 p-3 hover:bg-purple-500/10 transition border-gray-800 border-dashed border-b-2">
      <img
        src={friendData.profilePic || Ghost}
        className="w-10 h-10 rounded-full border border-purple-500 object-cover"
      />
      <div className="flex items-start flex-col relative right-6">
        <p className="text-gray-200 font-[ChatFont] text-xl">{friendData.username}</p>
        <p className="text-xs mt-1 text-purple-300 italic ">awaiting their response</p>
      </div>

     
    <button onClick={() => onCancel(userId)} className="opacity-0 group-hover:opacity-100 hover:text-white text-gray-400 px-3 py-1 text-sm cursor-pointer duration-200">
      <XIcon className="h-5 w-5" />
    </button>
    </div>
  );
};
