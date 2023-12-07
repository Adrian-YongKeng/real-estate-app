import { useContext, useEffect, useState } from "react"
import { FcHome } from "react-icons/fc"
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {v4 as uuidv4} from "uuid";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { addListing } from "../features/listings/listingsSlice";
import { AuthContext } from "../components/AuthProvider";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";


export default function CreateListing() {
    const auth = getAuth();
    const { currentUser } = useContext(AuthContext);
    const [geolocationEnabled, setGeolocationEnabled] = useState(true)
   
    const [loading, setLoading] =useState(false);
    const dispatch =useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        type: "rent",
        title: "",
        bedrooms: 0,
        bathrooms: 0,
        parking: false,
        furnished: false,
        address: "",
        description: "",
        offer: false,
        price: 0,
        discounted_price: 0,
        latitude: 0,
        longitude: 0,
        images: {},
        user_id: ""
    })

    const {
        type, title,  bedrooms, bathrooms,
        parking, furnished, address, description
        , offer , price, discounted_price, 
        latitude, longitude,
        images,
    } = formData

    //manage the state of form inputs
    const onChange = (e) => {
        let boolean = null;

        if (e.target.value === "true") {
            boolean = true;
        }
        if (e.target.value === "false") {
            boolean = false;
        }
        //files
        if (e.target.files){
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files
            }))
        }
        // text, boolean , number
        if (!e.target.files){
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value,
            }))
        }
    }

    useEffect(() => {
        if (currentUser) {
            setFormData(prevFormData => ({ 
                ...prevFormData, 
                user_id: currentUser.uid,
                username: currentUser.displayName,
                email: currentUser.email
             }));
        }
    }, [currentUser]);

    //Upload images to firestore db
    const storeImage = async(image) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage()
            const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
            const storageRef = ref(storage, filename);
            const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on('state_changed', 
            (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
                }
            }, 
            (error) => {
                reject(error)
            }, 
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
        })
    }
    //create listing button
    const onSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);

        if (+discounted_price >= +price) {
            setLoading(false)
            toast.error("Discounted price should be less than the regular price.")
            return;
        }
        if (images.length > 6 ) {
            setLoading(false);
            toast.error("Maximum 6 images are allowed")
            return
        }

        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
            )
            .catch((error) => {
                setLoading(false);
                toast.error("Images failed to upload", error)
                return;
            })   
        console.log(imgUrls)
        
        const firestoreData = {
            imgUrls,
            timestamp: serverTimestamp(),
            user_id : auth.currentUser.uid
        };
        const docRef = await addDoc(collection(db, "listings"), firestoreData);
        //setLoading(false)
        //toast.success("Listing created")
        
        //geocoding api
        if (geolocationEnabled) {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${import.meta.env.VITE_API_KEY}`
                );
                const data = await response.json();
                console.log(data);
                if (data.status === "OK" && data.results[0]?.geometry.location) {
                    const lat = data.results[0].geometry.location.lat ?? 0;
                    const lng = data.results[0].geometry.location.lng ?? 0;
                    
                    //update the formData state with the new latitude&longitude
                    const updatedFormData = {
                        ...formData,
                        latitude: lat,
                        longitude: lng,
                        firestore_doc_id : docRef.id
                    };
                    //use updatedFormData in dispatch
                    dispatch(addListing(updatedFormData))
                    .then(() => {
                        console.log(updatedFormData)
                        navigate(`/category/${formData.type}/${docRef.id}`);
                        toast.success("Listing created successfully!")
                        setLoading(false)
                    })
                    .catch((error) => {
                        toast.error("Failed to create listing", error);
                });
            } else {
                setLoading(false);
                toast.error("Please enter a valid address");
                return;
            }
        } 
    }

    if(loading){
        return <Spinner/>
    }

  return (
    <div className="max-w-md px-2 mx-auto">
       <h1 className="text-3xl text-center mt-6 font-bold">
            Create Listing
        </h1> 
        <form onSubmit={onSubmit}>
            <h4 className="text-lg mt-6 font-semibold">
                Sell / Rent
            </h4>
            <div className="flex">
                <button type="button" 
                    id="type" 
                    value="sale"
                    onClick={onChange}
                    className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                        type === "rent" ? "bg-white text-black" : "bg-slate-700 text-white"
                    }`}
                >
                    Sell
                </button>
                <button type="button" 
                    id="type" 
                    value="rent"
                    onClick={onChange}
                    className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                        type === "sale" ? "bg-white text-black" : "bg-slate-700 text-white"
                    }`}
                >
                    Rent
                </button>
            </div>
            <p className="text-lg mt-6 font-semibold">Title</p>
            <input 
                type="text" 
                id="title" 
                value={title}
                onChange={onChange}
                placeholder="Property Name"
                maxLength="60"
                minLength="10"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-whitw border border-gray-600 
                rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white mb-6"
            />
            <div className="flex space-x-6 mb-6">
                <div>
                    <p className="text-lg font-semibold">Beds</p>
                    <input 
                        type="number" 
                        id="bedrooms" 
                        value={bedrooms} 
                        onChange={onChange} 
                        min="0" 
                        max="1000"
                        required
                        className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-600 rounded
                         transition duration-150 ease-in-out focus:text-gray-700
                          focus:bg-white foucs:border-slate-600 text-center"
                    />
                </div>
                <div>
                    <p className="text-lg font-semibold">Baths</p>
                    <input 
                        type="number" 
                        id="bathrooms" 
                        value={bathrooms} 
                        onChange={onChange} 
                        min="0" 
                        max="1000"
                        required
                        className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-600 rounded
                         transition duration-150 ease-in-out focus:text-gray-700
                          focus:bg-white foucs:border-slate-600 text-center"
                    />
                </div>
            </div>
            
            <p className="text-lg mt-6 font-semibold">
                Parking Spot
            </p>
            <div className="flex">
                <button type="button" 
                    id="parking" 
                    value={true}
                    onClick={onChange}
                    className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                       !parking ? "bg-white text-black" 
                       : "bg-slate-700 text-white"
                    }`}
                >
                    Yes
                </button>
                <button type="button" id="parking" value={false}
                    onClick={onChange}
                    className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                        parking ? "bg-white text-black" 
                        : "bg-slate-700 text-white"
                    }`}
                >
                   No
                </button>
            </div>

            <p className="text-lg mt-6 font-semibold">
                Furnished
            </p>
            <div className="flex">
                <button type="button" 
                    id="furnished" value={true}
                    onClick={onChange}
                    className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                        !furnished ? "bg-white text-black" : "bg-slate-700 text-white"
                    }`}
                >
                   Yes
                </button>
                <button type="button" 
                    id="furnished" 
                    value={false}
                    onClick={onChange}
                    className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                        furnished ? "bg-white text-black" : "bg-slate-700 text-white"
                    }`}
                >
                    No
                </button>
            </div>

            <p className="text-lg mt-7 font-semibold">Address/ Location</p>
            <textarea
                type="text" 
                id="address" 
                value={address}
                onChange={onChange}
                placeholder="Address"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-whitw border border-gray-600 
                rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white mb-5"
            />
            {!geolocationEnabled && (
                <div className="flex space-x-6 justify-start mb-6">
                    <div>
                        <p className="text-lg font-semibold">Latitude</p>
                        <input 
                            type="number" id="latidtude" value={latitude} 
                            onChange={onChange} 
                            required
                            min="-90" max="90"
                            className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 
                            rounded transition ease-in-out focus:text-gray-700 focus:border-slate-600 text-center "
                        />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">Longitude</p>
                        <input 
                            type="number" id="longitude" value={longitude} 
                            onChange={onChange} 
                            required
                            min="-180" max="180"
                            className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 
                            rounded transition ease-in-out focus:text-gray-700 focus:border-slate-600 text-center "
                        />
                    </div>
                </div>
            )}

            <p className="text-lg font-semibold">Description</p>
            <textarea
                type="text" 
                id="description" 
                value={description}
                onChange={onChange}
                placeholder="Desciprion"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-whitw border border-gray-600 
                rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white mb-5"
            />

            <p className="text-lg font-semibold">Offer</p>
            <div className="flex mb-6">
                <button type="button" 
                    id="offer" 
                    value={true}
                    onClick={onChange}
                    className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                        !offer ? "bg-white text-black" : "bg-slate-700 text-white"
                    }`}
                >
                   Yes
                </button>
                <button type="button" 
                    id="offer" 
                    value={false}
                    onClick={onChange}
                    className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition
                    duration-150 ease-in-out w-full ${
                        offer ? "bg-white text-black" : "bg-slate-700 text-white"
                    }`}
                >
                    No
                </button>
            </div>

            <div className=" items-center mb-6">
                <div>
                    <p className="text-lg font-semibold">Price $</p>
                    <div className="flex w-full justify-center items-center space-x-6">
                        <input type="number" 
                            id="price" 
                            value={price} 
                            onChange={onChange}
                            min="50"
                            max="900000000"
                            required
                            className="w-full px-4 py-2 text-xl text-gray-700 bg-white 
                            border border-gray-600 rounded transition duration-150 ease-in-out
                            focus:text-gray-700 focus:bg-white text-center"
                        />
                        {type === "rent" && (
                            <div className="">
                                <p className="text-md w-full whitespace-nowrap">
                                    $ / Month
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {offer && (
                <div className=" items-center mb-6">
                    <div>
                        <p className="text-lg font-semibold">Discounted Price $</p>
                        <div className="flex w-full justify-center items-center space-x-6">
                            <input type="number" 
                                id="discounted_price" 
                                value={discounted_price} 
                                onChange={onChange}
                                min="50"
                                max="900000000"
                                required={offer}
                                className="w-full px-4 py-2 text-xl text-gray-700 bg-white 
                                border border-gray-600 rounded transition duration-150 ease-in-out
                                focus:text-gray-700 focus:bg-white text-center"
                            />
                            {type === "rent" && (
                                <div className="">
                                    <p className="text-md w-full whitespace-nowrap">
                                        $ / Month
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <p className="text-lg font-semibold">Images</p>
                <p className="text-gray-600">The first image will be the cover (Max 6)</p>
                <input type="file" 
                    id="images" 
                    onChange={onChange} 
                    accept=".jpeg, .png, .jpg"
                    multiple
                    required
                    className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-400 
                    rounded transition duration-150 ease-in-out focus:border-slate-600"
                />
            </div>

            <button type="submit"
                className="mb-6 w-full px-7 py-3 bg-red-600 font-medium text-sm text-white uppercase rounded
                 shadow-md hover:bg-red-700 hover:shadow-lg focus:bg-red-700 focus:shadow-lg
                  active:bg-red-800 active:shadow-lg transition duration-150 ease-in-out"
            >
                <div className="flex justify-center items-center">
                    <FcHome className="mr-3 text-3xl bg-red-200 rounded-full border-2"/>
                    Create Listing
                </div>
            </button>
        </form>
    </div>
  )
}
