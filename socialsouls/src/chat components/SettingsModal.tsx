import { useState, useEffect } from 'react'
import { X, Upload, UserIcon, FileTextIcon, GhostIcon } from 'lucide-react'
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { useTheme } from '../chat components/ThemeContext'
import { auth, db } from '../firebase/firebaseConfig'
import { doc, updateDoc } from "firebase/firestore"
import {toast} from 'react-hot-toast';
import ghost from "../assets/ghosts.png"

interface SettingsPopupProps {
  isOpen: boolean
  onClose: () => void
  UserName: string
  Bio:string
  profilepic: string;
  onProfileUpdated?: () => void
  
}
export const SettingsPopup = ({ isOpen, onClose, UserName, Bio, onProfileUpdated, profilepic }: SettingsPopupProps) => {

  const InputFieldChar = 130;

  const { isDark } = useTheme()
  const [username, setUsername] = useState(UserName)
  const [bio, setBio] = useState(Bio)
  const [profilePicture, setProfilePicture] = useState(ghost)
  const [isSaving, setIsSaving] = useState(false)


useEffect(() => {

if(isOpen) {
  setUsername(UserName)
  setBio(Bio)
  setProfilePicture(profilepic) 
}

},[UserName, isOpen, Bio])

 if (!isOpen) return null

 const SaveData = async () => {

    try {
      setIsSaving(true)
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user found")

      const userRef = doc(db, "users", user.uid)
      let photoURL = profilePicture;

        if (profilePicture.startsWith("data:image")) {
      const storage = getStorage();
      const fileRef = ref(storage, `profilePics/${user.uid}.jpg`);
      await uploadString(fileRef, profilePicture, "data_url");
      photoURL = await getDownloadURL(fileRef);
     
    }
      await updateDoc(userRef, {
        username: username,
        bio: bio,
        profilePic: photoURL
      })

      onProfileUpdated?.(); 
       toast.success("Your spectral soul has been successfully updated 👻", {
      duration: 4000,
    });
      console.log("Profile updated successfully ✅")
      onClose() 
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update your spectral soul, Please try again later!💀");
    } finally {
      setIsSaving(false)
   
      
    }
  }


  return (

    
    <div className='fixed inset-0 flex items-center justify-center z-50 overflow-y-hidden'>

 
     
      {/* Settings popup */}
      <div
        className="relative w-full h-full max-w-md bg-gray-900 border-none text-gray-200 border-2 rounded-lg shadow-2xl overflow-hidden z-10 animate-ghost-appear"
        onClick={(e) => e.stopPropagation()}
      >
      
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <GhostIcon className="w-full h-full text-purple-500" />
        </div>
       
        <div
          className="p-6 border-b border-purple-900/30"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-serif">
              <span className="text-purple-500">Spectral</span> Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-purple-500 transition-colors z-10 cursor-pointer">
              <X className="h-6 w-6 hover:text-purple-500 hover:drop-shadow-[0_0_1px_rgba(168,85,247,0.8)] transition duration-300 focus:text-gray-500 " />
            </button>
          </div>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Modify your ghostly presence...
          </p>
        </div>
        {/* Settings form */}
        <div className="p-6 space-y-20">

          {/* Profile picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div
                className="w-34 h-34 rounded-full relative top-5 overflow-hidden border-2 border-purple-500"
              >
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label
                htmlFor="profile-upload"
                className="absolute top-25 left-25 p-2 rounded-full cursor-pointer bg-gray-800 text-purple-400 hover:bg-gray-700 border border-purple-900/30"
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
            <p className="text-s text-purple-500 mt-7">Change your Soul projection</p>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="flex items-center gap-2 text-sm font-medium relative bottom-7 text-gray-300">
              <UserIcon className="h-4 w-4 text-purple-500" />
              Soul Name
            </label>
            <input
              id="username"
              type="text"
              maxLength={15}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-md duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 border relative bottom-5 bg-gray-800 text-gray-300 border-gray-700"
              placeholder="Enter your spectral name"
            />
          </div>
          {/* Bio */}
          <div className="flex flex-col gap-2 relative bottom-15">
            <label
              htmlFor="bio"
              className="flex items-center gap-2 text-sm font-medium text-gray-300"
            >
              <FileTextIcon className="h-4 w-4 text-purple-500" />
             Soul Description
            </label>
            <textarea
              id="bio"
              value={bio}
              maxLength={130}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 h-30 resize-none rounded-md focus:outline-none duration-200 focus:ring-2 focus:ring-purple-500 border bg-gray-800 text-gray-300 border-gray-700"
              placeholder="Describe your spectral essence..."
            />
             <span className="absolute bottom-1 right-2 text-xs text-gray-400">
              {InputFieldChar - bio.length}
             </span>
          </div>
        </div>

  
        
        {/* Footer */}
        <div className="p-6 border-purple-900/30 flex justify-center gap-5 mt-8">
          <button onClick={onClose} className="px-4 py-2 rounded-md font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700 mr-2 cursor-pointer">
            Cancel
          </button>
          <button onClick={SaveData} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50" disabled={isSaving}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
