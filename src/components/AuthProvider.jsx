import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import Spinner from "../components/Spinner";

export const AuthContext = createContext();

export function AuthProvider({children}) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            console.log(user)
            setCurrentUser(user);
            setLoading(false);
        })
    }, []);

    const value = { currentUser};
    
    
    //{!loading && children}
    return (
        <AuthContext.Provider value={value}>
            {loading ? <Spinner /> : children}
        </AuthContext.Provider>
    )
}