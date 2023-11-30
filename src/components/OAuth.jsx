import { FacebookAuthProvider, GoogleAuthProvider, RecaptchaVerifier, getAuth, signInWithPhoneNumber, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {FcGoogle} from "react-icons/fc"
import { toast } from "react-toastify";
import { db } from "../firebase";
import { useNavigate } from "react-router";
import { FaFacebook, FaPhoneAlt } from "react-icons/fa";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'
import { IoMdClose } from "react-icons/io";


export default function OAuth() {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();
//phone login
  const [showPhoneLoginModal, setShowPhoneLoginModal] = useState(false);
  const [phoneNumber, setPhoneNumber] =useState("");
  const [otp, setOtp] =useState("");
  const [error, setError] = useState("");
  const [flag, setFlag] = useState(false);
  const [confirmObj, setConfirmObj] = useState("");


  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try{
      const result = await signInWithPopup(auth, provider);
      const user = result.user
      //check for the user
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if(!docSnap.exists()){
        await setDoc(docRef, {
          username: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        })
      }
      navigate("/")
    }catch(error) {
      toast.error("Failed to authenticate with Google.")
    }

  }
  
  const handleFacebookLogin = async (e) => {
    e.preventDefault();
    try{
      const result = await signInWithPopup(auth, fbProvider);
      const user = result.user
      //check for the user
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if(!docSnap.exists()){
        await setDoc(docRef, {
          username: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        })
      }
      navigate("/")
    }catch(error) {
      toast.error("Failed to authenticate with Facebook.")
    }
}

  const handleShowPhoneLogin = () => setShowPhoneLoginModal(true);
  const setUpRecaptha = (phoneNumber) => {
    const recaptchaVerifier = new RecaptchaVerifier(
        auth, 'recaptcha-container', {}
    );
    recaptchaVerifier.render();
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  }
  const getOtp = async (e) => {
    e.preventDefault();
    setError("")
    if(phoneNumber === "" || phoneNumber === undefined)
        return setError("Please enter a valid Phone Number.");
    try {
      const response = await setUpRecaptha(phoneNumber);
      console.log(response);
      setConfirmObj(response);
      setFlag(true);
    } catch (err) {
      setError(err.message)
    }
    console.log(phoneNumber);
  }

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp === "" || otp === null) return;
    try {
      setError("");
      const result = await confirmObj.confirm(otp);
      const user = result.user

      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if(!docSnap.exists()){
        await setDoc(docRef, {
          displayName: phoneNumber,
          phoneNumber: user.phoneNumber,
          timestamp: serverTimestamp(),
        })
      }
      navigate("/profile");
    } catch (err) {
      setError(err.message)
    }
  }


  return (
    <>
    <button type="button"
      onClick={handleGoogleLogin} 
      className="flex items-center justify-center w-full border border-black 
        px-7 py-3 text-sm font-medium hover:bg-black hover:text-white rounded-3xl
        active:bg-gray-800 shadow-md hover:shadow-lg transition duration-150 ease-in-out mb-3"
    >
      <FcGoogle className="text-2xl mr-2"/>
        Continue with Google
    </button>

    <button type="button"
      onClick={handleFacebookLogin} 
      className="flex items-center justify-center w-full border border-black mb-3
        px-7 py-3 text-sm font-medium hover:bg-black hover:text-blue-600 rounded-3xl
        active:bg-gray-800 shadow-md hover:shadow-lg transition duration-150 ease-in-out"
      >
      <FaFacebook className="text-2xl mr-2 text-blue-700"/>
        Continue with Facebook
    </button>

    <button type="button"
      onClick={handleShowPhoneLogin} 
      className="flex items-center justify-center w-full border border-black 
        px-7 py-3 text-sm font-medium hover:bg-black hover:text-white rounded-3xl
        active:bg-gray-800 shadow-md hover:shadow-lg transition duration-150 ease-in-out"
      >
      <FaPhoneAlt className="text-2xl mr-2"/>
        Continue with Phone
    </button>

    {showPhoneLoginModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold">Phone Login</h3>
              <button onClick={() => setShowPhoneLoginModal(false)} className="p-1.5 text-gray-500 hover:text-gray-700">
                <IoMdClose />
              </button>
            </div>
            <div className="p-6">
              <form>
                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                  <PhoneInput
                    defaultCountry={"my"}
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(phoneNumber) => setPhoneNumber("+" + phoneNumber)}
                    className="border rounded w-full"
                  />
                </div>
                <div id="recaptcha-container" className="mb-4"></div>
                <button type="button" onClick={getOtp} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Send OTP
                </button>
                <div className={`${flag ? 'block' : 'hidden'} mt-4`}>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Verify OTP</label>
                  <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="border rounded px-3 py-2 w-full" />
                  <button type="button" onClick={verifyOtp} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
                    Verify
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>)}

    </>
    
    
  )
}
