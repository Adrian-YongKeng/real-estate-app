import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


const BASE_URL = "https://adrian-estate-api.yy1123.repl.co";

// fetch the 5 latest listings
export const fetchLatestListings = createAsyncThunk(
    "listings/fetchLatestListings",
    async () => {
      const response = await axios.get(`${BASE_URL}/listings/latest`);
      return response.data;
    }
  );
  

//get listings by userid
export const fetchListings = createAsyncThunk(
    "listings/fetchListings", 
    async(user_id) => { //userId
        const response = await axios.get(`${BASE_URL}/listings/${user_id}`);
        return response.data ;
    }
);

//get single listing by firestore_doc_id
export const fetchFormData = createAsyncThunk(
    "listings/fetchFormData", 
    async(firestore_doc_id) => {                     //listing
        const response = await axios.get(`${BASE_URL}/listing/${firestore_doc_id}`);
        return response.data ;
    }
);

//create a listing
export const addListing = createAsyncThunk(
    "listings/addListing",
    async(formData) => {
        const response = await axios.post(`${BASE_URL}/listings`, formData);
        return  response.data ;
    }
);

//update listing
export const updateListing = createAsyncThunk(
    "listings/updateListing",
    async ({ firestore_doc_id, ...formData }) => {
        const response = await axios.put(`${BASE_URL}/listings/${firestore_doc_id}`, formData);
        return response.data;
    }
);

// Delete listing
export const deleteListing = createAsyncThunk(
    "listings/deleteListing",
    async (firestore_doc_id) => {
        const response = await axios.delete(`${BASE_URL}/listings/${firestore_doc_id}`);
        return response.data;
    }
);

//slice
const listingsSlice = createSlice({
    name: 'listings',
    initialState: {
        listings: [],
        loading: true,
  },
  reducers: { 
    clearListings: (state) => {
        state.listings = [];
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchListings.fulfilled, (state,action) => {
            state.listings = action.payload;
            //state.loading = false;
        })
        .addCase(addListing.fulfilled, (state, action) => {
            state.listings = [action.payload, ...state.listings];
        })
        .addCase(updateListing.fulfilled, (state, action) => {
            const index = state.listings.findIndex(listing => listing.firestore_doc_id === action.payload.id);
            if (index !== -1) {
                state.listings[index] = action.payload;
            }
        })
        .addCase(deleteListing.fulfilled, (state, action) => {
            state.listings = state.listings.filter(listing => listing.firestore_doc_id !== action.payload);
        })
        .addCase(fetchFormData.fulfilled, (state,action) => {
            state.listings = [action.payload];//object
        })
        .addCase(fetchLatestListings.fulfilled, (state, action) => {
            state.listings = action.payload;
        })
        
    }
})

export const { clearListings } = listingsSlice.actions;

export default listingsSlice.reducer;