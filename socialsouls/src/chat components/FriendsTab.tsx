import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";



type FriendRequestItemProps = {
  userId: string;
  onAccept: (friendId: string) => void;
  onDecline: (friendId: string) => void;
};



export const FriendsTab = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  const user = auth.currentUser;

  if (!user) {
  console.error("No user is logged in");
  return null; // or a small message like "Please log in"
}

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setFriendRequests(data.friendRequests || []);
        setFriends(data.friends || []);
        setSentRequests(data.sentRequests || []); 
      }
    };

    fetchUserData();
  }, [user]);


  

  const handleAccept = async (friendId: string) => {
    const userRef = doc(db, "users", user.uid);
    const friendRef = doc(db, "users", friendId);

    // Add each other as friends
    await updateDoc(userRef, {
      friends: arrayUnion(friendId),
      friendRequests: arrayRemove(friendId)
    });

    await updateDoc(friendRef, {
      friends: arrayUnion(user.uid),
      sentRequests: arrayRemove(user.uid)
    });

    setFriendRequests(prev => prev.filter((id) => id !== friendId));
  };




  const handleDecline = async (friendId: string) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      friendRequests: arrayRemove(friendId)
    });

    setFriendRequests(prev => prev.filter((id) => id !== friendId));
  };

  return (

<div className="flex flex-col">

  {sentRequests.length > 0 && (
    <div className="mb-2">
      <h3 className="text-purple-400 mt-2 ml-2">💌 Sent Soulmate Requests</h3>
      {sentRequests.map((id) => (
        <SentRequestItem key={id} userId={id} />
      ))}
    </div>
  )}
    
  
   
      {friendRequests.length > 0 && (
        <div className="mb-4">
          <h3 className="text-purple-400 mb-2">👻 New Soulmate Requests</h3>
          {friendRequests.map((id) => (
            <FriendRequestItem
              key={id}
              userId={id}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
          
        </div>
      )}
  
      


      {friends.length === 0 ? (
        <p className="text-gray-500 text-sm overflow-y-scroll">No friends yet 👻</p>
      ) : (
        friends.map((f) => (
          <div key={f.id} className="flex items-center gap-3 p-3 hover:bg-purple-500/10 rounded-md">
            <img
              src={f.profilepic || 'https://via.placeholder.com/40'}
              className="w-10 h-10 rounded-full border border-purple-500"
            />
            <div>
              <p className="text-gray-200">{f.username}</p>
              <p className="text-xs text-purple-400">{f.bio}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const FriendRequestItem = ({ userId, onAccept, onDecline }: FriendRequestItemProps) => {
  const [friendData, setFriendData] = useState<any>(null);

  useEffect(() => {
    const fetchFriend = async () => {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) setFriendData(snap.data());
    };
    fetchFriend();
  }, [userId]);

  if (!friendData) return null;

  return (
    <div className="relative group flex items-center justify-between gap-3 p-3 hover:bg-purple-500/10 rounded-md transition">
      <div className="flex items-center gap-3">
        <img
          src={friendData.profilepic || 'https://via.placeholder.com/40'}
          className="w-10 h-10 rounded-full border border-purple-500"
        />
        <div>
          <p className="text-gray-200">{friendData.username}</p>
          <p className="text-sm mt-1 text-purple-300 italic">wants to be your soulmate 💌</p>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
        <button
          onClick={() => onAccept(userId)}
          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(userId)}
          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

const SentRequestItem = ({ userId }: { userId: string }) => {
  const [friendData, setFriendData] = useState<any>(null);

  useEffect(() => {
    const fetchFriend = async () => {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) setFriendData(snap.data());
    };
    fetchFriend();
  }, [userId]);

  if (!friendData) return null;

  return (
    <div className="group flex items-center justify-between gap-3 p-5 hover:bg-purple-500/10 rounded-md transition">
      <img
        src={friendData.profilepic || 'https://via.placeholder.com/40'}
        className="w-10 h-10 rounded-full border border-purple-500"
      />
      <div>
        <p className="text-gray-200">{friendData.username}</p>
        <p className="text-xs mt-1 text-purple-300 italic">awaiting their response</p>
      </div>

     
    <button className="opacity-0 group-hover:opacity-100 bg-gray-500 text-white px-3 py-1 rounded-md text-sm transition-opacity duration-200 cursor-pointer">
      <XIcon className="h-3 w-3" />
    </button>
    </div>
  );
};
