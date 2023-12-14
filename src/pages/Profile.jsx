import { getAuth, updateProfile } from "firebase/auth"
import {  deleteDoc, doc, updateDoc} from "firebase/firestore";
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { FcHome } from "react-icons/fc";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearListings, deleteListing, fetchListings } from "../features/listings/listingsSlice";
import { AuthContext } from "../components/AuthProvider";
import ListingItem from "../components/ListingItem";


export default function Profile () {
  const auth = getAuth();
  const {currentUser} = useContext(AuthContext)
  const dispatch = useDispatch();
  const listings = useSelector(state => state.listings.listings)
  const [loading , setLoading] = useState(true);
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] =useState(false)

  const [formData, setFormData] =useState({
    username: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })
  const {username, email} = formData

  const handleSignOut = () => {
    dispatch(clearListings());
    auth.signOut();
    navigate("/");
  };

//enable to edit username
  const edit = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const submitChanges = async() => {
    try {   //update displayName in firebase Auth
      if(auth.currentUser.displayName !== username){
        await updateProfile(auth.currentUser, {
          displayName: username,
        });
      //update username to firestore
                              //collection
        const docRef = doc(db, "users", auth.currentUser.uid)
        await updateDoc(docRef, {
          username: username})
      }
      toast.success("Profile details updated successfully!")
    } catch (error) {
      toast.error("Failed to update the profile details.")
    }
  }
  
  useEffect(() => {
    if (currentUser.uid) {
      dispatch(fetchListings(currentUser.uid))
        .unwrap()
        .then(() => {
          setLoading(false); 
        })
      .catch((error) => {
        console.error("Error while fetching listings: ", error);
        setLoading(false); 
      });
    }
  }, [dispatch, currentUser.uid]);

  const onDelete = async(firestore_doc_id) => {
    if(window.confirm("Are you sure you want to delete?")){
      try { 
        //delete from firestore
        const docRef = doc(db, "listings", firestore_doc_id);
        await deleteDoc(docRef);
        //delete from redux sql database
        await dispatch(deleteListing(firestore_doc_id)).unwrap();
        //refetch
        dispatch(fetchListings(currentUser.uid))
        toast.success("Listing deleted successfully");
      }catch (error) {
        console.error("Error while deleting listing: ", error);
        toast.error("Failed to delete the listing");
      }
    }
  };

  const onEdit = (firestore_doc_id) => {
    navigate(`/edit-listing/${firestore_doc_id}`)
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

      <div className="max-w-6xl px-3 mt-10 mx-auto">
      {!loading && listings.length > 0 && (
          <>
            <h2 className="text-2xl text-center font-semibold mb-6">My Listings</h2>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
              mt-6 mb-6">
              {listings.map((listing) => (
                <ListingItem 
                  key={listing.firestore_doc_id}
                  listing={listing}
                  onDelete={()=> onDelete(listing.firestore_doc_id)}
                  onEdit={()=> onEdit(listing.firestore_doc_id)}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
