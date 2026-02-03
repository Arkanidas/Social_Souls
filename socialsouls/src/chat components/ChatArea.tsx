import React, { useEffect, useState, useRef } from 'react'
import { MessageInput } from './MessageInput';
import { XIcon, SkullIcon, FileInput, PaperclipIcon, X, Download, Copy } from 'lucide-react'
import { auth, db, storage } from '../firebase/firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, addDoc, orderBy, onSnapshot } from "firebase/firestore"
import { toast } from 'react-hot-toast'
import { useChat } from "../context/ChatContext";
import Ghostly from "../assets/ghosts.png";
import { Ghost as GhostIcon } from "lucide-react";
import {formatChatTimestamp, formatLastSeen} from './DateUtils';
import { useNotificationSound } from "../Hooks/Notification";
import { showUserProfileModal } from "../chat components/ProfileModal";


export const showAddFriendModal = () => {
  const event = new CustomEvent('showAddFriendModal')
  window.dispatchEvent(event)
}
interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  attachments?: {
    url: string;
    name: string;
    type: string;
  }[];
}

export const ChatArea = () => {



  const [Usermessages, setUserMessages] = useState<ChatMessage[]>([]);
  const [otherUserStatus, setOtherUserStatus] = useState<"online" | "idle"| "offline">("offline");
  const [showAddFriend, setShowAddFriend] = useState<boolean>(false);
  const addFriendInputRef = useRef<HTMLInputElement>(null);
  const bottomScroll = useRef<HTMLDivElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const user = auth.currentUser;
  const [PreviewImageName, setPreviewImageName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { play } = useNotificationSound();
  const prevMessageCountRef = useRef<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const lastMessageIdRef = useRef<string | null>(null);
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [isSpamBlocked, setIsSpamBlocked] = useState(false);
  const [spamCountdown, setSpamCountdown] = useState(0);
  const { openChats, activeChatId } = useChat();
  const [mutedSouls, setMutedSouls] = useState<string[]>([]);

  const activeChatUser = openChats.find(
  (chat) => chat.chatId === activeChatId
);


  const BASE_TITLE = "Social Souls";

useEffect(() => {
 if (!showScrollToBottom) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [Usermessages]);



  const handleSendMessage = async (text: string) => {
  if (!user) return;
  if (!activeChatUser?.chatId) return;
  if (!text.trim() && attachments.length === 0) return;

  if (isSpamBlocked) return;

  const isSpamming = checkSpam();
  if (isSpamming) return;

  const chatId = activeChatUser.chatId;
  setIsUploading(true);

  try{
  let uploadedAttachments: any[] = [];

  if (attachments.length > 0) {
    uploadedAttachments = await Promise.all(
      attachments.map(async (file) => {
        const fileRef = ref(
          storage,
          `chats/${chatId}/${crypto.randomUUID()}-${file.name}`
        );

        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        return {url, name: file.name, type: file.type,};
      }))
     ;}
  

  await addDoc(collection(db, "Chats", chatId, "messages"), {
    text: text || "",
    senderId: user.uid,
    createdAt: serverTimestamp(),
    attachments: uploadedAttachments,
  });

  await updateDoc(doc(db, "Chats", chatId), {
    lastMessage:
      text || (uploadedAttachments.length > 0 ? "Attachment" : ""),
    lastMessageAt: serverTimestamp(),
  });


  setAttachments([]);
  } catch (error) {
    toast.error("Failed to send message. Please try again.");
  } finally {
    setIsUploading(false);
  }

};

useEffect(() => {
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) New message${unreadCount > 1 ? "s" : ""} ${BASE_TITLE}`;
  } else {
    document.title = BASE_TITLE;
  }
}, [unreadCount]);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      setUnreadCount(0);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);

useEffect(() => {
  if (activeChatUser?.chatId) {
    setUnreadCount(0);
  }
}, [activeChatUser?.chatId]);



 useEffect(() => {
  if (!activeChatUser?.chatId) {
    setUserMessages([]);
    return;
  }

  const messagesRef = collection(db, "Chats", activeChatUser.chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data() as Omit<ChatMessage, "id">}));

    const lastMsg = msgs[msgs.length - 1];

if (
  lastMsg &&
  lastMsg.id !== lastMessageIdRef.current &&
  lastMsg.senderId !== user?.uid
) {
  const isTabHidden = document.visibilityState !== "visible";

  if (isTabHidden) {
    setUnreadCount((prev) => prev + 1);
  }
}

lastMessageIdRef.current = lastMsg?.id || null;

    setUserMessages(msgs);
});

  return () => unsubscribe();
}, [activeChatUser?.chatId]);


useEffect(() => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const ref = doc(db, "users", currentUser.uid);

  const unsub = onSnapshot(ref, snap => {
    setMutedSouls(snap.data()?.mutedSouls || []);
  });

  return () => unsub();
}, []);



useEffect(() => {
  if (!activeChatUser) return;
  if (!Usermessages.length) return;

  const lastMessage = Usermessages[Usermessages.length - 1];
  const currentUserId = auth.currentUser?.uid;

  const isNewMessage = Usermessages.length > prevMessageCountRef.current;

  const isFromOtherUser = lastMessage.senderId !== currentUserId;

  const isMuted = mutedSouls.includes(lastMessage.senderId);

  if (isNewMessage && isFromOtherUser && !isMuted) {
    play();
  }

  prevMessageCountRef.current = Usermessages.length;
}, [Usermessages, activeChatUser, mutedSouls, play]);



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

    if (data?.status?.lastChanged?.seconds) {
      setLastSeen(data.status.lastChanged.seconds);
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

  useEffect(() => {
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") setPreviewImage(null);
  };
  window.addEventListener("keydown", onEsc);
  return () => window.removeEventListener("keydown", onEsc);
}, []);


const checkSpam = () => {
  const now = Date.now();

 
  const recent = messageTimestamps.filter(
    (t) => now - t < 5000
  );

  recent.push(now);
  setMessageTimestamps(recent);


  if (recent.length >= 4) {
    triggerSpamCooldown();
    return true;
  }

  return false;
};

const triggerSpamCooldown = () => {
  setIsSpamBlocked(true);
  setSpamCountdown(10);

  let seconds = 10;

  const interval = setInterval(() => {
    seconds -= 1;
    setSpamCountdown(seconds);

    if (seconds <= 0) {
      clearInterval(interval);
      setIsSpamBlocked(false);
      setMessageTimestamps([]);
    }
  }, 1000);
};

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
        toast.error("Spirit not found...")
        return
      }

      const friendDoc = querySnapshot.docs[0]
      const friendId = friendDoc.id


      if (friendId === user.uid) {
        toast.error("You cannot summon yourself")
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

      toast.success(`${friendUsername} has been summoned successfully!`)
      input.value = ''
      setShowAddFriend(false)

    } catch (error) {
      toast.error("Something went wrong!")
    }
  }}



  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; //10Mb
  const fileInputRef = useRef<HTMLInputElement | null>(null);

const validateFiles = (files: File[]) => {
  if (files.length + attachments.length > MAX_FILES) {
    toast.error("Max 10 files allowed");
    return [];
  }

  return files.filter((file) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds 10MB`);
      return false;
    }
    return true;
  });
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
  if (!isZoomed) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  setOrigin({ x, y });
};

