import {FormEvent, useState} from 'react';
import { Link } from 'react-router-dom';
import api from "../services/api.ts";

function LoginForm () {
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
        <>
            <form className="login-form" onSubmit={ (e) => handleCreateUser(e) }>
                <h2>Login</h2>
                <label>
                    Username:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Login</button>
                <label className="register-link">
                    Não tem Login? <Link to="/register">Crie um!</Link>
                </label>
            </form>
        </>
    );
}
export default LoginForm;
