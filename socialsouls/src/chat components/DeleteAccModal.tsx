import { useEffect, useState } from "react";
import { XIcon, Skull  } from "lucide-react";
import { deleteUser } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { doc, collection, query, where, getDocs, writeBatch, arrayRemove} from "firebase/firestore";
import { auth, db} from "../firebase/firebaseConfig";


export const showDeleteAccountModal = () => {
  window.dispatchEvent(new CustomEvent("showDeleteAccountModal"));
};

export const DeleteAccountConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("showDeleteAccountModal", open);
    return () => window.removeEventListener("showDeleteAccountModal", open);
  }, []);

  const handleDeleteAccount = async () => {

  const user = auth.currentUser;

  if (!user) return;

  try {

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


    const usersQuery = query(collection(db, "users"));
    const usersSnapshot = await getDocs(usersQuery);

    usersSnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        friends: arrayRemove(user.uid),
        friendRequests: arrayRemove(user.uid),
        sentRequests: arrayRemove(user.uid),
      });
    });

    await batch.commit();
    await deleteUser(user);

    navigate("/");
    setIsOpen(false);

  } catch (error: any) {
    console.error(error);

    if (error.code === "auth/requires-recent-login") {
      alert("Please log in again before deleting your account.");
    } else {
      alert("Something went wrong while deleting the account.");
    }
  }

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fadeIn ">
      <div className="bg-gray-900 border border-purple-700/40 rounded-xl shadow-2xl p-6 w-full max-w-md scale-95 UserProfileModal ">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-300 text-center flex-1 text-xl">
            Delete your spectral soul?
          </h2>

          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <XIcon size={24} className="cursor-pointer hover:text-purple-600 duration-200"/>
          </button>
        </div>

        <p className="text-gray-400 mb-6 text-xs">
          Are you really sure you want to return to the Living World forever? This action cannot be undone and all your chats and friendships will be lost.
        </p>

        <div className="flex justify-center gap-3 ">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-200 shadow-md shadow-gray-500/30 cursor-pointer"
          >
            Hell Nah
          </button>

          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition shadow-lg shadow-purple-500/30 cursor-pointer"
          >
            End me <Skull size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
};
