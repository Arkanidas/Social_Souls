import { useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export const useUserPresence = () => {
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);


    updateDoc(userRef, {
      status: {
        state: "online",
        lastChanged: serverTimestamp(),
      },
    });


    const handleOffline = async () => {
      await updateDoc(userRef, {
        status: {
          state: "offline",
          lastChanged: serverTimestamp(),
        },
      });
    };

    window.addEventListener("beforeunload", handleOffline);

    return () => {
      handleOffline();
      window.removeEventListener("beforeunload", handleOffline);
    };
  }, []);
};
