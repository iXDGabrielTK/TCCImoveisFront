import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type PrivateRouteProps = {
    children: React.ReactElement;
    requiredRole?: string;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, hasRole, loading } = useAuth();

    // Mostrar um indicador de carregamento enquanto verifica a autenticação
    if (loading) {
        return <div>Carregando...</div>;
    }

    // Redirecionar para login se não estiver autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar se o usuário tem o papel necessário
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default PrivateRoute;
