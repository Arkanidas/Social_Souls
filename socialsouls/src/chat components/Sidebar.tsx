import { useState, useEffect} from 'react';
import { Users2Icon, MessageSquareIcon, SettingsIcon, SearchIcon, SunIcon, LogOutIcon, UserPlusIcon } from 'lucide-react';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth, db} from '../firebase/firebaseConfig'; 
import { SettingsPopup } from '../chat components/SettingsModal';
import { showAddFriendModal } from './ChatArea'
import { FriendsTab } from './FriendsTab';
import { ChatTab } from '../chat components/ChatsTab'
import ghost from "../assets/ghosts.png"
import { useSidebar } from "../context/SidebarContext";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { Ghost as GhostIcon } from "lucide-react";



type ProfileType = {
  username: string;
  profilepic: string;
  bio: string;
};

type SidebarProps = {
  profile?: ProfileType; 
  onProfileUpdated?: () => void
};



export const Sidebar = ({profile, onProfileUpdated}:SidebarProps) => {

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { activeTab, setActiveTab } = useSidebar(); 
  const [myStatus, setMyStatus] = useState<"online" | "offline">("offline");
  const [searchValue, setSearchValue] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<any[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);


  const navigate = useNavigate();

const handleLogout = async () => {
  await signOut(auth);
  navigate("/");
  localStorage.removeItem("activeChat");
};


   

 
useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  const unsub = onSnapshot(userRef, async (snap) => {
    const data = snap.data();
    if (!data) return;

    // Status
    if (data.status?.state) {
      setMyStatus(data.status.state);
    }

    // Friends
    if (!data.friends || data.friends.length === 0) {
      setFriends([]);
      return;
    }

    try {
      const profiles = await Promise.all(
        data.friends.map(async (friendId: string) => {
          const friendSnap = await getDoc(doc(db, "users", friendId));
          if (!friendSnap.exists()) return null;

          const data = friendSnap.data();

          return {
           uid: friendSnap.id,
           username: data.username || data.displayName || data.name || "",
           profilepic: data.profilepic || ghost,
          };
        })
      );

      setFriends(profiles.filter(Boolean));
     

    } catch (err) {
      console.error("Failed to load friends", err);
    }
  });

  return () => unsub();
}, []);

const TempModal = () => {
  if (searchValue.trim() === "") return null;
  else {
    setShowSearchModal(true);
  }
};


useEffect(() => {
  if (!searchValue.trim()) {
    setShowSearchModal(false);
    return;
  }

  const filtered = friends.filter((friend) =>
    friend.username
      .toLowerCase()
      .startsWith(searchValue.toLowerCase())
  );

   

  setFilteredFriends(filtered);
  setShowSearchModal(true);
}, [searchValue, friends]);

  
const openChatWithFriend = (friend: any) => {

  localStorage.setItem(
    "activeChat",
    JSON.stringify({
      uid: friend.uid,
      username: friend.username,
      profilepic: friend.profilepic || ghost,
    })
  );


  setActiveTab("chats");
  setShowSearchModal(false);
  setSearchValue("");
};


  
  return <div className="w-80 border-r backdrop-blur-sm border-purple-900/30 bg-gray-900/95 flex flex-col relative z-10">
    
      {/* User Profile Header */}
      <div className="p-4 border-b border-purple-900/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500">
            <img src={profile? profile.profilepic : ghost} alt="Profile" className="w-full h-full object-cover" />
          </div>

          <div>
            <h3 className="text-white">
              {profile? profile.username : 'unknown ghost'}
            </h3>

            <p className="text-sm text-purple-500"> {myStatus === "online" ? "Haunting Online" : "Haunting Offline"}
            <GhostIcon size={14} className={
             myStatus === "online"
             ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] relative top-1 float-right left-1"
             : "text-red-400 drop-shadow-[0_0_1px_rgba(239,68,68,0.8)]"}/>
            </p>
     
          </div>

           <button
          className="p-2 rounded-full text-purple-400 hover:scale-110 transition-transform duration-300 relative left-20 cursor-pointer"
          onClick={showAddFriendModal}
          title="Summon a new spirit">
          <UserPlusIcon className="h-6 w-6 hover:animate-pulse" />
        </button>
        </div>
      </div>
    
      <div className="p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <input type="text" placeholder="Search the void..." onChange={(e) => setSearchValue(e.target.value)} value={searchValue} onClick={TempModal}
          className="w-full bg-gray-800 text-gray-300 border-gray-700 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border animation-ease-in duration-200"/>
        </div>
      </div>

      {showSearchModal && (
  <div className="fixed inset-0 z-40">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowSearchModal(false)}
    />

    {/* Modal */}
    <div className="absolute top-36 left-4 right-4 z-50 bg-gray-900/95 border border-purple-900/30 rounded-md shadow-xl p-2 max-h-80 overflow-y-auto hover:bg-gray-800 transition cursor-pointer">
      {filteredFriends.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No spirits found...
        </p>
      ) : (
        filteredFriends.map((friend) => (
          <div
            key={friend.uid}
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
            onClick={() => openChatWithFriend(friend)}
          >
            <img
              src={friend.profilepic || ghost}
              className="w-9 h-9 rounded-full object-cover border-gray border"
            />
            <span className="text-white">{friend.username}</span>
          </div>
        ))
      )}
    </div>
  </div>
)}

    
      <div className="flex border-b border-purple-900/30"
          >
        <button onClick={() => setActiveTab('chats')} className={`flex-1 p-4 text-sm font-medium cursor-pointer ${activeTab === 'chats' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-purple-500'}`}>
          <MessageSquareIcon className="h-5 w-5 mx-auto mb-1" />
          Chats
        </button>
        <button onClick={() => setActiveTab('friends')} className={`flex-1 p-4 text-sm font-medium cursor-pointer ${activeTab === 'friends' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-purple-500 '}`}>
          <Users2Icon className="h-5 w-5 mx-auto mb-1" />
          Friends
        </button>
      </div>
    
        
  <div className="flex flex-col">
     {activeTab === "friends" && <FriendsTab/>}
     {activeTab === "chats" && <ChatTab/>}
     </div>
   
   
      <div className="p-4 border-t border-purple-900/30 flex justify-around fixed top-189 w-full">

        <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-purple-500 p-2">
          <SettingsIcon className="h-6 w-6 cursor-pointer" />
        </button>


        <button className="text-gray-400 hover:text-purple-500 p-2">
          <SunIcon className="h-6 w-6" /> 
        </button>
        <button  onClick={()=> handleLogout()} className="text-gray-400 hover:text-purple-500 p-2">
          <LogOutIcon className="h-6 w-6 cursor-pointer"/>
        </button>
      </div>


        <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        UserName={profile?.username ?? ""}
        Bio={profile?.bio ?? ""}
        profilepic={profile?.profilepic ?? ""}
        onProfileUpdated={onProfileUpdated} 
      />

    </div>;
};