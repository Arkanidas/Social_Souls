import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { faLock, faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc,setDoc, getDoc,where, getDocs, collection, query } from "firebase/firestore";
import { auth, db} from './firebase/firebaseConfig'; // auth: connects app to firebase auth service, db: handles storing and app data in cloud lets your app read, write, update, and delete data in your Firestore database.
import { useNavigate } from 'react-router-dom';
import {Toaster, toast} from 'react-hot-toast';
import { Eye, EyeClosed, Copyright } from 'lucide-react';
import { sendPasswordResetEmail } from "firebase/auth";

import './index.css'

function Landing() {

const [allowRedirect, setAllowRedirect] = useState(true);

  const navigate = useNavigate();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) =>  {

    if (user && allowRedirect) {
 

       navigate('/chat');
  } else {
       toast.error("Please check your inbox to verify your email before entering the spirit realm");
  }

    });

    return () => unsubscribe(); 

    
  }, [navigate, allowRedirect]);
  
 

const [username, setUsername] = useState<string>('');
const [email, setEmail] = useState<string>('');
const [password, setPassword] = useState<string>('');
const [ErrorMessage, setErrorMessage] = useState('');
const [showPassword, setShowPassword] = useState<boolean>(false);


const capitalizeUsername = (name: string) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};


const HandleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setAllowRedirect(false);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const formattedUsername = capitalizeUsername(username.trim());

    const q = query(
    collection(db, "users"),
    where("username", "==", formattedUsername)
);

    const snapshot = await getDocs(q);

if (!snapshot.empty) {
  toast.error("That username already exists sadly, Choose another one!");
  return;
}

 await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: formattedUsername,
      createdAt: new Date()

    });

    toast.success("Your Soul was created successfully! Please sign in.", {
      duration: 4000,
    });

    setUsername("");
    setEmail("");
    setPassword("");

  } catch (error) {
    console.error("❌ Sign-up failed:", ErrorMessage);
    toast.error("Please enter a valid email, password and username", {
    duration: 6000, 
});
     
  }
};

const handlePasswordReset = async (email: string) => {
  if (!email) {
    alert("Please enter your email first. So we know it's you");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("A password reset link has been sent to your email. Psst check your spam folder if you don't see it!");
  } catch (error: any) {
    console.error(error);

    if (error.code === "auth/user-not-found") {
      alert("No account found with this email.");
    } else if (error.code === "auth/invalid-email") {
      alert("Invalid email address.");
    } else {
      alert("Something went wrong. Try again.");
    }
  }
};


const HandleLogin = async (e:React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); 
    setAllowRedirect(true); 

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch the user's data from Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log("Username:", userData.username);

    } else {
      console.log("No user document found!");
    }

  } catch (error:any) {
    console.error("Login failed:", error);
    setErrorMessage("Login failed. Please check your email and password.");
    toast.error("Password or email is incorrect, please try again", {
    duration: 4000, 
});
  }
};


