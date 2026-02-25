import {Sidebar} from './chat components/Sidebar';
import {ChatArea} from './chat components/ChatArea';
import { useEffect, useState } from "react";
import { auth, db } from "./firebase/firebaseConfig"; 
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Toaster } from "react-hot-toast";
import { UserProfileModal } from "../src/chat components/ProfileModal";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
 const navigate = useNavigate();

 const useUserPresence = () => {

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("/");
    }
  });

  return () => unsubscribe();
}, []);

 useEffect(() => {

  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // Set user online on appload
    const userSnap = await getDoc(userRef);
if (userSnap.exists()) {
    await updateDoc(userRef, {
      status: {
        state: "online",
        lastSeen: serverTimestamp(),
      },
    });
  }
    // Set Idle when tab is hidden
    const handleVisibility = async () => {
      const userSnap = await getDoc(userRef);
if (userSnap.exists()) {
      await updateDoc(userRef, {
        status: {
          state: document.hidden ? "idle" : "online",
          lastSeen: serverTimestamp(),
        },
      });
    };
  }
    document.addEventListener("visibilitychange", handleVisibility);

    // Set Offline on close / refresh
    const handleUnload = async () => {
      const userSnap = await getDoc(userRef);
if (userSnap.exists()) {
      await updateDoc(userRef, {
        status: {
          state: "offline",
          lastSeen: serverTimestamp(),
        },
      });
    };
  }
  
    window.addEventListener("beforeunload", handleUnload);

   

    // Set Offline on logout or disconnect 
    return () => {
      handleUnload();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
    };
  });

  return () => unsub();

  
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
          profilePic: profile.profilePic,
          bio: profile.bio} : undefined}
          onProfileUpdated={fetchProfile}/>
         <UserProfileModal />
         <ChatArea />
         <Toaster position="top-center" reverseOrder={false} />
      </div>;
  };

  export default Chat