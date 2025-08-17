import {Sidebar} from './chat components/Sidebar';
import {useTheme} from './chat components/ThemeContext'
import {ChatArea} from './chat components/ChatArea';
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase/firebaseConfig"; 
import { Navigate } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";


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


useEffect(() => {

    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return null;

      console.log("User is authenticated with userid: " + user.uid);

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          console.error("No profile found!");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

        fetchProfile();
  }, []);



  


  
    const {
      isDark
    } = useTheme();
    return <div className={`flex h-screen ${isDark ? 'bg-gray-900/95' : 'bg-gray-50/95'}`}>

        <Sidebar profile={profile ? {
          username: profile.username,
          profilepic: profile.profilePic,
          bio: profile.bio
        } : undefined}/>
        <ChatArea />
      </div>;
  };

  export default Chat