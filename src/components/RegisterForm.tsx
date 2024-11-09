import React, { useState } from 'react';
import api from '../services/api';

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

        const data = { nome, telefone, login, senha, tipo, ...(tipo ? {} : { cpf }) };
        console.log("Tipo selecionado:", tipo);
        try {
            setIsPending(true);
            setIsError(false);
            setIsSuccess(false);

            if (tipo) {
                await api.post('/visitantes', data);
            } else {
                await api.post('/funcionarios', data);
            }

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
            <label>
                Nome:
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </label>
            <label>
                Tipo de Usuário:
                <select value={tipo ? "Visitante" : "Funcionário"} onChange={(e) => setTipo(e.target.value === "Visitante")} required>
                    <option value="Visitante">Visitante</option>
                    <option value="Funcionário">Funcionário</option>
                </select>
            </label>
            {!tipo && (
                <label>
                    CPF:
                    <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                </label>
            )}
            <label>
                Telefone:
                <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
            </label>
            <label>
                Login:
                <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
            </label>
            <label>
                Senha:
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </label>
            <button type="submit" disabled={isPending}>Registrar</button>

            {isError && <p style={{ color: 'red' }}>Erro ao registrar usuário. Tente novamente.</p>}
            {isSuccess && <p style={{ color: 'green' }}>Usuário registrado com sucesso!</p>}
        </form>
    );
};

export default RegisterForm;