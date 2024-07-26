import { useEffect, useState, useRef } from "react";
import { ArrowLeft, MagnifyingGlass, PlusSquare } from "@phosphor-icons/react";
import { backend_crud } from "../helpers/env";
import userplaceholderimage from '../assets/userplaceholderimage.png';
import { useSocket } from "../contexts/SocketProvider";

export const UsersConversation = ({ onSelectUser, userLoggedIn }) => {
    const [startNewConversation, setStartNewConversation] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [usersThatNeverTalked, setUsersThatNeverTalked] = useState([]);
    const [usersThatTalked, setUsersThatTalked] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const { socket } = useSocket();
    const conversationsRef = useRef(conversations);

    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    const selectUserHandler = ({ id, nome, sobrenome, foto }) => {
        setConversations(prevConversations => {
            return prevConversations.map(c => {
                if (c.id === id) {
                    return {
                        ...c, unreadMessages: 0
                    }
                }
                return c;
            });
        });
        setSelectedUser(id);
        onSelectUser({ id, nome, sobrenome, foto });
    }

    const renderUsersList = (users) => {
        return users.map(({ id, nome, sobrenome, foto, unreadMessages }) => (
            <li 
                className="bg-white mb-4 w-full h-fit p-1 rounded-lg flex justify-between items-center border-2"
                key={id}
            >
                <button className="flex gap-2 items-center w-full" onClick={() => selectUserHandler({ id, nome, sobrenome, foto })}>
                    <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={userplaceholderimage} 
                    />
                    <span>{nome + ' ' + sobrenome}</span>
                    <div className="flex-1">
                        {unreadMessages > 0 && <span className="bg-primary text-white w-7 h-7 rounded-full flex justify-center items-center ml-auto">{unreadMessages}</span>}
                    </div>
                </button>                    
            </li>
        ));
    }

    const onSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredConversations =
        searchQuery === ""
            ? conversations
            : conversations.filter((user) => (user.nome.toLowerCase() + ' ' + user.sobrenome.toLowerCase()).includes(searchQuery));

    useEffect(() => {
        if (userLoggedIn?.id) {
            fetch(`${backend_crud}load_conversations?id_user=${userLoggedIn?.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => response.json())
            .then(data => {
              setConversations(data);
              setUsersThatTalked(data);
            })
            .catch(error => alert('Error:', error));
    
            fetch(`${backend_crud}load_users_never_talked?id_user=${userLoggedIn?.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => response.json())
            .then(data => {
              setUsersThatNeverTalked(data);
            })
            .catch(error => alert('Error:', error));
        }
    }, [userLoggedIn]);

    useEffect(() => {
      
            const handleNewMessage = ({ cod_user_sender, text, image, nome, sobrenome }) => {
                if(conversations.length)
                    setConversations(prevConversations => {
                        const updatedConversations = [...prevConversations];
                        const existingConversationIndex = updatedConversations.findIndex(c => c.id === cod_user_sender);
                        if(cod_user_sender!=selectedUser){

                            if (existingConversationIndex !== -1) {
                                updatedConversations[existingConversationIndex].unreadMessages = (updatedConversations[existingConversationIndex].unreadMessages || 0) + 1;
                            } else {
                                updatedConversations.push({
                                    id: cod_user_sender,
                                    nome: nome,
                                    sobrenome: sobrenome,
                                    foto: userplaceholderimage,
                                    unreadMessages: 1
                                });
                            }
                        }

                        return updatedConversations;
                    });
                else
                    setConversations([{
                        id: cod_user_sender,
                        nome: nome,
                        sobrenome: sobrenome,
                        foto: userplaceholderimage,
                        unreadMessages: 1
                    }])
            };

            socket.on('new user to user message', handleNewMessage);

            return () => {

                socket.off('new user to user message', handleNewMessage);
            };
        
    }, [selectedUser,conversations]);

    return (
        <div className="flex flex-col w-80 h-full bg-white p-4">
            {
                !startNewConversation && 
                <div className="flex justify-between">
                    <h2>Conversas</h2>
                    <button 
                        className="text-primary font-bold flex items-center"
                        onClick={() => {
                            if (usersThatNeverTalked.length) {
                                setConversations(usersThatNeverTalked);
                                setStartNewConversation(true);
                            }
                        }}
                    >
                        <PlusSquare size={20} />Nova Conversa
                    </button>
                </div>
            }

            {
                startNewConversation && 
                <button 
                    className="text-primary font-bold flex items-center w-fit"
                    onClick={() => {
                        if (usersThatNeverTalked.length) {
                            setConversations(usersThatTalked);
                            setStartNewConversation(false);
                        }
                    }}
                >
                    <ArrowLeft size={32}/>
                </button>
            }

            <div className="bg-white h-fit my-4 p-1 rounded-lg flex justify-between">
                <input 
                    className="flex-1 outline-none"
                    type="search" name="search"
                    id="search" placeholder="Buscar usuário" 
                    onChange={onSearch}
                />
                <button type="button">
                    <MagnifyingGlass size={32} className="hover:text-graywhite-600 text-graywhite-300" />
                </button>
            </div>

            <ul className="flex flex-col items-center w-full h-full overflow-y-auto mt-3">
                {conversations.length && renderUsersList(filteredConversations)}
            </ul>                    
        </div>
    );
}
