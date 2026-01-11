import {Sidebar} from './chat components/Sidebar';
import {ChatArea} from './chat components/ChatArea';
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase/firebaseConfig"; 
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Toaster } from "react-hot-toast";
import { UserProfileModal } from "../src/chat components/ProfileModal";

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

const useUserPresence = () => {
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // Online when Chat opens
    updateDoc(userRef, {
      status: {
        state: "online",
        lastSeen: serverTimestamp(),
      },
    });

    // Idle when tab not visible
    const handleVisibility = () => {
      updateDoc(userRef, {
        status: {
          state: document.hidden ? "idle" : "online",
          lastSeen: serverTimestamp(),
        },
      });
    };

    // offline on close / refresh
    const handleOffline = () => {
      updateDoc(userRef, {
        status: {
          state: "offline",
          lastSeen: serverTimestamp(),
        },
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleOffline);

    return () => {
      handleOffline();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleOffline);
    };
  }, []);
};

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
         <UserProfileModal />
        <ChatArea />
         <Toaster position="top-center" reverseOrder={false} />
      </div>;
  };

  export default Chat