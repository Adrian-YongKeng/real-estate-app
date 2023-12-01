import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Offers from "./pages/Offers";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import ForgotPassword from "./pages/ForgotPassword";
import SignIn from "./pages/SignIn";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./components/AuthProvider";
import RequireAuth from "./components/RequireAuth";
import CreateListing from "./pages/CreateListing";

export default function App() {

  return (
    <>
    <AuthProvider>
      <BrowserRouter>
      <Header/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route 
            path="/profile" 
            element={
              <RequireAuth>
                <Profile/>
              </RequireAuth>
            }/>
          <Route path="/signin" element={<SignIn/>}/>
          <Route path="/offers" element={<Offers />}/>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/createListing" element={<CreateListing/>}/>

        </Routes>
      </BrowserRouter>
      </AuthProvider>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

