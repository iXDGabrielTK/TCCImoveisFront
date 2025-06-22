import React, { useState } from 'react';
import api from '../services/api';
import {FaUser, FaPhone, FaLock, FaEye, FaEyeSlash} from 'react-icons/fa';
import {Link, useNavigate} from "react-router-dom";
import InputMask from "react-input-mask";

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
    const [senhaError, setSenhaError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [telefoneError, setTelefoneError] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    const validateTelefone = (telefone: string) => {
        return /^(\(\d{2}\)\s?)?(\d{4,5})[- ]?(\d{4})$/.test(telefone);
    };

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();

        let hasError = false;
        if (!validateEmail(email)) {
            setEmailError('E-mail inválido.');
            hasError = true;
        } else {
            setEmailError('');
        }
        if (!validateTelefone(telefone)) {
            setTelefoneError('Telefone inválido.');
            hasError = true;
        } else {
            setTelefoneError('');
        }
        if (senha !== confirmarSenha) {
            setSenhaError("As senhas não coincidem.");
            hasError = true;
        } else {
            setSenhaError('');
        }
        if (hasError) return;

        const telefoneLimpo = telefone.replace(/\D/g, '');

        const data: RegistrationData = {
            nome,
            telefone: telefoneLimpo,
            email,
            senha,
            tipo: "visitante",
        };

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

            <div className={`input-group${nome === '' && isError ? ' input-error' : ''}`}>
                <FaUser className="icon" />
                <input
                    id="nome"
                    type="text"
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    aria-label="Nome"
                />
            </div>

            <div className={`input-group${telefoneError ? ' input-error' : ''}`}>
                <FaPhone className="icon" />
                <InputMask
                    mask="(99) 99999-9999"
                    value={telefone}
                    placeholder="Telefone"
                    onChange={(e) => setTelefone(e.target.value)}
                >
                    {(inputProps) => (
                        <input
                            {...inputProps}
                            type="text"
                            placeholder="Telefone"
                            required
                            aria-label="Telefone"
                            className="seu-estilo"
                        />
                    )}
                </InputMask>
            </div>
            {telefoneError && <p className="error-message">{telefoneError}</p>}

            <div className={`input-group${emailError ? ' input-error' : ''}`}>
                <FaUser className="icon" />
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email"
                />
            </div>
            {emailError && <p className="error-message">{emailError}</p>}

            <div className={`input-group senha-group${senhaError ? ' input-error' : ''}`}>
                <FaLock className="icon" />
                <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    aria-label="Senha"
                />
                {mostrarSenha ? (
                    <FaEye className="icon-eye" onClick={() => setMostrarSenha(false)} />
                ) : (
                    <FaEyeSlash className="icon-eye" onClick={() => setMostrarSenha(true)} />
                )}
            </div>

            <div className={`input-group senha-group${senhaError ? ' input-error' : ''}`}>
                <FaLock className="icon" />
                <input
                    id="confirmarSenha"
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    placeholder="Confirmar Senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    aria-label="Confirmar Senha"
                />
                {mostrarConfirmarSenha ? (
                    <FaEye className="icon-eye" onClick={() => setMostrarConfirmarSenha(false)} />
                ) : (
                    <FaEyeSlash className="icon-eye" onClick={() => setMostrarConfirmarSenha(true)} />
                )}
            </div>

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