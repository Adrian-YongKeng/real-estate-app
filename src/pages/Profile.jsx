import { getAuth, updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react"
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { FcHome } from "react-icons/fc";
import { Link } from "react-router-dom";


export default function Profile () {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] =useState(false)

  const [formData, setFormData] =useState({
    username: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })
  const {username, email} = formData

  const handleSignOut = () => {
    auth.signOut();
    navigate("/");
  };
//enable to edit
  const edit = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const submitChanges = async() => {
    try {
      if(auth.currentUser.displayName !== username){
        //update displayName in firebase Auth
        await updateProfile(auth.currentUser, {
          displayName: username,
        });
      //update username to firestore
                              //collection
        const docRef = doc(db, "users", auth.currentUser.uid)
        await updateDoc(docRef, {
          username: username
        })
      }
      toast.success("Profile details updated successfully!")
    } catch (error) {
      toast.error("Failed to update the profile details.")
    }
  }

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 font-bold">
          My Profile
        </h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            <input type="text" 
              id="username" 
              value={username} 
              disabled={!changeDetail}
              onChange={edit}
              className={`w-full px-4 py-2 text-xl text-gray-700 border border-gray-400 
              rounded transition ease-in-out mb-6 ${
                changeDetail && "bg-red-300 focus:bg-red-300"
              }`}
            />

            <input type="email" id="email" value={email} disabled 
              className="w-full px-4 py-2 text-xl text-gray-700 border 
              border-gray-400 rounded transition ease-in-out mb-6"
            />

            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p 
                onClick={() => {
                  changeDetail && submitChanges();
                  setChangeDetail((prevState) => !prevState);
                }}
                className="text-red-500 hover:text-red-700 transition ease-in-out duration-200 cursor-pointer"
              >
                {changeDetail ? "Apply change" : "Edit Username"}
              </p>
              <p onClick={handleSignOut}
                className="text-blue-500 hover:text-blue-800 transition ease-in-out duration-200 cursor-pointer">
                Sign Out</p>
            </div>
          </form>
          <button type="submit" 
            className="w-full bg-red-600 text-white px-7 py-3 text-sm 
            font-medium rounded-3xl shadow-md hover:bg-red-700 transition duration-150
            ease-in-out hover:shadow-lg active:bg-red-800"
          >
            <Link to="/createListing" className="flex justify-center items-center">
              <FcHome className="mr-3 text-3xl bg-red-200 rounded-full border-2"/>
              Sell or Rent your property
            </Link>
          </button>
        </div>
      </section>
    </>
  )
}
