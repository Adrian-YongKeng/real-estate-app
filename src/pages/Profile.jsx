import { getAuth, updateProfile } from "firebase/auth"
import {  collection, deleteDoc, doc, getDocs, query, updateDoc, where} from "firebase/firestore";
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { db, storage } from "../firebase";
import { FcHome } from "react-icons/fc";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearListings, deleteListing, fetchListings } from "../features/listings/listingsSlice";
import { AuthContext } from "../components/AuthProvider";
import ListingItem from "../components/ListingItem";
import { CgProfile } from "react-icons/cg";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";


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

  const [imagePreview, setImagePreview] = useState(null);
  const [isProfilePicChanged, setIsProfilePicChanged] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsProfilePicChanged(true);
      };
      reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async (file) => {
    const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
    const snapshot = await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(snapshot.ref);
    return photoURL;
  };

//enable to edit username
  const edit = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const submitChanges = async() => {
    try {   
      setLoading(true)
      if (!username.trim()) {
        toast.error("Username cannot be empty.");
        return;
      }

      let updatedPhotoURL = currentUser.photoURL;
      if (isProfilePicChanged && imagePreview) {
        const file = await fetch(imagePreview).then(r => r.blob());
        updatedPhotoURL = await uploadProfilePicture(file)
        }

      if(auth.currentUser.displayName !== username){
        // Query the 'users' collection to check if the new username already exists
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(query(usersRef, where("username", "==", username)));
        // If username already exists, show an error message
        if (!querySnapshot.empty) {
          toast.error("Username already exists. Please choose a different username.");
          return;
        }
      }
        //update in firebase Auth
        await updateProfile(auth.currentUser, {
          displayName: username,
          photoURL: updatedPhotoURL
        });

      //update to firestore//"collection"
        const docRef = doc(db, "users", auth.currentUser.uid)
        await updateDoc(docRef, {
          username: username, photoURL :updatedPhotoURL
        })
        toast.success("Profile details updated successfully!")
    } catch (error) {
      toast.error("Failed to update the profile details.")
    } finally {
      setLoading(false);
      setIsProfilePicChanged(false);
      setImagePreview(null); 
    }
  }
  
  useEffect(() => {
    let didCancel = false;
    if (currentUser?.uid) {
      dispatch(fetchListings(currentUser.uid)).unwrap()
        .then(() => {
          if (!didCancel) { // Check if the component is still mounted
            setLoading(false); 
          }
        })
      .catch((error) => {
        if (!didCancel) { // Check if the component is still mounted
          console.error("Error while fetching listings: ", error);
          setLoading(false); 
        }
      });
    } return () => {
      didCancel = true; // Set flag to true when component unmounts
      dispatch(clearListings()); // Clear listings when component unmounts
    };
  }, [dispatch, currentUser?.uid]);

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

  const handleSignOut = () => {
    auth.signOut();
    dispatch(clearListings());
    navigate("/");
  };

  const handleImageUpload = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 font-bold">
          My Profile
        </h1>

        <input 
          type="file" 
          id="fileInput" 
          className="hidden" 
          onChange={handleImageChange}
          accept=".jpeg, .png, .jpg" 
          disabled={!changeDetail}
        />
        <div className="mt-5"></div>
          <div className="relative w-40 h-40 rounded-full overflow-hidden cursor-pointer group" 
            onClick={handleImageUpload}>
            {imagePreview ? 
              <img src={imagePreview}  
                className="w-full h-full object-cover group-hover:opacity-50 transition-opacity duration-300"
              />: currentUser.photoURL ? (
                <img src={currentUser.photoURL}  
                     className="w-full h-full object-cover group-hover:opacity-50 transition-opacity duration-300"
                />
              ) : (<CgProfile className="w-full h-full object-cover group-hover:opacity-50 transition-opacity duration-300"/>
              )
            }
             {isProfilePicChanged && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white">{Math.round(uploadProgress)}%</span>
              </div>
            )}
            {changeDetail&&
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-0 group-hover:bg-opacity-50 first-letter:transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                  <span className="text-white text-lg">
                    Upload Profile Pic
                  </span>
              </div>
            }
        </div>

        <div className="w-full md:w-[50%] mt-5 px-3">
          <form>
            <input type="text" 
              id="username" 
              value={username} 
              disabled={!changeDetail}
              onChange={edit}
              className={`w-full px-4 py-2 text-xl text-gray-700 border border-gray-400 
              rounded transition ease-in-out mb-5 ${
                changeDetail && "bg-red-300 focus:bg-red-300"
              }`}
            />

            <input type="email" id="email" value={email} disabled 
              className="w-full px-4 py-2 text-xl text-gray-700 border 
              border-gray-400 rounded transition ease-in-out mb-5"
            />

            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p 
                onClick={() => {
                  changeDetail && submitChanges();
                  setChangeDetail((prevState) => !prevState);
                }}
                className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition ease-in-out duration-200 cursor-pointer"
              >
                {changeDetail ? "Apply change" : "Edit profile"} <FaEdit className="ml-2" />

              </p>
              <p onClick={handleSignOut}
                className="flex items-center space-x-1 text-blue-500 hover:text-blue-800 transition ease-in-out duration-200 cursor-pointer"
              >
                <FaSignOutAlt className="mr-2"/> Sign Out</p>
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

      <div className="max-w-6xl px-3 mt-9 mx-auto">
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
