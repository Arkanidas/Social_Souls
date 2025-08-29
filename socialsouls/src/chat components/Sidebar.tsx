import { useState } from 'react';
import { UserCard } from './UserCard';
import { Users2Icon, MessageSquareIcon, SettingsIcon, SearchIcon, MoonIcon, SunIcon, LogOutIcon } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth} from '../firebase/firebaseConfig'; 
import { SettingsPopup } from '../chat components/SettingsModal'



type ProfileType = {
  username: string;
  profilepic: string;
  bio: string;
};

type SidebarProps = {
  profile?: ProfileType; 
};

export const Sidebar = ({profile}:SidebarProps) => {

  const navigate = useNavigate();

const handleLogout = async () => {
  await signOut(auth);
  navigate("/");
};

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)


  const [activeTab, setActiveTab] = useState('chats');
  const {
    isDark,
    toggleTheme
  } = useTheme();


  const onlineUsers = [{
    id: 1,
    name: 'Shadow Walker',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop'
  }, {
    id: 2,
    name: 'Mystic Wanderer',
    status: 'away',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop'
  }, {
    id: 3,
    name: 'Night Stalker',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&auto=format&fit=crop'
  }];

  
  return <div className={`w-80 border-r backdrop-blur-sm ${isDark ? 'border-purple-900/30 bg-gray-900/95' : 'border-gray-200 bg-white/95'} flex flex-col relative z-10`}>
      {/* User Profile Header */}
      <div className={`p-4 border-b ${isDark ? 'border-purple-900/30' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isDark ? 'border-purple-500' : 'border-purple-400'}`}>
            <img src="https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=800&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
              {profile? profile.username : 'unknown ghost'}
            </h3>
            <p className="text-sm text-purple-500">Haunting Online</p>
          </div>
        </div>
      </div>
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <input type="text" placeholder="Search the void..." className={`w-full ${isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-200'} pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border`} />
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className={`flex border-b ${isDark ? 'border-purple-900/30' : 'border-gray-200'}`}>
        <button onClick={() => setActiveTab('chats')} className={`flex-1 p-4 text-sm font-medium ${activeTab === 'chats' ? 'text-purple-500 border-b-2 border-purple-500' : `${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`}`}>
          <MessageSquareIcon className="h-5 w-5 mx-auto mb-1" />
          Chats
        </button>
        <button onClick={() => setActiveTab('friends')} className={`flex-1 p-4 text-sm font-medium ${activeTab === 'friends' ? 'text-purple-500 border-b-2 border-purple-500' : `${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`}`}>
          <Users2Icon className="h-5 w-5 mx-auto mb-1" />
          Friends
        </button>
      </div>
      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {onlineUsers.map(user => <UserCard key={user.id} user={user} />)}
      </div>
      {/* Bottom Navigation */}
      <div className={`p-4 border-t ${isDark ? 'border-purple-900/30' : 'border-gray-200'} flex justify-around`}>

        <button  onClick={() => setIsSettingsOpen(true)} className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500 p-2`}>
          <SettingsIcon className="h-6 w-6" />
        </button>


        <button className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500 p-2`} onClick={toggleTheme}>
          {isDark ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
        <button className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500 p-2`}>
          <LogOutIcon className="h-6 w-6" />
        </button>
      </div>

        <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>;
};