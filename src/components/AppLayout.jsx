import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthProvider"
import logo from '../assets/logo.png'
import userplaceholderimage from '../assets/userplaceholderimage.png'
import { VideoCamera ,House,ChatCircleDots, Bell, SignOut, MagnifyingGlass } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketProvider";
import { useNavigate } from "react-router-dom";



export const AppLayout = ({children,showSearchBar,searchBarPlaceHolder,onSearch})=>{
    const {signOut,user} = useAuth();
    const [showInvites,setShowInvites] = useState(false);
    const [envitations,setEnvitations] = useState([]);
    const {socket} = useSocket();
    const [room,setRoom] = useState(null);
    const [responseToJoinMeeting,setResponseToJoinMeeting] = useState(null);
    const navigate = useNavigate();



    const showNoficationHandler = ()=>{
        if(!responseToJoinMeeting)
            setShowInvites(prev=>!prev)
    }

    const requestJoinMeeting = (user,host,channel)=>{
        setRoom(channel)
        socket.emit('request to join meeting',{user,host});
        setResponseToJoinMeeting("Solicitação enviada. Aguarde que seja aceite");
    }

    const joinMeeting = ()=>{
        
        navigate('/createorjointomeeting/'+room);

    }

    

    useEffect(() => {

        socket.on("new invitation", ({ channel, appId, token, cod_meeting,user,host}) => {
            setEnvitations(prev=>[...prev,{room:channel,appId,token,cod_meeting,user,host}]);
        });

        socket.on("response to join meeting", ({feedback}) => {
            if(feedback==1){
                setResponseToJoinMeeting(null);
                joinMeeting()
            }
            else
                setResponseToJoinMeeting('Sua solicitação não foi aprovada!');
        });
    
      }, [room]);

    return (
            <div className="flex h-screen overflow-hidden bg-graywhite-300">
                <nav className="w-20">
                    <ul className="w-full justify-center flex flex-col items-center pt-4">
                        <li className="mb-4 flex justify-center">
                            <Link to="/" title="Início">
                                <img
                                    src={logo}
                                    height={55}
                                    width={55}
                                />
                            </Link>
                        </li>
                        <li className="mb-4 flex justify-center items-center shadow-lg rounded-full w-14 h-14 hover:bg-primary active:bg-primary">
                            <Link to="/" title="Início">
                                <House size={32} className="hover:text-white" />
                            </Link>
                        </li>
                        <li className="mb-4 flex justify-center items-center shadow-lg rounded-full w-14 h-14 hover:bg-primary">
                            <Link to="/createorjointomeeting">
                                <VideoCamera size={32} className="hover:text-white" />
                            </Link>
                        </li>
                        <li className="mb-4 flex justify-center items-center shadow-lg rounded-full w-14 h-14 hover:bg-primary">
                            <Link to="/conversations">
                                <ChatCircleDots size={32} className="hover:text-white" />
                            </Link>
                        </li>
                        <li className="mb-4 flex justify-center items-center shadow-lg rounded-full w-14 h-14 hover:bg-primary">
                            <button onClick={signOut}>
                                <SignOut size={32} className="hover:text-white" />
                            </button>
                        </li>
                    </ul>
                </nav>
                <div className="flex-1 flex flex-col h-full  bg-white bg-opacity-10 shadow-2xl">

                    <header className="flex justify-between items-center p-4 relative">
                        <h1 className="font-bold">Mocho</h1>
                        {
                            showSearchBar &&
                            <div className="bg-white h-fit p-1 rounded-lg w-96 justify-between md:flex hidden">
                                <input 
                                    className="outline-none"
                                    type="search" name="search" onChange={onSearch}
                                    id="search" placeholder={searchBarPlaceHolder} 
                                />
                                <button type="button">
                                    <MagnifyingGlass size={22} className="hover:text-graywhite-600 text-graywhite-300" />
                                </button>
                            </div>
                        }
                        <div className="relative flex items-center gap-2">
                            <span className="font-bold">{user?.nome+' '+user?.sobrenome}</span>
                            <img 
                                src={userplaceholderimage}
                                alt="user photo"                                 
                                className="rounded-full w-10 h-10 object-cover"
                            
                            />
                            <div className="bg-green-500 h-3 w-3 rounded-full absolute top-1 right-8"></div>
                            <button onClick={showNoficationHandler} className="relative">
                                <h3 className="bg-primary text-white justify-center h-5 w-5 flex items-center text-xs p-1 rounded-full absolute -top-1 -right-1">
                                    {envitations.length}
                                </h3>
                                <Bell size={30}/>
                            </button>
                        </div>

                        {
                            showInvites && <div className="bg-primary h-52 w-96 absolute -bottom-52 rounded-md p-2 z-10 right-0 overflow-auto">
                                <p className="text-white mb-4">Notificações</p>
                                <ul>
                                    {envitations.map(e=><li className="flex justify-between items-center bg-white p-2 rounded-md mb-2">
                                        <p className="text-sm">{e.user.nome+' '+e.user.sobrenome} convidado-o para uma reunião.</p>
                                        <button onClick={()=>requestJoinMeeting(user,e.user.id,e.room)}  className="bg-green-600 w-24 h-50 rounded-md ml-4 p-2 text-white text-sm">Entrar</button>
                                    </li>
                                    )}
                                    
                                    
                                </ul>
                            </div>
                        }         

                        {
                            responseToJoinMeeting && <div className="bg-primary h-52 w-96 absolute -bottom-52 rounded-md p-2 z-10 right-0 overflow-auto flex flex-col">
                                <button className="text-red-300 text-2xl font-bold text-center self-end pr-2" onClick={()=>setResponseToJoinMeeting(null)}><span>x</span></button>
                                <p className="text-white text-lg mt-8 font-bold">{responseToJoinMeeting}</p>
                            </div>
                        }         
                            
                    </header>
                        {
                            children
                        }
                    <footer>
                        <h1 className="font-bold text-center py-2">&copy; Todos direitos reservados ao SISM - 2024</h1>
                    </footer>           
                </div>
            </div>
    )
}