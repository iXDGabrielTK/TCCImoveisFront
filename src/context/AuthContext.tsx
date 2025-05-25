import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import {
    AuthContext,
    User,
    DecodedToken,
    LoginResponse,
    RefreshTokenResponse,
} from './AuthContext.context';

/**
 * Componente AuthProvider que fornece o contexto de autenticação para a aplicação.
 * Ele gerencia o estado de autenticação, carrega os dados do usuário e lida com login/logout.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const isMounted = useRef(true);
    const refreshTokenTimeoutId = useRef<NodeJS.Timeout | null>(null);
    const publicRoutes = useMemo(() => ['/', '/login', '/register'], []);

    const isTokenExpired = useCallback((token: string) => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            return decoded.exp < Date.now() / 1000;
        } catch {
            return true;
        }
    }, []);

    const getTokenExpirationTime = useCallback((token: string) => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            return decoded.exp * 1000 - Date.now();
        } catch {
            return 0;
        }
    }, []);

    const clearAuthData = () => {
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
    };

    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const currentRefreshToken = localStorage.getItem('refresh_token');
            if (!currentRefreshToken) {
                clearAuthData();
                navigate('/login');
                return false;
            }

            const response = await api.post<RefreshTokenResponse>('/usuarios/refresh-token', {
                refreshToken: currentRefreshToken,
            });

            const { access_token, refresh_token } = response.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            const expirationTime = getTokenExpirationTime(access_token);
            const refreshTime = expirationTime - 5 * 60 * 1000;

            if (refreshTokenTimeoutId.current) clearTimeout(refreshTokenTimeoutId.current);
            if (refreshTime > 0 && isMounted.current) {
                refreshTokenTimeoutId.current = setTimeout(refreshToken, refreshTime);
            }

            return true;
        } catch (error) {
            console.error('Erro ao atualizar token:', error);
            clearAuthData();
            navigate('/login');
            return false;
        }
    }, [getTokenExpirationTime, navigate]);

    const loadUser = useCallback(() => {
        const accessToken = localStorage.getItem('access_token');
        const refreshTokenValue = localStorage.getItem('refresh_token');
        const usuarioId = localStorage.getItem('usuario_Id');
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');
        const nome = localStorage.getItem('nome');
        const email = localStorage.getItem('email');

        const handleValidToken = (token: string) => {
            setUser({
                id: usuarioId!,
                tipo: roles,
                nome: nome || undefined,
                email: email || undefined,
            });
            setIsAuthenticated(true);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const expirationTime = getTokenExpirationTime(token);
            const refreshTime = expirationTime - 5 * 60 * 1000;
            if (refreshTokenTimeoutId.current) clearTimeout(refreshTokenTimeoutId.current);
            if (refreshTime > 0 && isMounted.current) {
                refreshTokenTimeoutId.current = setTimeout(refreshToken, refreshTime);
            }
        };

        if (accessToken && usuarioId && roles) {
            if (!isTokenExpired(accessToken)) {
                handleValidToken(accessToken);
            } else if (refreshTokenValue) {
                (async () => {
                    const success = await refreshToken();
                    if (!success) clearAuthData();
                    if (isMounted.current) setLoading(false);
                })();
                return;
            } else {
                clearAuthData();
            }
        } else {
            clearAuthData();
        }

        setLoading(false);
    }, [isTokenExpired, getTokenExpirationTime, refreshToken]);

    useEffect(() => {
        if (!loading && isAuthenticated) {
            const isPublicRoute = publicRoutes.includes(location.pathname);
            if (isPublicRoute) {
                navigate('/home', { replace: true });
            }
        }
    }, [isAuthenticated, loading, location.pathname, navigate, publicRoutes]);

    useEffect(() => {
        loadUser();
        return () => {
            isMounted.current = false;
            if (refreshTokenTimeoutId.current) clearTimeout(refreshTokenTimeoutId.current);
        };
    }, [loadUser]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            const isProtectedRoute = !publicRoutes.some(route =>
                location.pathname === route || location.pathname.startsWith(route + '/')
            );

            if (isProtectedRoute) {
                sessionStorage.setItem('redirectAfterLogin', location.pathname);
                navigate('/login', { replace: true });
            }
        } else if (isAuthenticated && location.pathname === '/login') {
            const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, loading, location.pathname, navigate, publicRoutes]);

    const login = async (email: string, senha: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post<LoginResponse>('/usuarios/login', { email, senha });

            const {
                access_token,
                refresh_token,
                usuario_Id,
                tipo,
                nome,
                email: emailUsuario,
            } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('usuario_Id', usuario_Id);
            const roles = Array.isArray(tipo) ? tipo.map(r => r.nome.toUpperCase()) : [tipo.toUpperCase()];
            localStorage.setItem('roles', JSON.stringify(roles));
            if (nome) localStorage.setItem('nome', nome);
            if (emailUsuario) localStorage.setItem('email', emailUsuario);

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            setIsAuthenticated(true);
            loadUser();
            navigate('/home');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    setError('Credenciais inválidas ou acesso negado');
                } else {
                    setError('Erro ao conectar com o servidor');
                }
            } else {
                setError('Erro inesperado');
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = useCallback(async () => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (accessToken && refreshToken) {
            try {
                await api.post('/usuarios/logout', { refreshToken }, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            } catch (error) {
                console.error('Erro ao fazer logout no servidor:', error);
            }
        }

        clearAuthData();
        if (refreshTokenTimeoutId.current) {
            clearTimeout(refreshTokenTimeoutId.current);
            refreshTokenTimeoutId.current = null;
        }

        setError(null);
        window.location.replace('/login');
    }, []);

    const hasRole = useCallback((role: string) => {
        return !!user?.tipo?.includes(role.toUpperCase());
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                error,
                login,
                logout,
                hasRole,
                refreshToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
