import React, { useEffect, useState, useRef } from 'react'
import { MessageInput } from './MessageInput';
import { useTheme } from './ThemeContext';
import { XIcon, SkullIcon } from 'lucide-react'
import { auth, db } from '../firebase/firebaseConfig'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore"
import { toast } from 'react-hot-toast'

export const showAddFriendModal = () => {
  const event = new CustomEvent('showAddFriendModal')
  window.dispatchEvent(event)
}


export const ChatArea = () => {

  const [showAddFriend, setShowAddFriend] = useState(false)
  const addFriendInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleShowModal = () => setShowAddFriend(true)
    window.addEventListener('showAddFriendModal', handleShowModal)
    return () => {
      window.removeEventListener('showAddFriendModal', handleShowModal)
    }
  }, [])

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
      // Search for the user by username
      const q = query(collection(db, "users"), where("username", "==", friendUsername))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        toast.error("Spirit not found 👻")
        return
      }

      const friendDoc = querySnapshot.docs[0]
      const friendId = friendDoc.id

      // Prevent adding yourself
      if (friendId === user.uid) {
        toast.error("You cannot summon yourself 😅")
        return
      }

      // Update current user's friends list
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        friends: arrayUnion(friendId)
      })

      toast.success(`${friendUsername} has been summoned successfully! 🪄`)
      input.value = ''
      setShowAddFriend(false)
      
    } catch (error) {
      console.error("Error adding friend:", error)
      toast.error("Something went wrong!")
    }
  }

  }



  const {
    isDark
  } = useTheme();
  const messages = [{
    id: 1,
    sender: 'Shadow Walker',
    content: 'The spirits are restless tonight...',
    time: '11:30 PM',
    type: 'received'
  }, {
    id: 2,
    sender: 'You',
    content: 'Indeed, I can feel their presence',
    time: '11:32 PM',
    type: 'sent'
  },];
  
  return <div className="flex-1 flex flex-col relative z-10">
      <div className={`p-4 border-b backdrop-blur-sm ${isDark ? 'border-purple-900/30 bg-gray-900/95' : 'border-gray-200 bg-white/95'} flex items-center`}>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isDark ? 'border-purple-500' : 'border-purple-400'}`}>
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop" alt="Shadow Walker" className="w-full h-full object-cover" />
          </div>
          <div className="ml-3">
            <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
              Shadow Walker
            </h3>
            <p className="text-sm text-purple-500">Haunting Online</p>
          </div>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
        {messages.map(message => <div key={message.id} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-lg ${message.type === 'sent' ? 'bg-purple-600 text-white ml-12' : `${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900 shadow-sm'} mr-12`}`}>
              <p className="text-sm font-medium mb-1">{message.sender}</p>
              <p className="mb-2">{message.content}</p>
              <p className="text-xs opacity-70">{message.time}</p>
            </div>
          </div>)}
      </div>

{showAddFriend && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40">
          <div
            className={`add-friend-modal ${isDark ? 'bg-gray-900 text-gray-200 border-purple-900/50' : 'bg-white text-gray-800 border-purple-300/50'} border-2 rounded-lg shadow-2xl p-6 w-full max-w-md`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold font-serif">
                <span className="text-purple-500">Summon</span> a Spirit
              </h2>
              <button
                onClick={() => setShowAddFriend(false)}
                className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-red-500 transition-colors cursor-pointer`}
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Search the ethereal plane for lost souls...
            </p>
            <form onSubmit={handleAddFriendSubmit} className="relative">
              <div className="relative flex items-center">
                <input
                  ref={addFriendInputRef}
                  type="text"
                  placeholder="Enter a username to summon..."
                  className={`w-full pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border ${isDark ? 'bg-gray-800 text-purple-200 border-purple-900/50 placeholder-purple-400/50' : 'bg-gray-100 text-gray-900 border-purple-200 placeholder-purple-500/50'}`}
                />
                <SkullIcon className="absolute left-3 text-purple-500 h-5 w-5 animate-pulse pointer-events-none" />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className={`mr-2 px-4 py-2 rounded-md cursor-pointer ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
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

      <MessageInput />
    </div>;
};