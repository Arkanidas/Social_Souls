import { useState, useEffect} from 'react';
import { Users2Icon, MessageSquareIcon, SettingsIcon, SearchIcon, MoonIcon, SunIcon, LogOutIcon, UserPlusIcon } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth, db} from '../firebase/firebaseConfig'; 
import { SettingsPopup } from '../chat components/SettingsModal';
import { showAddFriendModal } from './ChatArea'
import { FriendsTab } from './FriendsTab';
import { ChatTab } from '../chat components/ChatsTab'
import ghost from "../assets/ghosts.png"
import { useSidebar } from "../context/SidebarContext";
import { doc, onSnapshot } from "firebase/firestore";
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


  const navigate = useNavigate();

const handleLogout = async () => {
  await signOut(auth);
  navigate("/");
  localStorage.removeItem("activeChat");
};


   

  const {
    isDark,
    toggleTheme
  } = useTheme();

useEffect(() => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  const unsub = onSnapshot(userRef, (snap) => {
    const data = snap.data();
    if (data?.status?.state) {
      setMyStatus(data.status.state);
    }
  });

  return () => unsub();
}, []);


  
  return <div className="w-80 border-r backdrop-blur-sm border-purple-900/30 bg-gray-900/95 flex flex-col relative z-10">
    
      {/* User Profile Header */}
      <div className="p-4 border-b border-purple-900/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500">
            <img src={profile? profile.profilepic : ghost} alt="Profile" className="w-full h-full object-cover" />
          </div>

          <div>
            <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
              {profile? profile.username : 'unknown ghost'}
            </h3>
            <p className="text-sm text-purple-500"> {myStatus === "online" ? "Haunting Online" : "Haunting Offline"}</p>
            <GhostIcon
    size={14}
    className={
      myStatus === "online"
        ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
        : "text-red-400 drop-shadow-[0_0_1px_rgba(239,68,68,0.8)]"
    }
  />
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
          <input type="text" placeholder="Search the void..." className="w-full bg-gray-800 text-gray-300 border-gray-700 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border"/>
        </div>
      </div>
    
      <div className={`flex border-b ${isDark ? 'border-purple-900/30' : 'border-gray-200'}`}
          >
        <button onClick={() => setActiveTab('chats')} className={`flex-1 p-4 text-sm font-medium ${activeTab === 'chats' ? 'text-purple-500 border-b-2 border-purple-500' : `${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`}`}>
          <MessageSquareIcon className="h-5 w-5 mx-auto mb-1" />
          Chats
        </button>
        <button onClick={() => setActiveTab('friends')} className={`flex-1 p-4 text-sm font-medium ${activeTab === 'friends' ? 'text-purple-500 border-b-2 border-purple-500' : `${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`}`}>
          <Users2Icon className="h-5 w-5 mx-auto mb-1" />
          Friends
        </button>
      </div>
    
        
  <div className="flex flex-col">
     {activeTab === "friends" && <FriendsTab/>}
     {activeTab === "chats" && <ChatTab/>}
     </div>
   
   
      <div className={`p-4 border-t${isDark ? 'border-purple-900/30' : 'border-gray-200'} flex justify-around relative top-75 w-full`}>

        <button onClick={() => setIsSettingsOpen(true)} className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500 p-2`}>
          <SettingsIcon className="h-6 w-6 cursor-pointer" />
        </button>


        <button className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500 p-2`} onClick={toggleTheme}>
          {isDark ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
        <button  onClick={()=> handleLogout()} className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500 p-2`}>
          <LogOutIcon className="h-6 w-6" />
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