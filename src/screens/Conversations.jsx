import { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthProvider";
import meeting from '../assets/meeting.png'
import { UsersConversation } from "../components/UsersConversation";
import { useSocket } from "../contexts/SocketProvider";
import { ChatRoom } from "../components/ChatRoom";




export const Conversations = ()=>{
    const [userSelectedToChatWith, setUserSelectedToChatWith] = useState({});   
    const {user} = useAuth();
    const {socket} = useSocket();
    



    /*const endACall=()=>{
        setRoom('');
        setVideoCallStatus('no call');
        socket.emit('call ended',{user:invite.user.id})
    }*/   

    const selectUserToChatWith = (selectedUser)=>{
        console.log(selectedUser)
        const {id,nome,sobrenome,foto} = selectedUser;
        setUserSelectedToChatWith({id,nome,sobrenome,foto})
        socket.emit("load messages user to user web",{cod_user_sender:user?.id,cod_user_reciever:id});
    }

    

    return (
        <AppLayout >
            <div className="flex-1 flex overflow-hidden justify-center items-center shadow-md rounded-xl bg-white bg-opacity-50 mx-4">
                <UsersConversation onSelectUser={selectUserToChatWith} userLoggedIn={user}/>
                {!userSelectedToChatWith?.id ?
                    <div className="flex-1 flex flex-col m-auto items-center">
                        <img src={meeting} className="w-52 h-52 object-cover rounded-full"/>
                
                        <h2 className="text-center text-2xl font-bold mt-4">Conversas privadas e seguras{userSelectedToChatWith?.name}oo</h2>
                    </div>:
                    <ChatRoom selectedUser={userSelectedToChatWith} userLoggedIn={user} socket={socket}/>
                }
            </div>



            

        </AppLayout>
    )
}