'use client';

import { useState, useEffect } from 'react';

interface RegisterRequest {
    username: string;
    password: string;
    csrfToken: string;
}

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const getCsrfToken = async () => {
            try {
                const response = await fetch('http://localhost:3000/csrf-token');
                const data = await response.json();
                setCsrfToken(data.csrfToken);
            } catch (error) {
                console.error('Error al obtener el token CSRF:', error);
            }
        };
        getCsrfToken();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Verificar que las contraseñas coincidan antes de enviar al servidor
        if (password !== password2) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const request: RegisterRequest = { username, password, csrfToken };
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });
            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return;
            }
            alert(data.message || 'Registro exitoso');
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            alert('Error al registrar usuario');
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Nombre de usuario:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password2">Confirmar contraseña:</label>
                    <input
                        type="password"
                        id="password2"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
}