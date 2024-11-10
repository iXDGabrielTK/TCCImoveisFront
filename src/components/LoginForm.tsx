/* src/components/LoginForm.tsx */
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import api from "../services/api.ts";
import '../styles/Login.css';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function handleCreateUser(e: FormEvent) {
        e.preventDefault();
        const data = {
            login: username,
            senha: password
        }
        await api.post('/usuarios/login', data)
            .then(() => {
                console.log("Login bem-sucedido! Usuário autenticado.");
            }).catch(error => {
                console.log(error);
            });
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={ (e) => handleCreateUser(e) }>
                <h2>USER LOGIN</h2>
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">LOGIN</button>
                <div className="register-link">
                    Não tem uma conta? <Link to="/register">Cadastre-se</Link>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
