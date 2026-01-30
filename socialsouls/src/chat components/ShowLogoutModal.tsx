import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const showLogoutModal = () => {
  window.dispatchEvent(new CustomEvent("showLogoutModal"));
};

export const LogoutConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("showLogoutModal", open);
    return () => window.removeEventListener("showLogoutModal", open);
  }, []);

  const handleLogout = async () => {

  const user = auth.currentUser;

if (user) {
    const userRef = doc(db, "users", user.uid);

    // ✅ Force Offline BEFORE logout
    await updateDoc(userRef, {
      status: {
        state: "offline",
        lastSeen: serverTimestamp(),
      },
    });
  }



    await signOut(auth);
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn">
      <div className="bg-gray-900 border border-purple-700/40 rounded-xl shadow-2xl p-6 w-full max-w-md scale-95 UserProfileModal">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-300">
            Do you want to log out?
          </h2>

          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-400 mb-6">
          Your spectral presence will fade until you return 👻
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition"
          >
            No
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition shadow-lg shadow-purple-500/30"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
