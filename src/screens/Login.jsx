import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png'
import { backend_crud } from "../helpers/env";
import axios from "axios";




export const Login = ()=>{

    const {signIn,user} = useAuth();
    const [email,setEmail] = useState('');
    const [senha,setSenha] = useState('');
    const [id,setId] = useState('');
    const navigate = useNavigate();

    const handleSubmitForm = (e)=>{
        e.preventDefault();

        axios.post(`${backend_crud}login`, {
            email,
            password:senha
        },{
            headers:{'Content-Type': 'multipart/form-data'}
        })
          .then(function (response) {
            if(response.data?.id)
                signIn({
                    nome:response.data.nome,
                    sobrenome:response.data.sobrenome,
                    id:response.data.id,
                    foto:'',
                    refresh_token:response.data.refresh_token        
                })
            else
                alert("Erro a fazer login verifique as tuas credenciais!")
                
          })
          .catch(function (error) {
            console.log(error)
            alert('Erro ao se comunicar com o servidor. Tente novamente!')
          });

    }

    useEffect(()=>{

        if(user !== null){

            navigate('/',{replace:true});
        }
    },[navigate,user])



    return (
        <div className="flex bg-graywhite-300 h-dvh justify-center items-center">
            <div className="flex w-1/2 bg-white rounded-lg overflow-hidden h-96">
                    <form action="" className="flex-col flex-1 items-center h-full justify-center p-16" onSubmit={handleSubmitForm}>
                            <h1 className="font-bold text-3xl mb-4">Seja Benvido</h1>
                        <div className="flex-1 mb-4">
                            <label htmlFor="email">
                                Email
                            </label>
                            <input 
                                type="email" placeholder="Insira o teu email"
                                id="email" name="email" value={email} onChange={e=>setEmail(e.target.value)}                               
                                className="w-full p-1 border-2 border-graywhite-300 rounded-lg"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label
                                htmlFor="senha"
                            >
                                Senha
                            </label>
                            <input 
                                type="password" placeholder="Insira a senha"
                                id="senha" name="senha" value={senha} onChange={e=>setSenha(e.target.value)}
                                className="w-full flex-1 p-1 border-2 border-graywhite-300 rounded-lg"
                                required
                            />                            
                        </div>
                        <button className="bg-primary w-full mt-4 p-2 rounded-lg text-white">
                            Login
                        </button>
                    </form>
                <div className="flex flex-1 bg-primary h-full rounded-l-3xl p-10 justify-center items-center">
                    <p>
                        <img
                            src={logo}
                            height={250}
                            width={250}
                        />
                    </p>
                </div>
            </div>
        </div>
    )
}