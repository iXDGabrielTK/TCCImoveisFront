import React, { useState } from 'react';
import api from '../services/api';
import { FaUser, FaPhone, FaLock } from 'react-icons/fa';

const RegisterForm: React.FC = () => {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [tipo, setTipo] = useState(true);
    const [cpf, setCpf] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();

        // Dados comuns a todos os usuários
        const data: any = {
            nome,
            telefone,
            login,
            senha,
            tipo: tipo ? "visitante" : "funcionario", // Determina o tipo de usuário
        };

        // Adiciona o CPF somente se for funcionário
        if (!tipo) {
            data.cpf = cpf;
        }

        try {
            setIsPending(true);
            setIsError(false);
            setIsSuccess(false);

            await api.post("/usuarios", data); // Envia para o endpoint /usuarios
            setIsSuccess(true);
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            setIsError(true);
        } finally {
            setIsPending(false);
        }
    };


    return (
        <form onSubmit={handleRegister} className="register-form">
            <h2>Registrar Usuário</h2>
            <div className="input-group">
                <FaUser className="icon" />
                <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="input-group">
                <FaUser className="icon" />
                <select
                    value={tipo ? "Visitante" : "Funcionário"}
                    onChange={(e) => setTipo(e.target.value === "Visitante")}
                    required
                >
                    <option value="Visitante">Visitante</option>
                    <option value="Funcionário">Funcionário</option>
                </select>
            </div>
            {!tipo && (
                <div className="input-group">
                    <FaUser className="icon" />
                    <input type="text" placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                </div>
            )}
            <div className="input-group">
                <FaPhone className="icon" />
                <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
            </div>
            <div className="input-group">
                <FaUser className="icon" />
                <input type="text" placeholder="Login" value={login} onChange={(e) => setLogin(e.target.value)} required />
            </div>
            <div className="input-group">
                <FaLock className="icon" />
                <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>
            <button type="submit" disabled={isPending}>Registrar</button>
            {isError && <p className="error-message">Erro ao registrar usuário. Tente novamente.</p>}
            {isSuccess && <p className="success-message">Usuário registrado com sucesso!</p>}
        </form>
    );
};

export default RegisterForm;
