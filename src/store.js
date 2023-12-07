import { configureStore } from "@reduxjs/toolkit";
import listingsReducer from "./features/listings/listingsSlice";

export default configureStore({
    reducer: {
        listings: listingsReducer,
    },
})