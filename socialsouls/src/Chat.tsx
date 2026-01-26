import {Sidebar} from './chat components/Sidebar';
import {ChatArea} from './chat components/ChatArea';
import { useEffect, useState } from "react";
import { auth, db } from "./firebase/firebaseConfig"; 
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Toaster } from "react-hot-toast";
import { UserProfileModal } from "../src/chat components/ProfileModal";
import { getDatabase, ref, set, onDisconnect } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

interface UserProfile {
  profilePic: string;
  bio: string;
  createdAt: any;
  email: string;
  friends: string[];
  username: string;
}



 const Chat = () => {




const [profile, setProfile] = useState<UserProfile | null>(null);

const useUserPresence = () => {

  useEffect(() => {
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const rtdb = getDatabase();
      const presenceRef = ref(rtdb, `status/${user.uid}`);
      const userDocRef = doc(db, "users", user.uid);

      // Set online instantly
      set(presenceRef, {
        state: "online",
        lastChanged: Date.now(),
      });

      updateDoc(userDocRef, {
        status: {
          state: "online",
          lastSeen: serverTimestamp(),
        },
      });

      const heartbeat = setInterval(() => {
  set(presenceRef, {
    state: "online",
    lastChanged: Date.now(),
  });

  updateDoc(userDocRef, {
    status: {
      state: "online",
      lastSeen: serverTimestamp(),
    },
  });
}, 15000);


      // Auto offline if connection drops
      onDisconnect(presenceRef).set({
        state: "offline",
        lastChanged: Date.now(),
      });

      const handleVisibility = () => {
        const state = document.hidden ? "idle" : "online";

        set(presenceRef, { state, lastChanged: Date.now() });

        updateDoc(userDocRef, {
          status: {
            state,
            lastSeen: serverTimestamp(),
          },
        });
      };

      document.addEventListener("visibilitychange", handleVisibility);

      // CLEANUP when logout happens
      return () => {
        set(presenceRef, {
          state: "offline",
          lastChanged: Date.now(),
        });

        updateDoc(userDocRef, {
          status: {
            state: "offline",
            lastSeen: serverTimestamp(),
          },
        });

        document.removeEventListener("visibilitychange", handleVisibility);
        clearInterval(heartbeat);
      };
    });

    return () => unsubscribeAuth();
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



    return <div className="flex h-screen bg-black">

        <Sidebar profile={profile ? {
          username: profile.username,
          profilepic: profile.profilePic,
          bio: profile.bio} : undefined}
          onProfileUpdated={fetchProfile}/>
         <UserProfileModal />
         <ChatArea />
         <Toaster position="top-center" reverseOrder={false} />
      </div>;
  };

  export default Chat