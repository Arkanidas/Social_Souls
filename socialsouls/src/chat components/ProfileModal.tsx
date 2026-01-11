import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { X } from "lucide-react";

type UserProfile = {
  username: string;
  bio?: string;
  profilePic?: string;
  status?: {
    state: "online" | "offline";
    lastChanged: any;
  };
};

export const showUserProfileModal = () => {
  const event = new CustomEvent("showUserProfileModal");
  window.dispatchEvent(event);
};


export const UserProfileModal = () => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  

  useEffect(() => {
    const handler = async () => {
      setOpen(true);

      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    };

    window.addEventListener("showUserProfileModal", handler);
    return () => window.removeEventListener("showUserProfileModal", handler);
  }, []);
  

  if (!open || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-modalTransition">
      <div className="relative w-[340px] rounded-3xl bg-purple-600 p-6 shadow-2xl text-center">

    
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          <X />
        </button>


        <div className="flex justify-center">
          <img
            src={profile.profilePic}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>

        {/* Username */}
        <h2 className="mt-4 text-2xl font-bold text-white">
          {profile.username}
        </h2>

        {/* Bio */}
        <p className="mt-4 text-white/90 text-sm leading-relaxed px-2">
          {profile.bio || "No bio set yet."}
        </p>
      </div>
    </div>
  );
};
