import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading } = useAuth();

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        await login(email, password);
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>USER LOGIN</h2>
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
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Senha"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'CARREGANDO...' : 'LOGIN'}
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