const handleCopyImageUrl = async () => {
  if (!previewImage) return;

  try {
    await navigator.clipboard.writeText(previewImage);
    toast.success("Image copied to clipboard");
  } catch {
    toast.error("Failed to copy image link");
  }
};

const handleDownloadImage = async () => {
  if (!previewImage || !PreviewImageName) return;

  try {
    const response = await fetch(previewImage);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = PreviewImageName;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch {
    toast.error("Download failed, Please try again!");
  }
};

 
  
  return <div className="flex-1 flex flex-col relative z-10 bg-gray-900/95 ">
      <div className="p-4 border-b backdrop-blur-sm border-purple-900/30 bg-gray-900/95 flex items-center shadow-[inset_0px_0px_100px_-12px_rgba(0,_0,_0,_0.8)]">
        <div className="flex items-center ">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 cursor-pointer" onClick={() => {
             if (!activeChatUser) return;
                showUserProfileModal(activeChatUser.otherUser.uid);}}>
            <img src={activeChatUser ? activeChatUser.otherUser.profilePic : Ghostly} alt="Unknown Ghost" className="w-full h-full object-cover" />
          </div>

          <div className="ml-3 ">
            <h3 className="text-white">
              {activeChatUser ? activeChatUser.otherUser.username : 'Select a Soul to Chat'}
            </h3>



  {activeChatUser && (
        <div className="relative group flex items-center gap-2">

        <p className="text-sm text-purple-400">
        {otherUserStatus === "online"
        ? "Haunting Online"
        : otherUserStatus === "idle"
        ? "Haunting Idle"
        : "Haunting Offline"}
    </p>

    <GhostIcon
      size={16}
      className={
        otherUserStatus === "online"
          ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
          : otherUserStatus === "idle"
          ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
          : "text-gray-400 shadow-[-1px_0px_23px_15px_rgba(0,_0,_0,_0.3)]"
      }
    />

    {otherUserStatus === "offline" && lastSeen && (
      <div className="absolute top-full left-0 mt-1 px-2 py-1 rounded-md text-xs bg-gray-50 text-black opacity-0 group-hover:opacity-100 transition pointer-events-none">
        Last seen {formatLastSeen(lastSeen)}
      </div>
    )}
  </div>
)}

          </div>
        </div>
      </div>
      
