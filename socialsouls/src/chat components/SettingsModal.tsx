import { useState, useEffect } from 'react'
import { X, Upload, UserIcon, FileTextIcon, GhostIcon } from 'lucide-react'
import { useTheme } from '../chat components/ThemeContext'
import { auth, db } from '../firebase/firebaseConfig'
import { doc, updateDoc } from "firebase/firestore"
import {Toaster, toast} from 'react-hot-toast';

interface SettingsPopupProps {
  isOpen: boolean
  onClose: () => void
  UserName: string
  Bio:string
  profilepic: string;
  onProfileUpdated?: () => void
  
}
export const SettingsPopup = ({ isOpen, onClose, UserName, Bio, onProfileUpdated }: SettingsPopupProps) => {



  const { isDark } = useTheme()
  const [username, setUsername] = useState(UserName)
  const [bio, setBio] = useState(Bio)
  const [profilePicture, setProfilePicture] = useState('https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=800&auto=format&fit=crop',)
  const [isSaving, setIsSaving] = useState(false)


useEffect(() => {

if(isOpen) {
  setUsername(UserName)
  setBio(Bio)
}

},[UserName, isOpen])

 if (!isOpen) return null

 const SaveData = async () => {

    try {
      setIsSaving(true)
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user found")

      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        username: username,
        bio: bio,
        // you can also save profilePicture if you want:
        // profilePic: profilePicture
      })
      onProfileUpdated?.(); 
       toast.success("Your soul has been successfully updated 👻", {
      duration: 4000,
    });
      console.log("Profile updated successfully ✅")
      onClose() // Close modal after saving
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
   
      
    }
  }


  return (

    
    <div className='fixed inset-0 flex items-center justify-center z-50 overflow-y-hidden'>

 
     
      {/* Settings popup */}
      <div
        className={`relative w-full h-full max-w-md ${isDark ? 'bg-gray-900 border-none text-gray-200' : 'bg-gray-100 border-purple-300/50 text-gray-800'} border-2 rounded-lg shadow-2xl overflow-hidden z-10 animate-ghost-appear`}
        onClick={(e) => e.stopPropagation()}
      >
      
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <GhostIcon className="w-full h-full text-purple-500" />
        </div>
       
        <div
          className={`p-6 border-b ${isDark ? 'border-purple-900/30' : 'border-purple-200'}`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-serif">
              <span className="text-purple-500">Spectral</span> Settings
            </h2>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500 transition-colors z-10 cursor-pointer`}>
              <X className="h-6 w-6 hover:text-purple-500 hover:drop-shadow-[0_0_1px_rgba(168,85,247,0.8)] transition duration-300 focus:text-gray-500 " />
            </button>
          </div>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Modify your ethereal presence...
          </p>
        </div>
        {/* Settings form */}
        <div className="p-6 space-y-20">

          {/* Profile picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div
                className={`w-34 h-34 rounded-full relative top-5 overflow-hidden border-2 ${isDark ? 'border-purple-500' : 'border-purple-400'}`}
              >
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label
                htmlFor="profile-upload"
                className={`absolute top-25 left-25 p-2 rounded-full cursor-pointer ${isDark ? 'bg-gray-800 text-purple-400 hover:bg-gray-700' : 'bg-white text-purple-500 hover:bg-gray-100'} border ${isDark ? 'border-purple-900/30' : 'border-gray-200'}`}
              >
                <Upload className="h-6 w-6" />
                <input
                  id="profile-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0]
                      const reader = new FileReader()
                      reader.onload = () => {
                        setProfilePicture(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-s text-purple-500 mt-7">Change your spectral soul</p>
          </div>
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className={`flex items-center gap-2 text-sm font-medium relative bottom-7 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <UserIcon className="h-4 w-4 text-purple-500" />
              Spirit Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border relative bottom-5 ${isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
              placeholder="Enter your spectral name"
            />
          </div>
          {/* Bio */}
          <div className="flex flex-col gap-2 relative bottom-15">
            <label
              htmlFor="bio"
              className={`flex items-center gap-2 text-sm font-medium  ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              <FileTextIcon className="h-4 w-4 text-purple-500" />
              Ethereal Description
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 h-24 resize-none rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border ${isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
              placeholder="Describe your spectral essence..."
            />
          </div>
        </div>
        {/* Footer */}

        <div
          className={`p-6 ${isDark ? 'border-purple-900/30' : 'border-purple-200'} flex justify-center gap-5 mt-8`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} mr-2`}
          >
            Cancel
          </button>
          <button
            onClick={SaveData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
