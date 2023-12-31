import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye} from "react-icons/ai"
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { toast } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const houseImage = "https://firebasestorage.googleapis.com/v0/b/realestate-6d2e3.appspot.com/o/property-mans.avif?alt=media&token=b1829b56-c6c7-4de5-9b40-e06e9df0e13d"

export default function SignIn () {
  const [showPassword, setShowPassword] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const {email, password} = formData;

  const onChange = (e) => {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.value
      }))
  }

  const onSubmit = async(e) => {
    e.preventDefault()
    try {
      const userCrediential = await signInWithEmailAndPassword(
        auth, email, password
      );
      if (userCrediential.user) {
        navigate("/");
      }
    } catch (error) {
      toast.error("Sign In failed. Please try again.")
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign In</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img src={houseImage}
            className="w-full rounded-xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input 
              className="w-full px-4 py-2 text-xl text-gray-700
               border-gray-400 rounded transition ease-in-out mb-6" 
              type="text" id="email"
              value={email} 
              onChange={onChange}
              placeholder="Email address"
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
                Don&apos;t have an account?<Link className="text-red-500 hover:text-red-700 transition 
                duration-200 ease-in-out ml-1" to="/signup">Register</Link>
              </p>
              <p>
                <Link className="text-blue-600 hover:text-blue-800 transition 
                duration-200 ease-in-out" to="/forgot-password">Forgot password?</Link>
              </p>
            </div>
            <button className="w-full bg-red-600 text-white px-7 py-3 text-sm font-medium rounded shadow-md
            hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800" 
              type="submit">
              SIGN IN
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
