import { createContext, useContext,useEffect,useState } from "react";



const AuthContext = createContext(null);

export const AuthProvider = ({children})=>{

    const [user,setUser] = useState(null);

    const checkUser = ()=>{
        const userData = localStorage.getItem("@userData");
        if(userData){
            setUser(JSON.parse(userData));
        }
    }

    const signIn = (user)=>{
        
        localStorage.setItem("@userData",JSON.stringify(user))
        setUser(user)
    }
    const signOut = ()=>{
        localStorage.removeItem("@userData");
        setUser(null);
    }

    useEffect(()=>{
        checkUser();
    },[]);


    return <AuthContext.Provider value={{signIn,signOut,user,setUser}}>
        {
            children
        }
    </AuthContext.Provider>
}

export const useAuth = ()=>{
    const context = useContext(AuthContext);

    if(context === undefined){
        throw new Error('useAuth tem de ser chamado dentro de AuthProvider')
    }

    return context;
}