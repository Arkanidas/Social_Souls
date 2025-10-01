import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { faLock, faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc,setDoc, getDoc } from "firebase/firestore";
import { auth, db} from './firebase/firebaseConfig'; // auth: connects app to firebase auth service, db: handles storing and app data in cloud lets your app read, write, update, and delete data in your Firestore database.
import './index.css'
import { useNavigate } from 'react-router-dom';
import {Toaster, toast} from 'react-hot-toast';


function Landing() {

  const navigate = useNavigate();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {

      if (user) {
        navigate('/chat'); 
        console.log("👤 User is logged in:", user.email);
      }
    });

    return () => unsubscribe(); 

    
  }, [navigate]);
  
 

const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [ErrorMessage, setErrorMessage] = useState('');


const HandleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

 await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: username,
      createdAt: new Date()

    });
    console.log( user + " signed up!");
  } catch (error) {
    console.error("❌ Sign-up failed:", ErrorMessage);
    toast.error("Please enter a valid email, password and username", {
    duration: 6000, 
});
     
  }
};

const HandleLogin = async (e:React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); 

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch the user's data from Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log("👤 Username:", userData.username);

      
    } else {
      console.log("No user document found!");
    }

  } catch (error:any) {
    console.error("❌ Login failed:", error);
    setErrorMessage("Login failed. Please check your email and password.");
    toast.error("Password or email is incorrect, please try again", {
    duration: 6000, 
});
  }
};

  return (
    <>
   <div><Toaster   
  position="bottom-center"
  reverseOrder={false}
  />
  </div>

      <div className="flex justify-center items-center flex-wrap mb-8">
        <div className="max-w-[60%] p-5">
          <h1 className="text-[65px] text-center text-white font-[Spooky] mt-7 text-clamp-header">
            Welcome to
            <span className="text-[#f06868] text-[65px] px-2 text-clamp-header">Social Souls</span>
          </h1>
          <p className="text-center font-[desc] text-[#d7dee5] text-[25px] ">
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
  <form className="w-1/2 flex flex-col justify-center items-center gap-12" onSubmit={HandleLogin}>
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
  type="password"
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
 htmlFor="password"
   >
    Password
              </label>
              <FontAwesomeIcon icon={faLock} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400 text-lg"/>
            </div>

            <button onClick={HandleLogin} type="submit" className="w-[250px] h-[45px] bg-gradient-to-r from-[#e5e5e5] via-[#ff8c19] to-[#f34040] bg-[length:250%] bg-left rounded-[10px] relative text-[#ffd277] font-bold text-[16px] flex justify-center items-center transition-all duration-1000 hover:bg-right active:scale-95 overflow-hidden">
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
                type="password"
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
              <FontAwesomeIcon icon={faLock} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>

            <button onClick={HandleSignup} className="w-[250px] h-[45px] bg-gradient-to-r from-[#e5e5e5] via-[#ff8c19] to-[#f34040] bg-[length:250%] bg-left rounded-[10px] relative text-[#ffd277] font-bold text-[16px] flex justify-center items-center transition-all duration-1000 hover:bg-right active:scale-95 overflow-hidden">
              <span className="absolute w-[97%] h-[90%] bg-[rgba(0,0,0,0.84)] text-[#ffc042] flex justify-center items-center rounded-[10px]">
                Register
              </span>
            </button>

            <span className="text-sm text-[#d5d4d4] font-[sawarabi]">
              Already have an account?{" "}
              <label htmlFor="register_toggle" className="underline font-bold cursor-pointer">
                Sign In
              </label>
            </span>

            
          </form>
        </div>
      </div>
    </>
  );
}

export default Landing;
