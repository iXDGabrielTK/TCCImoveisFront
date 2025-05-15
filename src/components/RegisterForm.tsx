import React, { useState } from 'react';
import api from '../services/api';
import {FaUser, FaPhone, FaLock, FaEye, FaEyeSlash} from 'react-icons/fa';
import {Link, useNavigate} from "react-router-dom";

interface RegistrationData {
    nome: string;
    telefone: string;
    email: string;
    senha: string;
    tipo: string;
    cpf?: string;
}

const RegisterForm: React.FC = () => {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [tipo, setTipo] = useState(true);
    const [cpf, setCpf] = useState('');
    const [cpfError, setCpfError] = useState('');
    const [senhaError, setSenhaError] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    function isValidCPF(value: string) {
        value = value.replace(/[^\d]+/g, '');
        if (value.length !== 11 || !!value.match(/(\d)\1{10}/)) return false;
        const digits = value.split('').map(el => +el);
        const getVerifyingDigit = (arr: number[]) => {
            const reduced = arr.reduce((sum, digit, index) => sum + digit * (arr.length + 1 - index), 0);
            return (reduced * 10) % 11 % 10;
        };
        return getVerifyingDigit(digits.slice(0, 9)) === digits[9] &&
            getVerifyingDigit(digits.slice(0, 10)) === digits[10];
    }

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();

        if (senha !== confirmarSenha) {
            setSenhaError("As senhas não coincidem.");
            return;
        }
        setSenhaError('');

        const data: RegistrationData = {
            nome,
            telefone,
            email,
            senha,
            tipo: tipo ? "visitante" : "funcionario",
        };

        if (!tipo) {
            if (!isValidCPF(cpf)) {
                setCpfError('CPF inválido. Por favor, verifique os números digitados.');
                return;
            }
            data.cpf = cpf;
            setCpfError('');
        }

        try {
            setIsPending(true);
            setIsError(false);
            setIsSuccess(false);
            await api.post("/usuarios", data);
            setIsSuccess(true);
            navigate('/login');
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
                <input
                    type="text"
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                />
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
                    <input
                        type="text"
                        id="cpf"
                        placeholder="CPF"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                    />
                </div>
            )}

            <div className="input-group">
                <FaPhone className="icon" />
                <input
                    type="text"
                    placeholder="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                />
            </div>

            <div className="input-group">
                <FaUser className="icon" />
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="input-group senha-group">
                <FaLock className="icon" />
                <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />
                {mostrarSenha ? (
                    <FaEye className="icon-eye" onClick={() => setMostrarSenha(false)} />
                ) : (
                    <FaEyeSlash className="icon-eye" onClick={() => setMostrarSenha(true)} />
                )}
            </div>

            <div className="input-group senha-group">
                <FaLock className="icon" />
                <input
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    placeholder="Confirmar Senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                />
                {mostrarConfirmarSenha ? (
                    <FaEye className="icon-eye" onClick={() => setMostrarConfirmarSenha(false)} />
                ) : (
                    <FaEyeSlash className="icon-eye" onClick={() => setMostrarConfirmarSenha(true)} />
                )}
            </div>

            {cpfError && <p className="error-message">{cpfError}</p>}
            {senhaError && <p className="error-message">{senhaError}</p>}
            {isError && <p className="error-message">Erro ao registrar usuário. Tente novamente.</p>}
            {isSuccess && <p className="success-message">Usuário registrado com sucesso!</p>}

            <button type="submit" disabled={isPending}>
                {isPending ? "Registrando..." : "Registrar"}
            </button>
            <div className="login-link">
                Já possui uma conta? <Link to="/login">Entre aqui</Link>
            </div>
        </form>
    );
};

export default RegisterForm;
