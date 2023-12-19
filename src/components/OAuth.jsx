import { FacebookAuthProvider, GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {FcGoogle} from "react-icons/fc"
import { toast } from "react-toastify";
import { db } from "../firebase";
import { useNavigate } from "react-router";
import { FaFacebook } from "react-icons/fa";
import 'react-phone-input-2/lib/style.css'


export default function OAuth() {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();

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
    </>
  )
}
