import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { doc, updateDoc, arrayRemove} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useChat } from "../context/ChatContext";



export const showPerishModal = () => {
  window.dispatchEvent(new CustomEvent("showPerishModal"));
};

export const PerishModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = auth.currentUser;
  const { closeChat } = useChat();



  useEffect(() => {
  const open = () => setIsOpen(true);
  window.addEventListener("showPerishModal", open);
  return () => window.removeEventListener("showPerishModal", open);
}, []);






  const handlePerishSoul = async (friendId: string) => {
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    const friendRef = doc(db, "users", friendId);
  
    const chatId = [user.uid, friendId].sort().join("_");
    try {
     
      await Promise.all([
        updateDoc(userRef, {
          friends: arrayRemove(friendId),
        }),
        updateDoc(friendRef, {
          friends: arrayRemove(user.uid),
        }),
      ]);
  
      await closeChat(chatId);
  
    } catch (err) {
      console.error("Failed to perish soul:", err);
    }
  };


    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn ">
      <div className="bg-gray-900 border border-purple-700/40 rounded-xl shadow-2xl p-6 w-full max-w-md scale-95 UserProfileModal ">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-300 text-center flex-1 text-xl">
            Are you sure you want to extinguish 
          </h2>

          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <XIcon size={24} className="cursor-pointer hover:text-purple-600 duration-200"/>
          </button>
        </div>

        <p className="text-gray-400 mb-6 text-md">
           Chats between and your soulmate will be saved until reunited again
        </p>

        <div className="flex justify-center gap-3 ">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-200 shadow-md shadow-gray-500/30 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() => {handlePerishSoul(user!.uid); setIsOpen(false);}}
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition shadow-lg shadow-purple-500/30 cursor-pointer"
          >
            Perish
          </button>
        </div>
      </div>
    </div>
  );
};