{isUploading && (
  <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center">
    <svg
      aria-hidden="true"
      className="w-12 h-12 animate-spin text-purple-400 fill-purple-600"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124"
        fill="currentFill"
      />
    </svg>
  </div>
)}


     
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/95 shadow-[inset_0px_0px_100px_50px_rgba(0,_0,_0,_0.8)]" ref={messagesContainerRef}
     onScroll={() => {
    const scroller = messagesContainerRef.current;
    if (!scroller) return;

    const isNearBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 550;

    setShowScrollToBottom(!isNearBottom);
  }}


  
     onDragEnter={(e) => {
      e.preventDefault();
      setIsDragging(true);}}

     onDragOver={handleDragOver}
      onDragLeave={(e) => {
       if (e.currentTarget === e.target) {
         setIsDragging(false);}}}

     onDrop={(e) => {
      e.preventDefault();
      setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    setAttachments((prev) => [...prev, ...validFiles]);
  }}>

{isDragging && (
  <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center pointer-events-none border-dashed border-4 border-purple-500 rounded-xl">
    <div className="rounded-xl p-16">
      <FileInput className="h-20 w-20 text-white" />
    </div>
  </div>
)}

{showScrollToBottom && (
  <button
    onClick={() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3
      rounded-full
      shadow-lg
      animate-bounce
      transition"
    title="Scroll to latest"
  >
    ↓
  </button>
)}

  {Usermessages.map((message) => {
    const isOwnMessage = message.senderId === user?.uid;

    return (
      <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`} ref={bottomScroll}>

       <div className={`max-w-[50%] p-4 rounded-lg ${
        isOwnMessage
      ? "bg-purple-600 text-white ml-12"
      : "bg-white text-gray-900 shadow-sm mr-12"}`}>

       <p className="mb-1 text-base font-bold text-lg">
        {isOwnMessage ? "You" : activeChatUser?.otherUser.username}
       </p>
    <div ref={bottomRef} />

  {message.attachments && message.attachments.length > 0 && (
    <div className="flex flex-wrap gap-2 mb-2">
      {message.attachments.map((file: any, i: number) => (
        <div
          key={i}
          className="w-23 h-23 bg-black/20 rounded overflow-hidden flex items-center justify-center hover:scale-105 transition-transform"
        >
          {file.type.startsWith("image") ? (
            <img 
              onClick={() => {setPreviewImage(file.url), setPreviewImageName(file.name)}}
              src={file.url}
              className="w-full h-full object-cover rounded cursor-pointer hover:opacity-90"
            />
          ) : (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center text-xs text-white gap-1 px-2 text-center"
            >
              <PaperclipIcon className="h-5 w-5" />
              <span className="truncate w-full">{file.name}</span>
            </a>
          )}
        </div>
      ))}
    </div>
  )}


  {message.text && (
    <p className="mb-2 font-[messageFont] text-lg break-words break-all whitespace-pre-wrap max-w-full">
      {message.text}
    </p>
  )}


  {message.createdAt && (
    <p className="text-xs opacity-70">
      {formatChatTimestamp(message.createdAt.seconds)}
    </p>
  )}
       </div>
      </div>
      
    );
  })}


</div>


      
{previewImage && (
  <div
    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
    onClick={() => setPreviewImage(null)}
  >
 
    <div
      className="absolute top-6 right-6 flex items-center gap-2 bg-gray-900/80 backdrop-blur-lg rounded-xl p-2 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
 
      <button
        className="p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
        onClick={handleCopyImageUrl}
        title="Copy image"
      >
        <Copy className="w-5 h-5 text-white" />
      </button>

   
      <button
        onClick={handleDownloadImage}
        className="p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
        title="Download"
      >
        <Download className="w-5 h-5 text-white" />
      </button>

      <button
        onClick={() => setPreviewImage(null)}
        className="p-2 rounded-lg hover:bg-red-500/20 transition cursor-pointer"
        title="Close"
      >
        <X className="w-5 h-5 text-white" />
      </button>
    </div>

  
    <div
      className="flex items-center justify-center w-full h-full"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        id="preview-image"
        src={previewImage}
        onClick={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setOrigin({ x, y });
    setIsZoomed((prev) => !prev);
  }}
        onMouseMove={handleMouseMove}
        className={`
    max-w-[90vw]
    max-h-[90vh]
    rounded-xl
    transition-transform duration-300 ease-out
    ${isZoomed ? "cursor-zoom-out scale-200" : "cursor-zoom-in"}
  `}
  style={{
    transformOrigin: `${origin.x}% ${origin.y}%`,
  }}
      />
    </div>
  </div>
)}
      

      {showAddFriend && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40 ">
          <div className="add-friend-modal bg-purple-200 text-gray-200 border-purple-900/50 text-gray-800 border-purple-300/50 border-2 rounded-lg shadow-2xl p-6 w-full max-w-md ">
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-2xl font-bold font-serif ">
                <span className="text-purple-500 ">Summon</span> a Spirit
              </h2>
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="text-gray-600 hover:text-red-500 transition-colors cursor-pointer">
                  <XIcon className="h-6 w-6" />
              </button>
            </div>

            <p className="mb-6 text-gray-600">Search the void for lost souls...</p>
            
            <form onSubmit={handleAddFriendSubmit} className="relative ">
              <div className="relative flex items-center ">
                <input
                  ref={addFriendInputRef}
                  type="text"
                  placeholder="Enter a username to summon..."
                  className="w-full pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border bg-gray-100 text-gray-900 border-purple-200 placeholder-purple-500/50"/>
                <SkullIcon className="absolute left-3 text-purple-500 h-5 w-5 animate-pulse pointer-events-none "/>
              </div>
              <div className="mt-6 flex justify-end ">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="mr-2 px-4 py-2 rounded-md cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer">
                  Summon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
   <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.zip" className="hidden" ref={fileInputRef}
      onChange={(e) => {
        if (!e.target.files) return;
      const validFiles = validateFiles(Array.from(e.target.files));
      setAttachments((prev) => [...prev, ...validFiles]);}}/>

      <MessageInput onSend={handleSendMessage} fileInputRef={fileInputRef} attachments={attachments} setAttachments={setAttachments} isSpamBlocked={isSpamBlocked} spamCountdown={spamCountdown} />
    </div>;
};