import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import {FaUser, FaLock, FaEye, FaEyeSlash} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';
import LoadingText from "./LoadingText.tsx";

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const { login, error, loading } = useAuth();

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        await login(email, password);
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                <h2></h2>
                <h2></h2>
                <h2></h2>
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="input-group senha-group">
                    <FaLock className="icon" />
                    <input
                        type={mostrarSenha ? 'text' : 'password'}
                        placeholder="Senha"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    {mostrarSenha ? (
                        <FaEye className="icon-eye" onClick={() => setMostrarSenha(false)} />
                    ) : (
                        <FaEyeSlash className="icon-eye" onClick={() => setMostrarSenha(true)} />
                    )}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? <LoadingText /> : 'LOGIN'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div className="register-link">
                    Não tem uma conta? <Link to="/register">Cadastre-se</Link>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
