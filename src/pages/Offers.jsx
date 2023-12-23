import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { fetchAllOfferListings } from "../features/listings/listingsSlice";

export default function Offers() {
  const dispatch = useDispatch();
  const allOfferListings = useSelector(state => state.listings.allOfferListings)
  const [loading, setLoading] = useState(true)
  
  //not waiting the processs to complete before to the next line
  //data havent complete already set the loading to false
  //executed almost immediately after the dispatch, not giving enough time for spinner  
  //useEffect(() => {
  //  dispatch(fetchAllOfferListings())
  //  setLoading(false)
  //}, [dispatch])\

  useEffect(() => {
    async function loadData() {
      setLoading(true); // Start loading before dispatching
      await dispatch(fetchAllOfferListings());
      setLoading(false); // Stop loading after dispatching
    }
  
    loadData();
  }, [dispatch]);
  
  
  return (
    <div className="max-w-6xl mx-auto px-3 mb-5">
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
