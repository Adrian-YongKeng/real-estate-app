import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { fetchAllRentListings, fetchAllSaleListings } from "../features/listings/listingsSlice";
import { useParams } from "react-router";

export default function Category() {
  const dispatch = useDispatch();
  const allSaleListings = useSelector(state => state.listings.allSaleListings)
  const allRentListings = useSelector(state => state.listings.allRentListings)

  const [loading, setLoading] = useState(true)
  const params = useParams();
  
  useEffect(() => {
    async function loadData() {
      setLoading(true); 
      if (params.type === "sale") {
        await dispatch(fetchAllSaleListings());
      } else if (params.type === "rent") {
        await dispatch(fetchAllRentListings());
      }
      setLoading(false); 
    }
    loadData();
  }, [dispatch, params.type]);

  const listingsToShow = params.type === "sale" ? allSaleListings : allRentListings;

  return (
    <div className="max-w-6xl mx-auto px-3 mb-5">
      <h1 className="text-3xl text-center my-6 font-bold">
        {params.type === "rent" ? "Properties for Rent" : "Properties for Sale"}
      </h1>
      {loading ? (
        <Spinner/>
      ): listingsToShow && listingsToShow.length > 0 && (
        <main>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {listingsToShow.map((listing) => (
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
