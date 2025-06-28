import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Alterado para aceitar string ou string[]
type PrivateRouteProps = {
    children: React.ReactElement;
    requiredRole?: string | string[];
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, hasRole, loading, refreshToken } = useAuth();
    const [tokenRefreshChecked, setTokenRefreshChecked] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    // Verificar e atualizar token quando o componente monta
    useEffect(() => {
        const checkToken = async () => {
            if (isAuthenticated) {
                try {
                    const success = await refreshToken();
                    setTokenValid(success);
                } catch (error) {
                    console.error('Erro ao verificar token:', error);
                    setTokenValid(false);
                } finally {
                    setTokenRefreshChecked(true);
                }
            } else {
                setTokenRefreshChecked(true);
            }
        };

        checkToken();
    }, [isAuthenticated, refreshToken]);

    // Mostrar um indicador de carregamento enquanto verifica a autenticação
    if (loading || !tokenRefreshChecked) {
        return <div>Carregando...</div>;
    }

    // Redirecionar para login se não estiver autenticado ou o token for inválido
    if (!isAuthenticated || !tokenValid) {
        return <Navigate to="/login" replace />;
    }

    // Verificar se o usuário tem o papel necessário
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default PrivateRoute;
