'use client';

import{useState,useEffect} from 'react';

interface LoginRequest {
    username: string;
    password: string;
    csrfToken: string;
}

export default function Login (){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const getCsrfToken = async () => {
            const response = await fetch('http://localhost:3000/csrf-token');
            const data = await response.json();
            setCsrfToken(data.csrfToken);
        };
        getCsrfToken();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            const request: LoginRequest = {username, password, csrfToken};
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });
            const data = await response.json();
            if(data.error){
                alert(data.error);  
                return;
            }
            alert(data.message || 'Sesion iniciada');
        }catch(error){
        alert('Error al iniciar sesion'); 
        }  
     };

    return(
        <div>  
            <h2>Login</h2> 
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='username'>Usuario:</label>
                    <input type="text" id="username" onChange={(e)=>setUsername(e.target.value)} required autoFocus />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input type="password" id="password" onChange={e => setPassword(e.target.value)} required />
                </div>
                {/* CSRF token */}
                <input type="hidden" id="csrfToken" value={csrfToken}/>
                <button type="submit">Iniciar sesion</button>
            </form>
        </div>
    );
}