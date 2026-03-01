import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { X, Users } from "lucide-react";
import Ghost from "../assets/ghosts.png";
import ShinyText from '../components/ShinyText';

type UserProfile = {
  username: string;
  bio?: string;
  profilePic?: string;
  friends?: string[];
  role?: "user" | "superuser";
  status?: {
    state: "online" | "offline" | "idle";
    lastChanged: any;
  };
};

export const showUserProfileModal = (userId?: string) => {
  const event = new CustomEvent("showUserProfileModal", {
    detail: { userId }
  });
  window.dispatchEvent(event);
};




export const UserProfileModal = () => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isSuperUser = profile?.role === "superuser";


  const closeModal = () => {
  setOpen(false);
  setProfile(null);
};

  useEffect(() => {
    const handler = async (e: any) => {

    setOpen(true);
    setProfile(null); 

  const passedUserId = e.detail?.userId;
  const userIdToLoad = passedUserId || auth.currentUser?.uid;

  if (!userIdToLoad) return;

  const snap = await getDoc(doc(db, "users", userIdToLoad));
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
    : "gray";

const friendsCount = profile.friends?.length ?? 0;
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ">
      <div className={`relative w-[340px] h-[460px] rounded-3xl p-6 shadow-2xl text-center UserProfileModal
  ${isSuperUser
    ? "bg-gradient-to-br from-fuchsia-500 via-purple-500 via-indigo-500 via-blue-500 to-cyan-500 modal-card super-glow"
    : "bg-gray-700/50 text-white"
  }`}>


        <button onClick={closeModal} className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer">
          <X/>
        </button>


        <div className="w-36 h-36 rounded-full p-1 flex justify-center mx-auto mt-4">
          <img
            src={profile.profilePic || Ghost} 
            className={`w-full h-full rounded-full border-3 object-cover
       ${statusColor === "green"
        ? "border-green-400 shadow-[0px_0px_24px_0px_rgba(0,255,0,1)]"
        : statusColor === "yellow"
        ? "border-yellow-400 shadow-[0px_0px_24px_0px_rgba(255,255,0,1)]"
        : "border-gray-500 shadow-[-1px_0px_23px_15px_rgba(0,_0,_0,_0.3)]"}`}/>
        </div>
       <span className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${statusState === "online" ? "text-green-300" : statusState === "idle" ? "text-yellow-500" : "text-gray-300"}`}>
        
        {statusText}
       </span>

       {/* Username */}
<h2 className="mt-4 text-4xl font-[Scary] text-white">
  {isSuperUser ? (
    <ShinyText
      text={profile.username || "Unknown Soul"}
      speed={2}
      delay={0}
      color="#343434de"
      shineColor="#ffffff"
      spread={120}
      direction="left"
      yoyo={false}
      pauseOnHover={false}
      disabled={false}
    />
  ) : (
    profile.username || "Unknown Soul"
  )}
</h2>


   
        {/* Bio */}
        <p className="mt-4 text-white/90 text-md leading-relaxed px-2">
          {profile.bio || "Wandering soul here to explore the spectral realm..."}
        </p>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-white/90 group cursor-default">
         <Users  size={20} />
         <span className="text-md font-medium">
          {friendsCount}
         </span>


        <div className="absolute -top-9 left-1/2 -translate-x-1/2 
                  bg-black/50 text-xs text-white px-2 py-2 rounded-md
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                   Souls Befriended
        </div>
       </div> 
      </div>
    </div>
  );
};
