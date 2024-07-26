import { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import meeting from '../assets/meeting.png'
import { useSocket } from "../contexts/SocketProvider";
import { CheckCircle } from "@phosphor-icons/react";
import { VideoRoomMeeting } from "../components/VideoRoomMeeting";
import { useAuth } from "../contexts/AuthProvider";
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import userplaceholderimage from '../assets/userplaceholderimage.png'
import { backend_crud } from "../helpers/env";


export const CreateOrJoinToMeeting = ()=>{

    const [room,setRoom] = useState(null);
    const { id } = useParams();
    const {user} = useAuth();
    const [appId,setAppId] = useState('374ae075f2d74cdd8799f0aaa1689c44');
    const [searchQuery, setSearchQuery] = useState("");
    const [showUsers, setShowUsers] = useState(false);
    const [startVideo, setStartVideo] = useState(false);
    const {socket} = useSocket();
    const [requestsToMeeting,setRequestsToMeeting] = useState([]);
    const [showCreateMeetingDropdown,setShowCreateMeetingDropdown] = useState(false);
    
    const [users, setUsers] = useState([]);

      const showCreateMeetingDropdownHandler = ()=>{
        setShowCreateMeetingDropdown(prev=>!prev);
      }

      const answerToJoinMeetingRequest=(user,feedback)=>{
        const updateRequestsToMeeting = requestsToMeeting.filter(r=>r.id!=user);
        setRequestsToMeeting(updateRequestsToMeeting)
        socket.emit("response to join meeting",{ user,feedback});
      }

      
      const enviteUsers = () => {
        const envitedUsers = users
          .filter((user) => user.selected === true)
          .map((user) => user.id);
    
        if (envitedUsers.length > 0) {
          socket.emit("create meeting", {
            user,
            room,
            guests: envitedUsers
          });
        } else {
          alert("", "A reunião deve ter ao menos um convidado.");
        }
      };

      const onSelectUser = (userId) => {
        const newStateUsers = users.map((user) => {
          if (user.id == userId) {
            return {
              ...user,
              selected: !user.selected,
            };
          }
    
          return user;
        });
    
        setUsers(newStateUsers);
      };
      useEffect(()=>{
        fetch(`${backend_crud}load_all_users_not_me?id_user=${user.id}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json'
          }
        })
        .then(function(response){ 
          return response.json()})
        .then(function(data){
          if(data.length>0){
            setUsers(data)
          }
        })
        .catch(error => alert('Error:', error));
    
      },[]);

    
    useEffect(()=>{

        socket.on("meeting created", ({ status, room, appId, token }) => {
          if(status == 1){
            setStartVideo(true);            
          }
            console.log(status,room,appId,token)
        });

        socket.on("request to join meeting", ({user}) => {
          setRequestsToMeeting(prev=>[...prev,user]);
        });

    },[])

    useEffect(()=>{
      if(id){
        setRoom(id)
        setStartVideo(true)
      }
    },[id])

    const handleOnSearch = (e)=>{
        setSearchQuery(e.target.value)
    }

    const createInstantMeetingHandler = (e)=>{

            setRoom(uuidv4())
            setShowUsers(true);

       
    }

    const tornOffCallHandler = ()=>{
      setStartVideo(false);
    }

    const renderUsersList = (users) => {
        return users.map(({id,nome,sobrenome,foto,selected}) => <li 
                className="bg-white mb-4 w-1/2 h-fit p-4 rounded-lg flex justify-between items-center"
                key={id} onClick={()=>onSelectUser(id)}
                >
                    <div className="flex gap-2 justify-center items-center">
                        <img
                            className="w-10 h-10 rounded-full object-cover"
                            src={userplaceholderimage} 
                        />
                        <span>{nome+' '+sobrenome}</span>
                    </div>
                    {
                        selected && <CheckCircle size={32} className="text-primary"/>
                    }
                </li>
            
        )
      }

      const filteredUsers =
      searchQuery === ""
        ? users
        : users.filter((user) => user.nome.toLowerCase()+' '+user.sobrenome.toLowerCase().includes(searchQuery));

    return (
        <AppLayout showSearchBar={showUsers} searchBarPlaceHolder='Buscar usuarios' onSearch={handleOnSearch}>
          <div className="flex-1 flex overflow-hidden justify-center items-center mx-4 relative">
          {
            requestsToMeeting.length > 0 &&
          <div className="bg-primary h-4/5 w-64 absolute bottom-0 rounded-md p-2 z-10 right-0 overflow-auto">
                <p className="text-white mb-4">Pedidos</p>
                <ul>
                    {requestsToMeeting.map(e=>
                            <li className="flex flex-col justify-between items-center bg-white p-2 rounded-md mb-2">
                                <p className="text-sm">{e.nome+' '+e.sobrenome} deseja ingressar na reunião</p>
                                <div className="flex justify-center mt-4">
                                    <button onClick={()=>answerToJoinMeetingRequest(e.id,false)}  className="bg-red-400 flex-1 h-50 rounded-md ml-4 p-2 text-white text-sm">Rejeitar</button>
                                    <button onClick={()=>answerToJoinMeetingRequest(e.id,true)} className="bg-green-600 flex-1 h-50 rounded-md ml-4 p-2 text-white text-sm">Aceitar</button>
                                </div>
                            </li>
                        
                    )}                                        
                    
                </ul>
              </div>
          }
            { (!showUsers && !startVideo) && <div className="flex flex-col items-center">
                <img
                    src={meeting}
                    className="h-72 rounded-full w-72 object-cover"
                />
                <p className="font-bold text-lg my-4">Crie ou junte-se à reuniões seguras e privadas.</p>
                <div className="flex gap-5 relative h-fit">
                    <button 
                        type="button"
                        className="bg-primary p-2 w-40 rounded-lg text-white font-bold"
                        onClick={showCreateMeetingDropdownHandler}
                    >
                        Criar
                    </button>

                    {
                      showCreateMeetingDropdown &&
                      <div className="bg-white w-50 h-50 flex flex-col py-4 absolute right-0 -top-24">
                        <button 
                            type="button"
                            onClick={createInstantMeetingHandler}
                            className="px-2 text-black  text-sm text-start flex-1 mb-4"

                        >
                            Reunião instantânea
                        </button>
                        <button 
                            type="button"
                            className="px-2 text-black  text-sm text-start flex-1"
                        >
                            Reunião agendada
                        </button>
                    </div>
                    } 

                   
                </div>
               
                </div>

                }

                {
                    (showUsers && !startVideo) &&
                    <div className="flex flex-col items-center w-1/2 self-start">
                        <div className="flex gap-20 my-4 w-full justify-center">
                              <h2 className="font-bold my-4">Convide usuarios</h2>
                              <button 
                                className="bg-primary p-2 rounded-lg text-white"
                                onClick={enviteUsers}
                              >
                                  Entrar para a reunião
                              </button>                        
                        </div> 
                        <ul className="flex flex-col items-center w-full overflow-y-auto">
                            {
                                renderUsersList(filteredUsers)
                            }  
                                         
                        </ul>                      
                    </div>

                }
                {
                  startVideo && <div className="flex-1 flex flex-col h-full p-4 pb-2">
                    <VideoRoomMeeting appId={appId} channel={room} onTornOffCall={tornOffCallHandler}/>
                    </div>
                }
                
          </div>
{
  /*







          
          <div className="flex-1 flex">
               

            {
              startVideo && <VideoRoomMeeting appId={appId} channel={room}/>
            }
            {
              id && <VideoRoomMeeting appId={appId} channel={id}/>
            }
            
            {(!startVideo && !id) && <div className="flex flex-col items-center flex-1 justify-center">
                

                {
                    showUsers &&
                    <>
                        <div className="flex gap-20 my-4 w-full justify-center">
                              <h2 className="font-bold my-4">Convide usuarios</h2>
                              <button 
                                className="bg-primary p-2 rounded-lg text-white"
                                onClick={enviteUsers}
                              >
                                  Entrar para a reunião
                              </button>                        
                        </div> 
                        <ul className="flex flex-col items-center w-full h-[calc(100%-70px)] overflow-y-auto">
                            {
                                renderUsersList(filteredUsers)
                            }               
                        </ul>                      
                    </>

                }
            </div>}
          </div>
        */}
        </AppLayout>
    )
}