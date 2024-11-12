import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import { login as loginService } from "../services/auth"; // Renomeando para evitar conflitos
import '../styles/Login.css';

function LoginForm() {
    const [login, setLogin] = useState(''); // Nome do campo correto para login
    const [senha, setSenha] = useState(''); // Nome do campo correto para senha
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        try {
            await loginService(login, senha); // Chamando o login do serviço com os parâmetros corretos
            console.log("Login bem-sucedido! Usuário autenticado.");
            navigate('/home');
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setError('Credenciais inválidas');
        }
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>USER LOGIN</h2>
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">LOGIN</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="register-link">
                    Não tem uma conta? <Link to="/register">Cadastre-se</Link>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
