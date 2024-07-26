import { Image, Microphone, Paperclip, PaperPlaneRight, Stop, VideoCamera } from "@phosphor-icons/react";
import { VideoRoomMeeting } from "./VideoRoomMeeting";
import rejectcall from '../assets/rejectcall.png'
import acceptcall from '../assets/acceptcall.png'
import record_audio from '../assets/record_audio.gif'
import chamando from '../assets/phone-call-14472.mp3'
import novaChamada from '../assets/ringing-151670.mp3'
import userplaceholderimage from '../assets/userplaceholderimage.png'
import { useEffect, useRef, useState } from "react";
import styles from './ChatRoom.module.css';


export const ChatRoom = ({selectedUser,userLoggedIn,socket})=>{

    console.log('user',selectedUser,userLoggedIn)
    const [messages,setMessages] = useState([]);
    const [room,setRoom] = useState(null);
    const [invite,setInvite] = useState(null);
    const [text,setText] = useState(null);
    const messagesEndRef = useRef(null);
    const mediaFileInputRef = useRef(null);
    const documentFileInputRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [selectedFileToView, setSelectedFileToView] = useState(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const [videoCallStatus,setVideoCallStatus] = useState('no call');
    const audioRef = useRef(null);
    const [appId,setAppId] = useState('374ae075f2d74cdd8799f0aaa1689c44');


    const sendMessage = ()=>{
        const d = new Date();

          setMessages(prev=>[...prev,{
              id:d,
              cod_user_reciever:selectedUser.id,
              cod_user_sender:userLoggedIn?.id,
              created_at:d.getDay() +'-'+d.getMonth()+'-'+d.getFullYear() + ' '+ d.getHours()+':'+d.getMinutes(),
              text}]
          );
          socket.emit('send message to the participant',{nome:userLoggedIn?.nome,sobrenome:userLoggedIn?.sobrenome,cod_user_sender:userLoggedIn?.id,cod_user_reciever:selectedUser.id,text});
          setText('');        
    }

    const acceptCallHandler = ()=>{
        setRoom(invite.channel);
        setVideoCallStatus('in a call')
        socket.emit('call accepted',{user:invite.user.id})

    }

    const handleUploadClick = (file) => {
        file.current.click();
    };
    

    const handleFileUploadChange = async (e) => {

        const file = e.target.files[0];
    
        if (!file) {
          return;
        }
        
            if(file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'application/pdf'){

                const reader = new FileReader();

                reader.onload = () => {

                    const d = new Date();

                    setMessages(prev=>[...prev,{
                        id:d,
                        cod_user_reciever:selectedUser.id,
                        cod_user_sender:userLoggedIn?.id,
                        created_at:d.getDay() +'-'+d.getMonth()+'-'+d.getFullYear() + ' '+ d.getHours()+':'+d.getMinutes(),
                        text:'',
                        file:reader.result,
                        file_type:file.type
                        }]
                    );

                    if(file.type == 'image/jpeg' || file.type == 'image/png')
                        socket.emit('send image from web to the participant',
                            (
                                {
                                    nome:userLoggedIn?.nome,sobrenome:userLoggedIn?.sobrenome,cod_user_sender:userLoggedIn?.id,cod_user_reciever:selectedUser.id,
                                    file,text:'',file_type:file.type
                                }
                            )
                        );


                    if(!file.type.includes('image/'))
                        {
                            socket.emit('send doc from web to the participant',
                            (
                                {
                                    nome:userLoggedIn?.nome,sobrenome:userLoggedIn?.sobrenome,cod_user_sender:userLoggedIn?.id,cod_user_reciever:selectedUser.id,
                                    file,text:'',file_type:file.type
                                }
                            )
                        );
                    }
                };

                reader.readAsDataURL(file);
            }

    };

    const rejectCallHandler = ()=>{
        socket.emit('reject call',{user:invite.user.id})
        setVideoCallStatus('no call')
    }

    const turnOffTheCallHandler = ()=>{
        setRoom('');
        setVideoCallStatus('no call');
       socket.emit('video call invite aborted',{user:{nome:userLoggedIn?.nome,sobrenome:userLoggedIn?.sobrenome,id:userLoggedIn?.id},guest:selectedUser.id});

    }

    const startRecording = async () => {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.start();
        setIsRecording(true);
  
        mediaRecorder.current.ondataavailable = event => {
          audioChunks.current.push(event.data);
        };
      };

    const stopRecording = () => {

        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
          const audioURL = URL.createObjectURL(audioBlob);
          audioChunks.current = [];
        
          const d = new Date();

          setMessages(prev=>[...prev,{
                id:d,
                cod_user_reciever:selectedUser.id,
                cod_user_sender:userLoggedIn?.id,
                created_at:d.getDay() +'-'+d.getMonth()+'-'+d.getFullYear() + ' '+ d.getHours()+':'+d.getMinutes(),
                text:'',
                file:audioURL,
                file_type:'audio/mp3'
            }]
        );

            socket.emit('send audio from web to the participant',
                (
                    {
                        nome:userLoggedIn?.nome,sobrenome:userLoggedIn?.sobrenome,cod_user_sender:userLoggedIn?.id,cod_user_reciever:selectedUser.id,
                        file:audioBlob,text:'',file_type:'audio/mp3'
                    }
                )
            );
        }

        setIsRecording(false);
    };

    const startVideoCall = ()=>{
        if(videoCallStatus == 'no call' || videoCallStatus == 'call rejected' || videoCallStatus=='video call invitation aborted'){
            const channel = `channel${userLoggedIn?.id}${selectedUser.id}`;
            setRoom(channel);
            setVideoCallStatus('started a call')
            socket.emit('invite user to video call',{user:{nome:userLoggedIn?.nome,sobrenome:userLoggedIn?.sobrenome,id:userLoggedIn?.id},channel,guest:selectedUser.id});
            /*if (audioRef.current) {
                audioRef.current.load();
                audioRef.current.play().catch(error => {
                });
            }*/
        }
    }

    useEffect(()=>{
        socket.on('new user to user message',({cod_user_sender,text,created_at,file,file_type})=>{

            if(messages.length && selectedUser?.id == cod_user_sender){

                setMessages([...messages,{
                    id:new Date(),
                    cod_user_reciever:selectedUser.id,
                    cod_user_sender,created_at,
                    file,
                    file_type,
                    text}])

            }else if(selectedUser?.id==cod_user_sender){
                
                setMessages({
                    id:new Date(),
                    cod_user_reciever:selectedUser.id,
                    cod_user_sender,created_at,
                    file,
                    file_type,
                    text})
            }

          });
          
    },[messages,selectedUser])

    const viewFileHandler = (file_type,file)=>{
        if(file_type == 'image/jpeg' || file_type == 'image/png' || file_type == 'application/pdf')
            setSelectedFileToView({
                file_type,
                file
            })
    }

    
    

      useEffect(()=>{
        socket.on("messages loaded",(data)=>{
            setMessages(data.messages);
        })
        socket.on("video call invite",({channel,user})=>{
            if(videoCallStatus == 'no call'){
                setInvite({channel,user})
                setVideoCallStatus('new call invitation')
            }
        });

        socket.on("video call invitation aborted",()=>{
                setInvite(null)
                setVideoCallStatus('video call invitation aborted')
        });

        socket.on("call rejected",()=>{
            setVideoCallStatus('call rejected') 
            setRoom(null)                
        });

        socket.on("call accepted",()=>{
            setVideoCallStatus('in a call')               
        });

        
      },[videoCallStatus])
    
      const scrollToBottom = () => {
        if (messagesEndRef.current && messages.length>0) {
          messagesEndRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth'});
        }
      };

      useEffect(() => {
        
        scrollToBottom();
      }, [messages]);

      

    

      const renderChatMessages = (messages) => {
        return messages.map(({id,file,cod_user_sender,created_at,text,file_type}) => <div
                className={cod_user_sender == userLoggedIn?.id ? `h-fit w-fit p-2 rounded-lg bg-primary text-white self-end my-4`:`h-fit w-fit p-2 bg-opacity-75 rounded-lg bg-green-600 text-white my-4`}
                key={id}
                >
                    
                    <button onClick={()=>viewFileHandler(file_type,file)}>
                            {
                                (file_type == 'image/jpeg' || file_type == 'image/png')  && <img src={file} className="w-20 h-20 object-cover"/>
                            }
                            {
                                file_type == 'audio/mp3' && <audio controls src={file}></audio>
                            }
                            {
                                file_type == 'application/pdf' &&  <embed src={file} type="application/pdf" className="h-300 w-300" />
                            }
                            <p>{text}</p>
                            <p className="text-xs text-right">{created_at}</p>  
                    </button>
                             
                    
                </div>
            
        )
      }

    return (
            <div className="flex-1 flex flex-col h-full p-4 pb-2 relative">
                {selectedFileToView && <div className="w-full h-full z-10 absolute flex justify-center items-center">
                    <div className="w-1/2 h-1/2 bg-white relative rounded-xl overflow-hidden">
                        <button className="absolute z-10 right-10 top-5 font-bold text-xl" title="Fechar" onClick={()=>setSelectedFileToView(null)}>
                            x
                        </button>
                        {
                            (selectedFileToView.file_type == 'image/jpeg' || selectedFileToView.file_type == 'image/png') &&
                            <img
                                className="w-full h-full object-contain"
                                src={selectedFileToView.file} 
                            /> 
                        }

                        {
                            selectedFileToView.file_type == 'application/pdf' &&
                            <embed src={selectedFileToView.file} type="application/pdf" className="h-full w-full" />
                        }
                    </div>
                </div>}
                {userLoggedIn?.nome && <div className="flex justify-between h-10 items-center relative">
                    <h1 className="flex items-center gap-2 text-sm">
                        <img
                            className="w-8 h-8 rounded-full object-cover"
                            src={userplaceholderimage} 
                        />
                        {selectedUser.nome+'  '+selectedUser.sobrenome}
                    </h1>

                    <button onClick={startVideoCall}>
                        <VideoCamera size={32} className="hover:text-primary"/>
                    </button>

                    {videoCallStatus == 'new call invitation' && <div className="w-fit h-fit p-2 z-10 rounded-md absolute top-0 right-24 bg-primary">
                        <p className="text-white font-semibold text-lg">Nova video chamada de:</p>
                        <div className="flex items-center my-6 justify-center">
                            <img
                                className="w-6 h-6 rounded-full object-cover"
                                src={userplaceholderimage} 
                            />
                            <p className="ml-2 text-white font-semibold text-sm">{invite.user.name}</p>
                            
                        </div>
                        <div className="flex items-center flex-1 justify-evenly">
                                <button onClick={acceptCallHandler}>
                                    <img
                                        className="w-8 h-8 rounded-full object-cover"
                                        src={acceptcall} 
                                    />
                                </button>
                                <button onClick={rejectCallHandler} className="-rotate-90">
                                    <img
                                        className="w-8 h-8 rounded-full object-cover"
                                        src={rejectcall} 
                                    />
                                </button>


                            </div>
                    </div>
                    }

                    {(videoCallStatus == 'started a call' || videoCallStatus == 'started a call') && <div className="w-fit h-fit p-2 z-10 rounded-md absolute top-0 right-24 bg-primary">
                        <p className="text-white font-semibold text-lg">{videoCallStatus == 'started a call' ? 'Ligando para:' : 'Chamada rejeitada'}</p>
                        <div className="flex items-center my-6 justify-center">
                            <img
                                className="w-6 h-6 rounded-full object-cover"
                                src={userplaceholderimage} 
                            />
                  
                            <p className="ml-2 text-white font-semibold text-sm">{selectedUser?.nome+' '+selectedUser.sobrenome}</p>
                            <div className="flex items-center flex-1 justify-end ml-4">                                    
                                
                                <button onClick={turnOffTheCallHandler} className="-rotate-90">
                                    <img
                                        className="w-8 h-8 rounded-full object-cover"
                                        src={rejectcall} 
                                    />
                                </button>

                        </div>
                            
                        </div>
                        
                    </div>
                    }
                </div>
                }
                {videoCallStatus != 'in a call' && <div 
                    className={`my-2 flex-1 flex flex-col overflow-y-auto ${styles.messageListContainer} w-full`}
                    ref={messagesEndRef}
                >
                    {
                         messages && renderChatMessages(messages)
                    }
                    
                </div>
                }
                {
                    videoCallStatus == 'in a call' && <VideoRoomMeeting appId={appId} channel={room} onTornOffCall={turnOffTheCallHandler}/>
                
                }
                    <audio controls src={videoCallStatus=='started a call'?chamando:novaChamada} ref={audioRef} className="hidden" loop/>
                    {isRecording && 
                        <div className="w-full flex justify-start items-center mb-2">
                            <img src={record_audio} className="h-10 w-10 rounded-full"/><p className="ml-1 text-sm">Gravando...</p>
                        </div>
                    }
                    { (userLoggedIn?.nome && videoCallStatus != 'in a call')&& <div className="flex gap-2 h-10 items-center">

                    <div className="flex w-full bg-white rounded-xl px-4 py-1 items-center gap-4">
                        <textarea 
                            rows={1} 
                            className="flex-1 resize-none outline-none overflow-y-hidden"
                            placeholder="Escreva a sua mensagem"
                            value={text}
                            onChange={(e)=>setText(e.target.value)}
                        ></textarea>
                        <input
                            type="file"
                            ref={mediaFileInputRef}
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileUploadChange}
                        />
                        <input
                            type="file"
                            ref={documentFileInputRef}
                            accept="application/pdf, .doc, .docx"
                            className="hidden"
                            onChange={handleFileUploadChange}
                        />
                        <button onClick={()=>handleUploadClick(documentFileInputRef)}>
                            <Paperclip size={25} className="hover:text-primary"/>
                        </button>
                        <button onClick={()=>handleUploadClick(mediaFileInputRef)}>
                            <Image size={25} className="hover:text-primary"/>
                        </button>
                        <button onClick={sendMessage}>
                            <PaperPlaneRight size={25} className="hover:text-primary"/>
                        </button>
                    </div>
                    {
                        !isRecording && <button 
                        className="w-7 h-7 bg-primary rounded-full flex justify-center items-center"
                        onClick={startRecording}
                    
                    >
                            <Microphone size={20} className="hover:text-white"/>
                    </button>
                    }
                    {
                        isRecording && <button 
                            className="w-7 h-7 bg-primary rounded-full flex justify-center items-center"
                            onClick={stopRecording}                        
                        >
                            <Stop size={20} className="hover:text-white"/>
                        </button>
                    }
                </div>}
                


                
            </div>
    );
}