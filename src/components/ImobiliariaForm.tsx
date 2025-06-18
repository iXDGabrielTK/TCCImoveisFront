import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterImobiliaria.css'
import InputMask from 'react-input-mask';

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
            await api.post('/imobiliaria/candidatura', {
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
        <form onSubmit={handleSubmit} className="imobiliaria-form-grid">
            <h2>Dados de cadastro</h2>

            <fieldset>
                <legend>Sobre você</legend>
                <div className="grid">
                    <div className="form-group">
                        <label htmlFor="nome">Nome completo sem abreviações</label>
                        <input
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Insira seu nome"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cargo">Seu cargo na imobiliária</label>
                        <input
                            id="cargo"
                            placeholder="Insira seu cargo atual"
                        />
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>Sobre a empresa</legend>
                <div className="grid" style={{ alignItems: "end" }}>
                    <div className="form-group">
                        <label htmlFor="razaoSocial">Razão social sem abreviações</label>
                        <input
                            id="razaoSocial"
                            value={razaoSocial}
                            onChange={(e) => setRazaoSocial(e.target.value)}
                            placeholder="Insira a razão social"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cnpj">CNPJ</label>
                        <InputMask
                            mask="99.999.999/9999-99"
                            maskChar="_"
                            value={cnpj}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCnpj(e.target.value)}
                        >
                            {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                                <input
                                    {...inputProps}
                                    type="text"
                                    id="cnpj"
                                    placeholder="Insira o CNPJ"
                                    inputMode="numeric"
                                    pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
                                />
                            )}
                        </InputMask>

                    </div>


                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Insira seu e-mail"
                            required
                        />
                    </div>

                    <div className="cep-wrapper">
                        <div className="form-group">
                            <label htmlFor="cep">CEP</label>
                            <InputMask
                                mask="99999-999"
                                maskChar="_"
                                value={cep}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCep(e.target.value)}
                            >
                                {(inputProps) => (
                                    <input
                                        {...inputProps}
                                        type="text"
                                        id="cep"
                                        placeholder="Digite seu CEP"
                                        inputMode="numeric"
                                        pattern="\d{5}-\d{3}"
                                    />
                                )}
                            </InputMask>
                        </div>

                        <a
                            href="https://buscacepinter.correios.com.br/app/endereco/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cep-link"
                        >
                            não sei o meu CEP
                        </a>
                    </div>

                </div>
            </fieldset>

            <button type="submit">Solicitar</button>

            {isSuccess && <p className="success-message">Solicitação de Imobiliária enviada com sucesso!</p>}
            {isError && <p className="error-message">Erro ao Solicitar. Verifique os dados e tente novamente.</p>}
        </form>
    );
};

export default ImobiliariaForm;
