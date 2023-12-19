import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye} from "react-icons/ai"
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { createUserWithEmailAndPassword, getAuth, 
  updateProfile } 
  from "firebase/auth";
import { db } from "../firebase";
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";

const houseImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

export default function SignUp () {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username : "",
    email: "",
    password: ""
  })
  const {username, email, password} = formData;
  const auth = getAuth();
  
  const onChange = (e) => {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.value
      }))
  }

  const onSubmit = async(e) => {
    e.preventDefault()
    try {
        // Query the 'users' collection to check if the username already exists
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(query(usersRef, where("username", "==", username)));

      if (!querySnapshot.empty) {
        // Username already exists
        toast.error("Username already exists. Please choose a different username.");
        return;
      }

      const userCrediential = await 
        createUserWithEmailAndPassword(auth, email, password)

        updateProfile(auth.currentUser, {
          displayName: username
        })
      const user = userCrediential.user
      const formDataCopy = {...formData}
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, "users", user.uid), formDataCopy)
      navigate("/")
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email already in use. Please use a different email.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email. Please enter a valid email address.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Weak password. Password should be at least 6 characters.");
      } else {
        toast.error("Something went wrong with the registration!");
      }
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign Up</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-4">
          <img src={houseImage}
            className="w-full rounded-xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
          <input 
              className="w-full px-4 py-2 text-xl text-gray-700
               border-gray-400 rounded transition ease-in-out mb-4" 
              type="text" id="username"
              value={username} 
              onChange={onChange}
              placeholder="Username"
              required
            />
            <input 
              className="w-full px-4 py-2 text-xl text-gray-700
               border-gray-400 rounded transition ease-in-out mb-4" 
              type="text" id="email"
              value={email} 
              onChange={onChange}
              placeholder="Email address"
              required
            />
            <div className="relative mb-2">
              <input 
                type={showPassword ? "text": "password"}
                className="w-full px-4 py-2 text-xl text-gray-700 border-gray-400 rounded transition ease-in-out" 
                id="password"
                value={password} 
                onChange={onChange}
                placeholder="Password"
              />
              {showPassword ? (
                <AiFillEyeInvisible className="absolute right-3 top-3 text-xl cursor-pointer" 
                  onClick={() => setShowPassword((prevState)=> !prevState)}
                />
              ) : (
                <AiFillEye className="absolute right-3 top-3 text-xl cursor-pointer"
                onClick={() => setShowPassword((prevState)=> !prevState)}
                />
              )}
            </div>
            <div className="flex justify-between whitespace-nowrap
              text-sm sm:text-lg">
              <p className="mb-10">
                Have an account?<Link className="text-red-500 hover:text-red-700 transition 
                duration-200 ease-in-out ml-1" to="/signin">Sign In</Link>
              </p>
              <p>
                <Link className="text-blue-600 hover:text-blue-800 transition 
                duration-200 ease-in-out" to="/forgot-password">Forgot password?</Link>
              </p>
            </div>
            <button className="w-full bg-red-600 text-white px-7 py-3 text-sm font-medium rounded shadow-md
            hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800" 
              type="submit">
              SIGN UP
            </button>
            <div className="flex items-center my-4 
              before:border-t before:flex-1 before:border-gray-300
              after:border-t after:flex-1 after:border-gray-300">
              <p className="text-center font-semibold mx-4">
                OR
              </p>
            </div>
            <OAuth/>
          </form>
        </div>
      </div>
    </section>
  )
}
