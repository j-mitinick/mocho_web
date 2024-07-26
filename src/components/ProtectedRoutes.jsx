import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { useEffect } from "react";

export const ProtectedRoutes = ({children})=>{
    const {user} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        
        if(user === null){

            navigate('/signin',{replace:true});
        }


    },[navigate,user]);




    return children;
}