import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterImobiliaria.css';

const ImobiliariaForm: React.FC = () => {
    const [nome, setNome] = useState('');
    const [razaoSocial, setRazaoSocial] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [email, setEmail] = useState('');
    const [cep, setCep] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.post('/api/imobiliarias', {
                nome,
                razaoSocial,
                cnpj,
                email,
                cep,
            });
            setIsSuccess(true);
            setIsError(false);
            navigate('/imobiliarias');
        } catch (error) {
            console.error('Erro ao cadastrar imobiliária:', error);
            setIsError(true);
            setIsSuccess(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-imobiliaria-form">
            <h2>Cadastrar Imobiliária</h2>

            <div className="input-group">
                <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="input-group">
                <input placeholder="Razão Social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required />
            </div>
            <div className="input-group">
                <input placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
            </div>
            <div className="input-group">
                <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
                <input placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} required />
            </div>

            <button type="submit">Cadastrar</button>

            {isSuccess && <p className="success-message">Imobiliária cadastrada com sucesso!</p>}
            {isError && <p className="error-message">Erro ao cadastrar. Verifique os dados e tente novamente.</p>}
        </form>
    );
};

export default ImobiliariaForm;
