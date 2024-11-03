import React from 'react';
import LoginForm from '../components/LoginForm';
import '../styles/Login.css'; 
import api from '../services/api';

const Login: React.FC = () => {
  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await api.post('/usuarios/login', { login: username, senha: password });
      if (response.status === 200) {
        console.log("Login bem-sucedido! Usuário autenticado.");
      }
    } catch (error) {
      console.log("Credenciais inválidas. Tente novamente.");
      console.error("Erro detalhado:", error);
    }
  };

  return (
    <div className="login-page">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default Login;
