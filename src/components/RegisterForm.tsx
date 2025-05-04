import React, { useState } from 'react';
import api from '../services/api';
import { FaUser, FaPhone, FaLock } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

interface RegistrationData {
    nome: string;
    telefone: string;
    login: string;
    senha: string;
    tipo: string;
    cpf?: string;
}

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
    const [cpfError, setCpfError] = useState('');
    const navigate = useNavigate();

    function isValidCPF(value: string) {
        if (typeof value !== 'string') return false;
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

        const data: RegistrationData = {
            nome,
            telefone,
            login,
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
            <button type="submit" disabled={isPending}>Registrar</button>

            {cpfError && <p className="error-message">{cpfError}</p>}

            {isError && <p className="error-message">Erro ao registrar usuário. Tente novamente.</p>}
            {isSuccess && <p className="success-message">Usuário registrado com sucesso!</p>}
        </form>
    );
};

export default RegisterForm;
