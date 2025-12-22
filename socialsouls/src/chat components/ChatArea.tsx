import React, { useEffect, useState, useRef } from 'react'
import { MessageInput } from './MessageInput';
import { XIcon, SkullIcon } from 'lucide-react'
import { auth, db } from '../firebase/firebaseConfig'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, addDoc, orderBy, onSnapshot } from "firebase/firestore"
import { toast } from 'react-hot-toast'
import { useChat } from "../context/ChatContext";
import Ghostly from "../assets/ghosts.png";
import { Ghost as GhostIcon } from "lucide-react";

export const showAddFriendModal = () => {
  const event = new CustomEvent('showAddFriendModal')
  window.dispatchEvent(event)
}



export const ChatArea = () => {

  const [Usermessages, setUserMessages] = useState<any[]>([]);
  const [otherUserStatus, setOtherUserStatus] = useState<"online" | "offline">("offline");
  const { activeChatUser } = useChat();
  const user = auth.currentUser;
  const [showAddFriend, setShowAddFriend] = useState(false)
  const addFriendInputRef = useRef<HTMLInputElement>(null)
  const bottomScroll = useRef<HTMLDivElement>(null);


useEffect(() => {
  bottomScroll.current?.scrollIntoView({ behavior: "smooth" });
}, [Usermessages]);



  const handleSendMessage = async (text: string) => {

    if (!user) return;
    if (!activeChatUser || !activeChatUser.chatId) return;
    if (!text.trim()) return;

  const chatId = activeChatUser.chatId;
  const messagesRef = collection(db, "Chats", chatId, "messages");

  await addDoc(messagesRef, {
    text,
    senderId: user.uid,
    createdAt: serverTimestamp(),
  });

  const chatRef = doc(db, "Chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });

 await updateDoc(doc(db, "Chats", chatId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });

   console.log("Message sent:", text);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto" />

      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};




useEffect(() => {
  if (!activeChatUser?.chatId) {
    setUserMessages([]);
    return;
  }

  const messagesRef = collection(
    db,
    "Chats",
    activeChatUser.chatId,
    "messages"
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUserMessages(msgs);
  });

  return () => unsubscribe();
}, [activeChatUser?.chatId]);



  useEffect(() => {
    const handleShowModal = () => setShowAddFriend(true)
    window.addEventListener('showAddFriendModal', handleShowModal)
    return () => {
      window.removeEventListener('showAddFriendModal', handleShowModal)
    }
  }, [])

  useEffect(() => {
  if (!activeChatUser?.otherUser?.uid) return;

  const userRef = doc(db, "users", activeChatUser.otherUser.uid);

  const unsub = onSnapshot(userRef, (snap) => {
    const data = snap.data();
    if (data?.status?.state) {
      setOtherUserStatus(data.status.state);
    }
  });

  return () => unsub();
}, [activeChatUser?.otherUser?.uid]);

  useEffect(() => {
    if (showAddFriend && addFriendInputRef.current) {
      setTimeout(() => {
        addFriendInputRef.current?.focus()
      }, 300) 
    }
  }, [showAddFriend])



  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = addFriendInputRef.current
    const friendUsername = input?.value.trim()

      if(!friendUsername) return
      const user = auth.currentUser

        if(!user) {
        toast.error("You must be logged in to summon a spirit!", {
          duration: 4000,
        });
        return
       }

    if (input && friendUsername) {
      console.log(`Searching for user: ${input.value}`)
      
try {
   
      const q = query(collection(db, "users"), where("username", "==", friendUsername))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        toast.error("Spirit not found 👻")
        return
      }

      const friendDoc = querySnapshot.docs[0]
      const friendId = friendDoc.id


      if (friendId === user.uid) {
        toast.error("You cannot summon yourself 😅")
        return
      }


      const userRef = doc(db, "users", user.uid)

      await updateDoc(userRef, {
        sentRequests: arrayUnion(friendId),
        friendRequests: arrayRemove(friendId)
      })

      await updateDoc(doc(db, "users", friendId), {
       friendRequests: arrayUnion(user.uid),
       sentRequests: arrayRemove(user.uid)
});

      toast.success(`${friendUsername} has been summoned successfully! 🪄`)
      input.value = ''
      setShowAddFriend(false)

    } catch (error) {
      console.error("Error adding friend:", error)
      toast.error("Something went wrong!")
    }
  }

  }



 
  
  return <div className="flex-1 flex flex-col relative z-10 bg-gray-900/95 ">
      <div className="p-4 border-b backdrop-blur-sm border-purple-900/30 bg-gray-900/95 flex items-center ">
        <div className="flex items-center ">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 ">
            <img src={activeChatUser ? activeChatUser.otherUser.profilePic : Ghostly} alt="Shadow Walker" className="w-full h-full object-cover" />
          </div>

          <div className="ml-3 ">
            <h3 className="text-white">
              {activeChatUser ? activeChatUser.otherUser.username : 'Select a Soul to chat'}
            </h3>
           <div className="flex items-center justify-end gap-2">
  
  <p className="text-sm text-purple-400">
    {otherUserStatus === "online" ? "Haunting Online" : "Haunting Offline"}
  </p>
  <GhostIcon
    size={14}
    className={
      otherUserStatus === "online"
        ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
        : "text-red-400 drop-shadow-[0_0_1px_rgba(239,68,68,0.8)]"
    }
  />
</div>
          </div>
        </div>
      </div>

      
     
       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/95">

  {Usermessages.map((message) => {
    const isOwnMessage = message.senderId === user?.uid;

    return (
      <div
        key={message.id}
        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
        ref={bottomScroll}
      >
        <div
          className={`max-w-[70%] p-4 rounded-lg ${
            isOwnMessage
              ? "bg-purple-600 text-white ml-12"
              : "bg-white text-gray-900 shadow-sm mr-12"
          }`}
        >
          <p className="mb-1 text-sm font-medium">
            {isOwnMessage ? "You" : activeChatUser?.otherUser.username}
          </p>

          <p className="mb-2">{message.text}</p>

          {message.createdAt && (
            <p className="text-xs opacity-70">
              {new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    );
  })}
</div>
      

      

      {showAddFriend && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40 ">
          <div
            className="add-friend-modal bg-purple-200 text-gray-200 border-purple-900/50 text-gray-800 border-purple-300/50 border-2 rounded-lg shadow-2xl p-6 w-full max-w-md "
          >
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-2xl font-bold font-serif ">
                <span className="text-purple-500 ">Summon</span> a Spirit
              </h2>
              <button
                onClick={() => setShowAddFriend(false)}
                className="text-gray-600 hover:text-red-500 transition-colors cursor-pointer "
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-6 text-gray-600">
              Search the ethereal plane for lost souls...
            </p>
            
            <form onSubmit={handleAddFriendSubmit} className="relative ">
              <div className="relative flex items-center ">
                <input
                  ref={addFriendInputRef}
                  type="text"
                  placeholder="Enter a username to summon..."
                  className="w-full pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border bg-gray-100 text-gray-900 border-purple-200 placeholder-purple-500/50"
                />
                <SkullIcon className="absolute left-3 text-purple-500 h-5 w-5 animate-pulse pointer-events-none " />
              </div>
              <div className="mt-6 flex justify-end ">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="mr-2 px-4 py-2 rounded-md cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer"
                >
                  Summon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
   
      <MessageInput onSend={handleSendMessage} />
    </div>;
};