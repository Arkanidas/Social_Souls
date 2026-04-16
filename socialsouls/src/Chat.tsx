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


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);


      await updateDoc(userRef, {
        status: {
          state: "online",
          lastChanged: serverTimestamp(),
        },
      });


      const handleVisibility = async () => {
        await updateDoc(userRef, {
          status: {
            state: document.hidden ? "idle" : "online",
            lastChanged: serverTimestamp(),
          },
        });
      };

      document.addEventListener("visibilitychange", handleVisibility);

      return () => {
        updateDoc(userRef, {
          status: {
            state: "offline",
            lastChanged: serverTimestamp(),
          },
        }).catch(() => {});

        document.removeEventListener("visibilitychange", handleVisibility);
      };
    });

    return () => unsub();
  }, []);

  // Fetch profile
  const fetchProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="flex h-screen bg-black">
      <Sidebar
        profile={profile ? {
          username: profile.username,
          profilePic: profile.profilePic,
          bio: profile.bio,
        } : undefined}
        onProfileUpdated={fetchProfile}
      />
      <UserProfileModal />
      <ChatArea />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Chat;