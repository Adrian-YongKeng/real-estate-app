import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLatestListings } from "../features/listings/listingsSlice";
import Spinner from "./Spinner";
import {Swiper, SwiperSlide} from "swiper/react";
import {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css/bundle"
import { useNavigate } from "react-router";


export default function Slider() {
    const dispatch = useDispatch();
    const listings = useSelector(state => state.listings.listings)
    const navigate = useNavigate();
    //const [loading , setLoading] = useState(true)
    
    useEffect(() => {
        dispatch(fetchLatestListings())
        //setLoading(false)
    }, [dispatch])
    
    //if (loading) {
    //  return <Spinner/>
    //}

    if(listings.length === 0) {
        return <></>
    }

    return (
        <>
            <Swiper 
                slidesPerView={1} 
                navigation 
                pagination={{ type:"progressbar" }}
                effect="fade" 
                modules={[EffectFade, Autoplay, Navigation, Pagination]} 
                autoplay={{delay: 5500}}
            >
                {listings.map((listing)=> (
                    <SwiperSlide key={listing.firestore_doc_id}
                        onClick={() => navigate(`/listing/${listing.firestore_doc_id}`)}
                    >
                       <div style={{background: `url(${listing.image_url.split(';')[0]}) center, no-repeat`,
                            backgroundSize: "cover"}}
                            className="relative w-full h-[400px] overflow-hidden"
                        >
                       </div>
                       <p className="text-[#f1faee] absolute left-1 top-3 font-medium max-w-[90%] 
                        bg-[#991b3f] shadow-lg opacity-85 p-2 rounded-br-3xl">
                            {listing.title}
                        </p>
                        <p className="text-[#f1faee] absolute left-1 bottom-3 font-semibold max-w-[90%] 
                            bg-[#e63946] shadow-lg opacity-80 p-2 rounded-tr-3xl">
                            $ {listing.offer? listing.discounted_price
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                : listing.price
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                            {listing.type == "rent" && " / month"}
                        </p>
                    </SwiperSlide>
                ))}

            </Swiper>
        </>
    )
}
