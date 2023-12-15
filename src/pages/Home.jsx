import { useEffect } from "react";
import Slider from "../components/Slider";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import { fetchOfferListings, fetchRentListings, fetchSaleListings } from "../features/listings/listingsSlice";

export default function Home() {
  const dispatch = useDispatch()
  const offerListings = useSelector(state => state.listings.offerListings)
  const saleListings = useSelector(state => state.listings.saleListings);
  const rentListings = useSelector(state => state.listings.rentListings);

  useEffect (()=> {
    dispatch(fetchOfferListings());
    dispatch(fetchSaleListings());
    dispatch(fetchRentListings());
  }, [dispatch])

  return (
    <div>
      <Slider/>
      <div className="max-w-6xl mx-auto pt-4 space-y-6 mb-6">
        {offerListings && offerListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Recent offers
            </h2>
            <Link to="/offers">
              <p className="px-3 text-md text-red-500 hover:text-red-700 
                transition duration-150 ease-in-out">
                Show more offers
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing.firestore_doc_id}
                  listing={listing}
                />
              ))}
            </ul>
          </div>
        )}

        {saleListings && saleListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Properties for Sale
            </h2>
            <Link to="/category/sale">
              <p className="px-3 text-md text-red-500 hover:text-red-700 
                transition duration-150 ease-in-out">
                Show more properties
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing.firestore_doc_id}
                  listing={listing}
                />
              ))}
            </ul>
          </div>
        )}
      
        {rentListings && rentListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Properties for Rent
            </h2>
            <Link to="/category/rent">
              <p className="px-3 text-md text-red-500 hover:text-red-700 
                transition duration-150 ease-in-out">
                Show more properties
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing.firestore_doc_id}
                  listing={listing}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
