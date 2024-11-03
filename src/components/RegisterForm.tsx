// src/components/RegisterForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterDataMutate } from '../hooks/useRegisterUser';

const RegisterForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('visitante');

  const { mutate, isPending, isError, isSuccess } = useRegisterDataMutate();
  const navigate = useNavigate();

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    mutate({ nome, telefone, login, senha, tipo });
  };

  useEffect(() => {
    if (isSuccess) {
      navigate('/login');
    }
  }, [isSuccess, navigate]);

  return (
    <form onSubmit={handleRegister} className="register-form">
      <h2>Registrar Usuário</h2>
      <label>
        Nome:
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
      </label>
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
