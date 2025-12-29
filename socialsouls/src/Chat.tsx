import {Sidebar} from './chat components/Sidebar';
import {ChatArea} from './chat components/ChatArea';
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase/firebaseConfig"; 
import { doc, getDoc } from "firebase/firestore";
import { Toaster } from "react-hot-toast";
import {useUserPresence} from './chat components/UserPresence';


interface UserProfile {
  profilePic: string;
  bio: string;
  createdAt: any;
  email: string;
  friends: string[];
  username: string;
}



 const Chat = () => {


const [user] = useAuthState(auth);
const [profile, setProfile] = useState<UserProfile | null>(null);

      useUserPresence();

const fetchProfile = async () => {
      const CurrentUser = auth.currentUser;
      if (!CurrentUser) return null;

      try {
        const userDoc = await getDoc(doc(db, "users", CurrentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          console.error("No profile found!");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };


useEffect(() => {
        fetchProfile();
  }, []);



    return <div className="flex h-screen bg-gray-900/95">

        <Sidebar profile={profile ? {
          username: profile.username,
          profilepic: profile.profilePic,
          bio: profile.bio
        } : undefined}
        onProfileUpdated={fetchProfile}
        />
        <ChatArea />
         <Toaster position="top-center" reverseOrder={false} />
      </div>;
  };

  export default Chat