// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

type PrivateRouteProps = {
    children: React.ReactElement;
    requiredRole?: string; // Permite verificar o tipo de usuário (ex.: "funcionario")
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    const tipoUsuario = localStorage.getItem('tipoUsuario'); // Obtém o tipo de usuário

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && tipoUsuario !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
