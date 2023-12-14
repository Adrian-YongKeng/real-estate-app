import moment from "moment";
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaBath, FaBed, FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";



export default function ListingItem({listing, onDelete, onEdit}) {
    const imageUrl = listing.image_url && listing.image_url.split(';')[0];

    return (
    <li className="relative bg-gray-100 flex flex-col justify-between 
        items-center shadow-md hover:shadow-lg rounded-md 
        overflow-hidden transition-shadow duration-150 m-2.5"
    >
        <Link className="contents"
            //to={`/category/${listing.type}/${listing.firestore_doc_id}`}
            to={`/listing/${listing.firestore_doc_id}`}
        >
            <img className="h-[170px] w-full object-cover hover:scale-105 
                transition-scale duration-200 ease-in"
                loading="lazy"
                src={imageUrl} 
                alt="" 
            />
            <p className="absolute top-2 left-2 bg-red-600 text-white uppercase
             text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
                {moment(listing.created_at).fromNow()}
            </p>
            <div className="w-full p-2.5">
                <div className="flex items-center space-x-1">
                    <MdLocationOn
                        className="h-4 w-4 text-red-500"
                    />
                    <p className="font-semibold text-sm mb-0.5 text-gray-600 truncate">
                        {listing.address}
                    </p>
                </div>
                <p className="font-semibold text-xl truncate">{listing.title}</p>
                <p className="mt-2 font-semibold text-gray-600">$
                    {listing.offer ? listing.discounted_price
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : listing.price
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                {listing.type === "rent" && "/ month"}
                </p>
                <div className="flex items-center mt-2.5 space-x-4">
                    <div className="flex items-center space-x-1">
                        <FaBed /> <p className="font-semibold">{listing.bedrooms}</p> 
                    </div>
                    <div className="flex items-center space-x-1">
                        <FaBath /> <p className="font-semibold">{listing.bathrooms}</p> 
                    </div>
                </div>
            </div>
        </Link>
        {onDelete && (
            <FaTrash className="absolute bottom-2.5 right-2 h-4 cursor-pointer text-red-600"
                onClick={()=> onDelete(listing.firestore_doc_id)}
            />
        )}
        {onEdit && (
            <FaEdit className="absolute bottom-2.5 right-9 h-4 cursor-pointer text-gray-600"
                onClick={()=> onEdit(listing.firestore_doc_id)}
            />
        )}
    </li>
  )
}
