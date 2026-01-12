import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { X } from "lucide-react";

type UserProfile = {
  username: string;
  bio?: string;
  profilePic?: string;
  status?: {
    state: "online" | "offline" | "idle";
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

  const statusState = profile.status?.state ?? "offline";

const statusText =
  statusState === "online"
    ? "Online"
    : statusState === "idle"
    ? "Idle"
    : "Offline";

const statusColor =
  statusState === "online"
    ? "green"
    : statusState === "idle"
    ? "yellow"
    : "red";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ">
      <div className="relative w-[340px] h-[460px] rounded-3xl bg-purple-800 p-6 shadow-2xl text-center UserProfileModal shadow-[4px_4px_0px_0px_rgba(255,_105,_180,_0.8)]">

    
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer">
          <X />
        </button>


        <div className="
    w-36 h-36 rounded-full p-1 flex justify-center mx-auto mt-4">
          <img
            src={profile.profilePic}
            className=
            {`
     w-full h-full rounded-full border-3 object-cover
    ${ statusColor === "green"
        ? "border-green-400 shadow-[-1px_0px_45px_11px_rgba(34,_197,_94,_0.5)]"
        : statusColor === "yellow"
        ? "border-yellow-400 shadow-[-1px_0px_45px_11px_rgba(234,_179,_8,_0.5)]"
        : "border-red-400 shadow-[-1px_0px_45px_11px_rgba(232, 55, 55)]"}`}/>
        </div>
  

        {/* Username */}
        <h2 className="mt-4 text-4xl font-[Scary] text-white ">
          {profile.username || "Unknown Soul"}
        </h2>

   
        {/* Bio */}
        <p className="mt-4 text-white/90 text-md leading-relaxed px-2">
          {profile.bio || "No bio set yet."}
        </p>
      </div>
    </div>
  );
};
