import { createContext,useEffect,useState,useContext } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthProvider';
import { backend_rtc } from '../helpers/env';


export const SocketContext = createContext();



export const SocketProvider = ({ children }) => {

   const {user} = useAuth();

    const [socket,setSocket] = useState(null);

    useEffect(()=>{  

        if(user?.id){


            const socketConnection = io(backend_rtc ,{                   
                query: {
                    cod_usuario: user?.id,
                },
                reconnection: true,
                reconnectionAttempts: Infinity, // Tenta reconectar indefinidamente
                reconnectionDelay: 1000, // Tempo de espera inicial (em ms) entre as tentativas de reconexão
                reconnectionDelayMax: 5000, // Tempo de espera máximo (em ms) entre as tentativas de reconexão
                timeout: 20000 // Tempo de espera antes de considerar que a conexão falhou (em ms)
            });


            setSocket(socketConnection);
        }
        
    },[user])

    useEffect(()=>{

        if(socket){
            
            socket.on('connect', () => {
                const userId = user?.id;
                socket.emit('registerUser', userId);
            });

        }

    },[socket])

  
  return(
        <SocketContext.Provider 
            value={{socket}}
        >
            {children}
        </SocketContext.Provider>
    );
};

export function useSocket() {
  const context = useContext(SocketContext);
  return context;  
}





