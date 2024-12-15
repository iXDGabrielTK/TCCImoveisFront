import React from 'react';
import { Navigate } from 'react-router-dom';

type PrivateRouteProps = {
    children: React.ReactElement;
    requiredRole?: string;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && tipoUsuario !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
