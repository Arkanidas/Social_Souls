import React, { useEffect, useState, useRef } from 'react'
import { MessageInput } from './MessageInput';
import { useTheme } from './ThemeContext';
import { XIcon, SkullIcon } from 'lucide-react'


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
  // Focus the add friend input when it appears
  useEffect(() => {
    if (showAddFriend && addFriendInputRef.current) {
      setTimeout(() => {
        addFriendInputRef.current?.focus()
      }, 300) // Wait for animation to start
    }
  }, [showAddFriend])

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = addFriendInputRef.current
    if (input && input.value.trim()) {
      console.log(`Searching for user: ${input.value}`)
      // Here you would typically make an API call to search for users
      // For demo purposes, just log and clear the input
      input.value = ''
      setShowAddFriend(false)
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
                className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-red-500 transition-colors`}
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
                  className={`mr-2 px-4 py-2 rounded-md ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                >
                  Summon
                </button>
              </div>
            </form>
            {/* Floating orbs for decoration */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`absolute floating-orb ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/20'}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  width: `${Math.random() * 30 + 10}px`,
                  height: `${Math.random() * 30 + 10}px`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}





      <MessageInput />
    </div>;
};