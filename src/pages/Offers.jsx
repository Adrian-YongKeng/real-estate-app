import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { fetchAllOfferListings } from "../features/listings/listingsSlice";

export default function Offers() {
  const dispatch = useDispatch();
  const allOfferListings = useSelector(state => state.listings.allOfferListings)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    dispatch(fetchAllOfferListings())
    setLoading(false)
  }, [dispatch])

  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center my-6 font-bold">
        Offers
      </h1>
      {loading ? (
        <Spinner/>
      ): allOfferListings && allOfferListings.length > 0 && (
        <main>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {allOfferListings.map((listing) => (
              <ListingItem
                key={listing.firestore_doc_id}
                listing = {listing}
              />
            ))}
          </ul>
        </main>
      )}
    </div>
  )
}
