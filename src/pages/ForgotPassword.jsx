import { useState } from "react";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import { toast } from "react-toastify";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const houseImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

export default function ForgotPassword () {
  const [email, setEmail] = useState("");
  const auth = getAuth();

  const onChange = (e) => {
      setEmail(e.target.value);
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error("Failed to send password reset email. Please try again.")
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Forgot Password</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img src={houseImage}
            className="w-full rounded-xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={handlePasswordReset}>
            <input 
              className="w-full px-4 py-2 text-xl text-gray-700
               border-gray-400 rounded transition ease-in-out mb-6" 
              type="text" id="email"
              value={email} 
              onChange={onChange}
              placeholder="Email address"
            />
            
            <div className="flex justify-between whitespace-nowrap
              text-sm sm:text-lg">
              <p className="mb-10">
                Don&apos;t have an account?<Link className="text-red-500 hover:text-red-700 transition 
                duration-200 ease-in-out ml-1" to="/signup">Register</Link>
              </p>
              <p>
                <Link className="text-blue-600 hover:text-blue-800 transition 
                duration-200 ease-in-out" to="/signin">Sign In</Link>
              </p>
            </div>
            <button 
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium rounded shadow-md
             hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800" 
              type="submit">
              Send reset password
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
