import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
    const propertyLogo = "https://firebasestorage.googleapis.com/v0/b/realestate-6d2e3.appspot.com/o/propertyguru.png?alt=media&token=72443c42-e476-46b3-ac54-eadef4d0bd63"
    const location = useLocation();
    const navigate = useNavigate();
    const [pageTitle, setPageTitle] = useState("SignIn")
    const auth = getAuth();
    
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setPageTitle("Profile")
            } else {
                setPageTitle("SignIn")
            }
        })
    }, [auth]);

    const pathMatchRoute = (route) => {
        if(route === location.pathname){
           return true
        }
    }
    

  return (
    <div className="bg-white border-b shadow-lg sticky top-0 z-40">
        <header className="flex justify-between items-center px-3 py-0.5 max-w-6xl mx-auto">
            <div className='flex items-center'>
                <img src={propertyLogo} 
                    className="h-9 mr-2 cursor-pointer" 
                    onClick={()=> navigate("/")}
                />
                <Link to='/'>
                <h1 className='font-bold text-xl sm:text-2xl flex flex-wrap'>
                    <span className='text-red-600'>Adrian</span>
                    <span className='text-slate-900'>Property</span>
                </h1>
                </Link>
            </div>
            <div>
                <ul className="flex space-x-4 sm:space-x-10">
                    <li className={`cursor-pointer py-3 text-md font-semibold
                        text-gray-400 border-b-4 border-b-transparent 
                        ${ pathMatchRoute("/") && "text-gray-950 border-b-red-600" }`}
                        onClick={()=> navigate("/")}>
                        Home
                    </li>
                    <li className={`cursor-pointer py-3 text-md font-semibold
                        text-gray-400 border-b-4 border-b-transparent 
                        ${pathMatchRoute("/offers") && "text-gray-950 border-b-red-600"}`}
                        onClick={()=> navigate("/offers")} >
                            Offers
                    </li>
                    <li className={`cursor-pointer py-3 text-md font-semibold
                        text-gray-400 border-b-4 border-b-transparent
                        ${ (pathMatchRoute("/signin") || pathMatchRoute("/profile") ) 
                            && "text-gray-950 border-b-red-600" }
                        `}
                        onClick={()=> navigate(pageTitle === "SignIn" ? "/signin" : "/profile")} 
                    >
                        {pageTitle}
                    </li>

                </ul>
            </div>
        </header>

    </div>
  )
}
