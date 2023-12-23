import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router";
import { fetchFormData } from "../features/listings/listingsSlice";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {Swiper, SwiperSlide} from "swiper/react";
import {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css/bundle"
import {  FaBath, FaBed, FaCouch, FaMapLocationDot, FaPhone, FaShare } from "react-icons/fa6";
import { FaParking } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";
import Maps from "../components/Maps";
import { IoCloseCircle } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
//import { AuthContext } from "../components/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CgProfile } from 'react-icons/cg';


export default function Listing() {
  const dispatch = useDispatch();
  const { firestore_doc_id } = useParams();
  const [loading, setLoading] = useState(true)
  const [linkCopied, setLinkCopied] =useState(false)
  const auth = getAuth();
  const [contactLandlord, setContactLandord] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // useEffect(() => {
 //   if (firestore_doc_id) {
 //   dispatch(fetchFormData(firestore_doc_id))
 //   setLoading(false)
//    }
 // }, [dispatch, firestore_doc_id])

 const fetchUserDetails = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    // Handle the case where the user does not exist
    console.error("No user found!");
  }
};

 useEffect(() => {
  if (firestore_doc_id) {
    setLoading(true);
    dispatch(fetchFormData(firestore_doc_id))
      .unwrap()
      .then(async(data) => {
        console.log('Fetched data:', data);
         //fetch the user details using the user_id from listing
         const userDetailsResponse = await fetchUserDetails(data.user_id);
         setUserDetails(userDetailsResponse);
         setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching listing:', err);
        toast.error(`Error fetching listing: ${err.message || err}`);
        setLoading(false);
      });
    }
  }, [dispatch, firestore_doc_id]);

  const listing = useSelector((state) =>
        state.listings.listings.find((listing) => listing.firestore_doc_id === firestore_doc_id)
    );
    
  if (loading) {
    return <Spinner/>
  }

  if (!listing) {
    return <div>Listing not found.</div>;
  }

   // Split the image_url string into an array if it's not already an array
   const imageUrls = Array.isArray(listing.image_url)
   ? listing.image_url
   : listing.image_url.split(';'); // delimiter to split the string

   const handleContactClick = () => {
     // Check if user is logged in
    if (auth.currentUser) {
      setContactLandord(true);
    } else {
      toast.info("Please sign in or sign up to contact the landlord / agents.");
      navigate('/signin'); 
    }
  };

  const handleViewPhoneNumber = () => {
    if (auth.currentUser) {
      setShowPhoneNumber(!showPhoneNumber);
    } else {
      toast.info("Please sign in to view the phone number.");
      navigate('/signin');
    }
  };

  const openModal = (index) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const renderModal = (
    <>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Swiper
              slidesPerView={1}
              initialSlide={activeIndex}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[Pagination, Navigation]}
            >
              {imageUrls.map((url, index) => (
                <SwiperSlide key={index}>
                    <img src={url} alt={`Image ${index}`} 
                      className="modal-image" />
                </SwiperSlide>
              ))}
            </Swiper>
            <button
              className="absolute top-2 right-2 text-4xl text-red-700 cursor-pointer z-10 hover:text-red-500"
              onClick={closeModal}
              aria-label="Close"
            >
              <IoCloseCircle />
            </button>
          </div>
        </div>
      )}
    </>
  );
  

  return (
    <main>
      <Swiper 
        slidesPerView={1} 
        navigation 
        pagination={{ type:"progressbar" }}
        effect="fade" 
        modules={[EffectFade, Autoplay, Navigation, Pagination]} 
        autoplay={{delay: 6000}}
        >
        {imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full overflow-hidden h-[400px]" 
              onClick={() => openModal(index)}
              style={{
                background: `url(${url}) center no-repeat`,
                backgroundSize: "cover"
              }}
            >
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="fixed top-[13%] right-[3%] z-10 bg-white 
        cursor-pointer rounded-full w-10 h-10 flex justify-center items-center"
        onClick={()=> {
          navigator.clipboard.writeText(window.location.href)
          setLinkCopied(true)
          setTimeout(()=> {
            setLinkCopied(false)
          }, 2500)
        }}
      >
        <FaShare className="text-lg text-red-500"/>
      </div>
      {linkCopied && <p className="fixed top-[23%] right-[5%] z-10 p-2 font-semibold 
        border-2 border-gray-300 rounded-md bg-white"
        >Link Copied</p>
      }

    <div className="m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg 
      shadow-lg bg-white lg:space-x-5">
        <div className=" w-full ">
          <p className="text-2xl font-bold mb-3 ">
            {listing.title} - ${""} 
            {listing.offer ? 
              listing.discounted_price
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.price
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              {listing.type === "rent" ? " / month" : ""}
          </p>
            <p className="flex items-center mt-6 mb-3 font-semibold">
              <FaMapLocationDot className="text-red-600 mr-2"/> 
              {listing.address}
            </p>
            <div className="flex justify-start items-center space-x-4 w-[75%]">
              <p className="bg-gray-500 w-full max-w-[200px] rounded-md p-1
               text-white text-center font-semibold shadow-md">
                {listing.type === "rent" ? "Rent" : "Sale"}
              </p>
              {listing.offer && (
                <p className="w-full max-w-[200px] bg-green-500 rounded-md p-1
                 text-white text-center font-semibold shadow-md">
                  ${listing.price - listing.discounted_price} discount
                </p>
              )}
            </div>
            <p className="mt-7 mb-7">
              <span className="font-semibold">Description -</span>
              {listing.description}
            </p>
            <ul className="flex items-center space-x-5 sm:space-x-10 text-sm font-semibold mb-3">
              <li className="flex items-center whitespace-nowrap">
                <FaBed className="mr-1 text-lg"/>
                {listing.bedrooms} Bed
              </li>
              <li className="flex items-center whitespace-nowrap">
                <FaBath className="mr-1 text-lg"/>
                {listing.bathrooms} Bath
              </li>
              <li className="flex items-center whitespace-nowrap">
                <FaParking className="mr-1 text-lg"/>
                {listing.parking ? "Parking spot" : "No parking"} 
              </li>
              <li className="flex items-center whitespace-nowrap">
                <FaCouch className="mr-1 text-lg"/>
                {listing.furnished ? "Furnished" : "No furnised"} 
              </li>
            </ul>
            <hr className="mb-4"/>
            
            
            <div className="container mx-auto p-4">
              <div className="flex flex-col items-center md:flex-row md:justify-center 
                md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-4 md:mb-0 md:w-[23%]">
                  {userDetails?.photoURL ? (
                    <img 
                      src={userDetails.photoURL} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <CgProfile className="w-20 h-20 text-gray-500" />
                  )}
                  <p className="mt-2 text-md font-medium text-center w-full">{userDetails?.username}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col space-y-2 w-full md:w-[77%] ">
                  <button
                    onClick={handleViewPhoneNumber}
                    className="flex items-center justify-center px-7 py-3 bg-white text-black font-medium text-sm uppercase rounded border
                     border-black shadow-md hover:bg-black hover:text-white focus:shadow-lg w-full text-center transition duration-150 ease-in-out"
                  >
                    <FaPhone className="mr-2 text-lg md:text-lg" />
                    {showPhoneNumber ? listing.phone_number : "View Phone Number"}
                  </button>
                  
                  <button
                    onClick={handleContactClick}
                    className="flex items-center justify-center px-7 py-3 bg-red-600 text-white font-medium text-sm uppercase rounded 
                      shadow-md hover:bg-red-700 focus:shadow-lg w-full text-center transition duration-150 ease-in-out"
                  >
                    {auth.currentUser && <MdOutlineMailOutline className="text-lg md:text-xl mr-2" />}
                    {auth.currentUser ? "Send Enquiry" : "Contact Landlord / Agents"}
                  </button>
                </div>
              </div>
            </div>
            {contactLandlord && (
              <Contact
                listing= {listing}
              />
            )}
        </div>
        <hr className="mb-4"/>
        <div className="mt-6 mb-4 md:mt-0 md:ml-2 w-full h-[200px] md:h-[400px] z-10 overflow-x-hidden">
          <Maps
            listing={listing}
          />
        </div>
    </div>
    {isModalOpen && renderModal}
    </main>

  )
}
