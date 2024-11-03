// src/pages/Register.tsx
import React from 'react';
import RegisterForm from '../components/RegisterForm';
import '../styles/Register.css';

const Register: React.FC = () => {
  return (
    <div className="register-page">
      <RegisterForm />
    </div>
  );
};

export default Register;
