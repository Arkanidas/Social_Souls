import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import './index.css'

function Landing() {
  return (
    <>
   
      <div className="flex justify-center items-center flex-wrap mb-8">
        <div className="max-w-[60%] p-5">
          <h1 className="text-[65px] text-center text-white font-[Spooky] mt-7">
            Welcome to
            <span className="text-[#f06868] text-[65px] px-2">Social Souls</span>
          </h1>
          <p className="text-center font-[desc] text-[#d7dee5] text-[25px] ">
            A dreadfully engaging social platform
          </p>
        </div>
      </div>

      {/* Auth Container */}
      <div className="relative w-[400px] h-[500px] mx-auto rounded-[10px] overflow-hidden text-white border border-gray-950 shadow-lg transition-shadow mt-11"
  style={{
    boxShadow:"4px 4px 10px rgba(0, 0, 0, 0.8)"
  }}>
        <input type="checkbox" id="register_toggle" className="hidden peer" />

        <div className="w-[200%] h-full relative flex transition-transform duration-500 ease-out peer-checked:-translate-x-1/2">
          {/* Sign In */}
          <form className="w-1/2 flex flex-col justify-center items-center gap-12 p-5">
            <h2 className="text-4xl font-bold text-[#ffeedd] font-[spook1]">Sign In</h2>

            

            <div className="relative w-[250px]">
  <input
    type="text"
    id="username"
    required
    className="peer w-full text-white bg-transparent border-0 border-b-2 border-gray-400 placeholder-transparent focus:border-[#f34040] outline-none text-[17px]"
   
  />
  <label
    htmlFor="username"
    className="absolute left-0 bottom-1 text-[17px] text-gray-400 font-[ifont] transition-all duration-300 transform peer-placeholder-shown:translate-y-6 peer-placeholder-shown:text-[17px] peer-focus:translate-y-[-10px] peer-focus:text-[20px] peer-focus:text-[#f34040]"
  >
    Username
  </label>
  
  <FontAwesomeIcon icon={faUser} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400" />
</div>



            <div className="relative w-[250px]">
              <input
                type="password"
                required
                className="peer w-full text-white bg-transparent border-0 border-b-2 border-gray-400 placeholder-transparent focus:border-[#f34040] outline-none text-[17px]"
              />
              <label className="absolute left-0 bottom-1 text-[17px] text-gray-400 font-[ifont] transition-all duration-300 transform peer-placeholder-shown:translate-y-6 peer-placeholder-shown:text-[17px] peer-focus:translate-y-[-10px] peer-focus:text-[20px] peer-focus:text-[#f34040]">
                Password
              </label>
              <FontAwesomeIcon icon={faLock} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button className="w-[250px] h-[45px] bg-gradient-to-r from-[#e5e5e5] via-[#ff8c19] to-[#f34040] bg-[length:250%] bg-left rounded-[10px] relative text-[#ffd277] font-bold text-[16px] flex justify-center items-center transition-all duration-1000 hover:bg-right active:scale-95 overflow-hidden">
              <span className="absolute w-[97%] h-[90%] bg-[rgba(0,0,0,0.84)] text-[#ffc042] flex justify-center items-center rounded-[10px]">
                Login
              </span>
            </button>

            <span className="text-sm text-[#d5d4d4] font-[sawarabi]">
              Don't have an account?{" "}
              <label htmlFor="register_toggle" className="underline font-bold cursor-pointer">
                Sign Up
              </label>
            </span>
          </form>

          {/* Sign Up */}
          <form className="w-1/2 flex flex-col justify-center items-center gap-6 p-6">
            <h2 className="text-3xl font-bold text-[#ffeedd] font-[spook1]">Sign Up</h2>

            <div className="relative w-[250px]">
              <input
                type="text"
                required
                className="peer w-full text-white bg-transparent border-0 border-b-2 border-gray-400 placeholder-transparent focus:border-[#f34040] outline-none text-[17px]"
              />
              <label className="absolute left-0 bottom-1 text-[17px] text-gray-400 font-[ifont] transition-all duration-300 transform peer-placeholder-shown:translate-y-6 peer-placeholder-shown:text-[17px] peer-focus:translate-y-[-10px] peer-focus:text-[20px] peer-focus:text-[#f34040]">
                Email
              </label>
              <FontAwesomeIcon icon={faEnvelope} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative w-[250px]">
              <input
                type="text"
                required
                className="w-full border-0 border-b-2 border-gray-400 text-white bg-transparent placeholder-transparent focus:border-[#f34040] focus:font-bold outline-none text-[17px]"
                placeholder="Username"
              />
              <label className="absolute left-0 top-0 text-[17px] text-gray-400 font-[ifont] transition-all">
                Username
              </label>
              <FontAwesomeIcon icon={faUser} className="absolute right-0 top-2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative w-[250px]">
              <input
                type="password"
                required
                className="w-full border-0 border-b-2 border-gray-400 text-white bg-transparent placeholder-transparent focus:border-[#f34040] focus:font-bold outline-none text-[17px]"
                placeholder="Password"
              />
              <label className="absolute left-0 top-0 text-[17px] text-gray-400 font-[ifont] transition-all">
                Password
              </label>
              <FontAwesomeIcon icon={faLock} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button className="w-[250px] h-[45px] bg-gradient-to-r from-[#e5e5e5] via-[#ff8c19] to-[#f34040] bg-[length:250%] bg-left rounded-[10px] relative text-[#ffd277] font-bold text-[16px] flex justify-center items-center transition-all duration-1000 hover:bg-right active:scale-95 overflow-hidden">
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