const togglePassword = () => {
  setShowPassword(prev => !prev);
};

  return (
    <>

  <Toaster position="top-center" reverseOrder={false}/>

      <div className="flex justify-center items-center flex-wrap mb-8">
        <div className="max-w-[90%] p-5">
          <h1 className="text-[clamp(2.1rem,calc(1.5rem+3vw),5rem)] text-center text-white font-[Spooky] mt-7 ">
            Welcome to
            <span className="text-[#f06868] text-[clamp(2.1rem,calc(1.5rem+3vw),5rem)] px-2">Social Souls</span>
          </h1>
          <p className="text-center font-[desc] text-[#d7dee5] text-[clamp(1.1rem,calc(0.8rem+1.5vw),1.7rem)] ">
            A dreadfully engaging social platform
          </p>
        </div>
      </div>

      {/* Auth Container */}
      <div className="relative w-[400px] h-[500px] mx-auto rounded-[10px] overflow-hidden text-white border border-gray-950 shadow-lg transition-shadow mt-6"
  style={{
    boxShadow:"4px 4px 10px rgba(0, 0, 0, 0.8)"
  }}>
        <input type="checkbox" id="register_toggle" className="hidden peer" />
        <div className="w-[200%] h-full relative flex transition-transform duration-500 ease-out peer-checked:-translate-x-1/2">




          {/* Sign In */}
  <form className="w-1/2 flex flex-col justify-center items-center gap-12 mt-4" onSubmit={HandleLogin}>
  <h2 className="text-4xl font-bold text-[#ffeedd] font-[spook1] relative bottom-2">Sign In</h2>

  <div className="relative w-[250px]">
  <input
    type="email"
    id="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="peer w-full border-0 border-b-2 border-gray-400 text-white bg-transparent placeholder-transparent focus:border-[#FF8C19] outline-none text-[17px]"
    placeholder=""
  />
  <label
    htmlFor="email"
    className="
    absolute left-0 bottom-1 text-[17px] font-[ifont] text-gray-400
    transition-all duration-200 transform
    peer-not-placeholder-shown:-translate-y-5
    peer-not-placeholder-shown:text-[21px]
    peer-not-placeholder-shown:text-gray-400
    peer-focus:translate-y-[-20px]
    peer-focus:text-[21px]
    peer-focus:text-[#FF8C19]
    peer-valid:translate-y-[-20px]
    peer-valid:text-[21px]
    peer-valid:text-gray-400
    cursor-text">
    Email
  </label>
  <FontAwesomeIcon icon={faEnvelope} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400 text-lg" />
</div>

<div className="relative w-[250px]">
  <input
  type={showPassword ? "text" : "password"}
  id="password"
  value={password}
  required
  placeholder="Password"
  onChange={(e) => setPassword(e.target.value)}
  className="peer w-full text-white bg-transparent border-0 border-b-2 border-gray-400 placeholder-transparent focus:border-[#FF8C19] outline-none text-[17px]"
   />
   <label 
 className="
 absolute left-0 bottom-1 text-[17px] font-[ifont] text-gray-400
 transition-all duration-200 transform
 peer-placeholder-shown:text-[17px]
 peer-focus:translate-y-[-20px]
 peer-focus:text-[22px]
 peer-focus:text-[#FF8C19]
 peer-valid:translate-y-[-20px]
 peer-valid:text-[22px]
 peer-valid:text-gray-400
 cursor-text"     
 htmlFor="password">
    Password
              </label>
              {password.length === 0 ? (
              <FontAwesomeIcon icon={faLock} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400 text-lg"/>) 
              : showPassword ? (
              <Eye className="absolute bottom-5 right-0 translate-y-1/2 text-gray-400 text-lg cursor-pointer" onClick={togglePassword}/>) 
              : (
              <EyeClosed className="absolute bottom-5 right-0 translate-y-1/2 text-gray-400 text-lg cursor-pointer" onClick={togglePassword}/>)}
            </div>

            <button onClick={HandleLogin} type="submit" className="w-[250px] cursor-pointer h-[45px] bg-gradient-to-r from-[#e5e5e5] via-[#ff8c19] to-[#f34040] bg-[length:300%] bg-left rounded-[10px] relative text-[#ffd277] font-bold text-[16px] flex justify-center items-center transition-all duration-1200 hover:bg-right active:scale-95 active:duration-50 overflow-hidden">
              <span className="absolute w-[97%] h-[90%] bg-[rgba(0,0,0,0.84)] text-[#ffc042] flex justify-center items-center rounded-[10px]">
                Login
              </span>
            </button>

            <span className="text-sm text-[#d5d4d4] font-[sawarabi] mt-[-25px]">
              Don't have an account?{" "}
              <label htmlFor="register_toggle" className="underline font-bold cursor-pointer">
                Sign Up
              </label>
            </span>

             <span className="text-xs text-gray-400 font-[sawarabi] relative top-5 italic">
              Forgot your Soul Password? {" "}
              <label onClick={() => handlePasswordReset(email)} className="underline font-bold cursor-pointer">
                Reset password
              </label>
            </span>
          </form>



  
          {/* Sign Up */}
          <form className="w-1/2 flex flex-col justify-center items-center gap-10 p-6">
            <h2 className="text-4xl font-bold text-[#ffeedd] font-[spook1]">Sign Up</h2>

            <div className="relative w-[250px]">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="peer w-full border-0 border-b-2 border-gray-400 text-white bg-transparent placeholder-transparent focus:border-[#FF8C19] outline-none text-[17px]"
              />
              <label
              htmlFor="email"
    className="
    absolute left-0 bottom-1 text-[17px] font-[ifont] text-gray-400
    transition-all duration-200 transform
    peer-not-placeholder-shown:-translate-y-5
    peer-not-placeholder-shown:text-[21px]
    peer-not-placeholder-shown:text-gray-400
    peer-focus:translate-y-[-20px]
    peer-focus:text-[21px]
    peer-focus:text-[#FF8C19]
    peer-valid:translate-y-[-20px]
    peer-valid:text-[21px]
    peer-valid:text-gray-400
    cursor-text">
                Email
              </label>
              <FontAwesomeIcon icon={faEnvelope} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>

            <div className="relative w-[250px]">
              <input
                type="text"
                id="username"
                maxLength={15}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="peer w-full border-0 border-b-2 border-gray-400 text-white bg-transparent placeholder-transparent focus:border-[#FF8C19] focus:font-bold outline-none text-[17px]"
                placeholder="username"
              />
              <label htmlFor="username"
    className="
    absolute left-0 bottom-1 text-[17px] font-[ifont] text-gray-400
    transition-all duration-200 transform
    peer-placeholder-shown:text-[17px]
    peer-focus:translate-y-[-20px]
    peer-focus:text-[21px]
    peer-focus:text-[#FF8C19]
    peer-valid:translate-y-[-20px]
    peer-valid:text-[21px]
    peer-valid:text-gray-400
    cursor-text">
                Username
              </label>
              <FontAwesomeIcon icon={faUser} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>

            <div className="relative w-[250px]">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="peer w-full border-0 border-b-2 border-gray-400 text-white bg-transparent placeholder-transparent focus:border-[#FF8C19] focus:font-bold outline-none text-[17px]"
                placeholder="Password"
              />
              <label className="
 absolute left-0 bottom-1 text-[17px] font-[ifont] text-gray-400
 transition-all duration-200 transform
 peer-placeholder-shown:text-[17px]
 peer-focus:translate-y-[-20px]
 peer-focus:text-[21px]
 peer-focus:text-[#FF8C19]
 peer-valid:translate-y-[-20px]
 peer-valid:text-[21px]
 peer-valid:text-gray-400
 cursor-text"     
 htmlFor="password">
                Password
              </label>
              

             {password.length === 0 ? (
              <FontAwesomeIcon icon={faLock} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400 text-lg"/>) 
              : showPassword ? (
              <Eye className="absolute bottom-5 right-0 translate-y-1/2 text-gray-400 text-lg cursor-pointer" onClick={togglePassword}/>) 
              : (
              <EyeClosed className="absolute bottom-5 right-0 translate-y-1/2 text-gray-400 text-lg cursor-pointer" onClick={togglePassword}/>)}
            </div>

            <button onClick={HandleSignup} className="w-[250px] h-[45px] bg-gradient-to-r from-[#e5e5e5] via-[#ff8c19] to-[#f34040] bg-[length:350%] bg-left rounded-[10px] relative text-[#ffd277] font-bold text-[16px] flex justify-center items-center transition-all duration-1200 hover:bg-right active:scale-95 overflow-hidden cursor-pointer active:duration-50">
              <span className="absolute w-[97%] h-[90%] bg-[rgba(0,0,0,0.84)] text-[#ffc042] flex justify-center items-center rounded-[10px] ">
                Register
              </span>
            </button>

            <span className="text-sm text-[#d5d4d4] font-[sawarabi] relative bottom-4">
              Already have an account?{" "}
              <label htmlFor="register_toggle" className="underline font-bold cursor-pointer">
                Sign In
              </label>
            </span>
          </form>
        </div>
      </div>
      <footer className="w-full bg-gray-black py-3 absolute bottom-0 ">
       <div className="flex justify-center items-center gap-1 text-gray-400 text-xs font-[desc]">
        <span><Copyright size={15}/></span>
        <span className="text-[#f06868] font-semibold tracking-wide text-xs">CodeXynapse</span>
        <span>{new Date().getFullYear()}</span>
       </div>
     </footer>
    </>
  );
}

export default Landing;
