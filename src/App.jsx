import React, { useEffect } from 'react'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import { ProtectedRoutes } from './components/ProtectedRoutes'
import { Home } from './screens/Home'
import { Login } from './screens/Login'
import { Register } from './screens/Register'
import { AuthProvider } from './contexts/AuthProvider'
import { Chat } from './screens/Chat'
import { Conversations } from './screens/Conversations'
import { RoomMeeting } from './screens/RoomMeeting'
import './index.css'
import { CreateOrJoinToMeeting } from './screens/CreateOrJoinToMeeting'
import { SocketProvider } from './contexts/SocketProvider'




const router = createBrowserRouter([
  {
    path:'/',
    element:<ProtectedRoutes>
      <Home/>
    </ProtectedRoutes>,
    errorElement:<div><h1>404 A página solicitada não existe</h1></div>
    
  },
  {
    path:'/chat/:id',
    element:<ProtectedRoutes>
      <Chat/>
    </ProtectedRoutes>    
  },
  {
    path:'/conversations',
    element:<ProtectedRoutes>
      <Conversations/>
    </ProtectedRoutes>    
  },
  {
    path:'/roommeeting',
    element:<ProtectedRoutes>
      <RoomMeeting/>
    </ProtectedRoutes>    
  },
  {
    path:'/createorjointomeeting',
    element:<ProtectedRoutes>
      <CreateOrJoinToMeeting/>
    </ProtectedRoutes>    
  },
  {
    path:'/createorjointomeeting/:id',
    element:<ProtectedRoutes>
      <CreateOrJoinToMeeting/>
    </ProtectedRoutes>    
  },
  {
    path:'/signin',
    element:<Login/>
  },
  {
    path:'signup',
    element:<Register/>
  }
])

export const App = ()=>{
  useEffect(()=>{
    const disableRightClick = (event)=>{
      event.preventDefault();
    }

    const handleKeyDown = (event)=>{
      console.log(event)
      if(event.key === 'PrintScreen'){
        event.preventDefault();
        alert('captura des')
      }

      if((event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's') || (event.ctrlKey && event.key.toLowerCase() === 's')){
        event.preventDefault();
        alert('captura des')
      }
    }

    //document.addEventListener('contextmenu',disableRightClick);
    document.addEventListener('keydown',handleKeyDown);

    return ()=>{

      document.removeEventListener('contextmenu',disableRightClick);
      document.removeEventListener('keydown',handleKeyDown);

    }
  },[]);

    return ( 
      <AuthProvider>
        <SocketProvider>
          <RouterProvider 
            router={router}    
          />
        </SocketProvider>
      </AuthProvider>
    )

    
}
