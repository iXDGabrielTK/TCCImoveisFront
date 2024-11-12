// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

type PrivateRouteProps = {
    children: React.ReactElement;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
