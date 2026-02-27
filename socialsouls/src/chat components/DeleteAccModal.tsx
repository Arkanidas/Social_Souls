import { useEffect, useState } from "react";
import { XIcon, Skull  } from "lucide-react";
import { deleteUser} from "firebase/auth";
import { doc, collection, query, where, getDocs, writeBatch} from "firebase/firestore";
import { auth, db} from "../firebase/firebaseConfig";
import { useNavigate } from 'react-router-dom';
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";



export const showDeleteAccountModal = () => {
  window.dispatchEvent(new CustomEvent("showDeleteAccountModal"));
};

export const DeleteAccountConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();


  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("showDeleteAccountModal", open);
    return () => window.removeEventListener("showDeleteAccountModal", open);
  }, []);


  // Handle account deletion function
  const handleDeleteAccount = async (password: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) return;

  try {
    setIsDeleting(true);

    // 1️⃣ Reauthenticate
    const credential = EmailAuthProvider.credential(
      user.email,
      password
    );

    await reauthenticateWithCredential(user, credential);

    // 2️⃣ Delete Auth FIRST
    await deleteUser(user);

    // 3️⃣ Delete Firestore data AFTER auth deletion
    const batch = writeBatch(db);

    const userRef = doc(db, "users", user.uid);
    batch.delete(userRef);

    const messagesQuery = query(
      collection(db, "messages"),
      where("senderId", "==", user.uid)
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();

    navigate("/");

  } catch (error: any) {
    console.error(error);

    if (error.code === "auth/requires-recent-login") {
      alert("Please log in again.");
    } else if (error.code === "auth/wrong-password") {
      alert("Incorrect password.");
    } else {
      alert("Delete failed. Enter your password correctly and try again.");
    }
  } finally {
    setIsDeleting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn ">
      <div className="bg-gray-900 border border-red-800 border-2 rounded-xl shadow-2xl p-6 w-full max-w-md scale-95 UserProfileModal ">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-red-600 text-center flex-1">
            Delete your spectral soul?
          </h2>

          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <XIcon size={24} className="cursor-pointer hover:text-purple-600 duration-200"/>
          </button>
        </div>

        <p className="text-gray-400 mb-6 text-sm">
          Are you really sure you want to return to the Living World forever? This action cannot be undone and all your chats and friendships will be lost.
        </p>

        <input
          type="password"
          placeholder="Enter your password to confirm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 duration-200"
        />

        <div className="flex justify-center gap-3 ">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-200 shadow-md shadow-gray-500/30 cursor-pointer"
          >
            Hell Nah
          </button>

          <button
            disabled={isDeleting}
            onClick={() => handleDeleteAccount(password)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-800 text-white transition shadow-lg shadow-purple-500/30 cursor-pointer"
          >
          <span>End me</span>
          <Skull size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
