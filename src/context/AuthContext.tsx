import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { 
    AuthContext, 
    User, 
    DecodedToken, 
    LoginResponse, 
    RefreshTokenResponse 
} from './AuthContext.context';

/**
 * Provedor de autenticação que gerencia o estado de autenticação do usuário
 * e fornece funções para login, logout e verificação de papéis.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Estado de autenticação
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // Dados do usuário autenticado
    const [user, setUser] = useState<User | null>(null);
    // Estado de carregamento
    const [loading, setLoading] = useState<boolean>(true);
    // Mensagem de erro
    const [error, setError] = useState<string | null>(null);

    // Hooks de navegação
    const navigate = useNavigate();
    const location = useLocation();

    // Referência para controlar se o componente está montado
    const isMounted = useRef(true);
    // Referência para o timeout de refresh do token
    const refreshTokenTimeoutId = useRef<NodeJS.Timeout | null>(null);

    /**
     * Verifica se um token JWT está expirado
     * 
     * @param token O token JWT a ser verificado
     * @returns boolean True se o token estiver expirado, false caso contrário
     */
    const isTokenExpired = useCallback((token: string): boolean => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch {
            // Se houver erro ao decodificar o token, considera-o expirado
            return true;
        }
    }, []);

    /**
     * Calcula o tempo restante até a expiração do token em milissegundos
     * 
     * @param token O token JWT para calcular o tempo de expiração
     * @returns number Tempo em milissegundos até a expiração (negativo se já expirado)
     */
    const getTokenExpirationTime = useCallback((token: string): number => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            return (decoded.exp * 1000) - Date.now();
        } catch {
            // Em caso de erro, retorna 0 (considerando o token expirado)
            return 0;
        }
    }, []);

    /**
     * Função para atualizar o token JWT antes que ele expire
     * 
     * Esta função:
     * 1. Envia o refresh token para o endpoint de refresh
     * 2. Armazena os novos tokens retornados (access_token e refresh_token)
     * 3. Configura um novo timeout para atualizar o token novamente antes que expire
     * 4. Em caso de erro, limpa os dados de autenticação e redireciona para login
     * 
     * @returns Promise<boolean> True se o refresh foi bem-sucedido, false caso contrário
     */
    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const currentRefreshToken = localStorage.getItem('refresh_token');
            if (!currentRefreshToken) {
                // Redirecionar para login se não tiver refresh token
                if (isMounted.current) {
                    setUser(null);
                    setIsAuthenticated(false);
                    navigate('/login');
                }
                return false;
            }

            // Chamada para o endpoint de refresh token da API
            const response = await api.post<RefreshTokenResponse>('/usuarios/refresh-token', {
                refreshToken: currentRefreshToken
            });

            const { access_token, refresh_token } = response.data;

            // Armazena os novos tokens
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            // Configura o próximo refresh
            const expirationTime = getTokenExpirationTime(access_token);
            // Calcula o tempo para o próximo refresh (5 minutos antes da expiração)
            // Isso garante que o token seja atualizado antes de expirar
            const refreshTime = expirationTime - (5 * 60 * 1000);

            // Limpa qualquer timeout existente para evitar múltiplos refreshes
            if (refreshTokenTimeoutId.current) {
                clearTimeout(refreshTokenTimeoutId.current);
            }

            // Configura o próximo refresh apenas se o tempo for positivo e o componente estiver montado
            if (refreshTime > 0 && isMounted.current) {
                refreshTokenTimeoutId.current = setTimeout(() => {
                    refreshToken();
                }, refreshTime);
            }

            return true;
        } catch (error) {
            console.error('Erro ao atualizar token:', error);
            // Em caso de erro no refresh, limpa os dados de autenticação
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('usuario_Id');
            localStorage.removeItem('tipo');
            localStorage.removeItem('nome');
            localStorage.removeItem('email');

            if (isMounted.current) {
                setUser(null);
                setIsAuthenticated(false);
                navigate('/login');
            }
            return false;
        }
    }, [getTokenExpirationTime, navigate]);

    /**
     * Carrega os dados do usuário a partir do localStorage e verifica a validade do token
     * 
     * Esta função:
     * 1. Recupera os tokens e dados do usuário do localStorage
     * 2. Verifica se o access token é válido e não está expirado
     * 3. Se válido, configura o estado de autenticação e programa o refresh do token
     * 4. Se inválido ou expirado, tenta usar o refresh token para obter novos tokens
     * 5. Se o refresh falhar, limpa os dados de autenticação
     */
    const loadUser = useCallback(() => {
        const accessToken = localStorage.getItem('access_token');
        const refreshTokenValue = localStorage.getItem('refresh_token');
        const usuarioId = localStorage.getItem('usuario_Id');
        const tipoUsuario = localStorage.getItem('tipo');
        const nome = localStorage.getItem('nome');
        const email = localStorage.getItem('email');

        const handleValidToken = (token: string) => {
            // Token válido, configura o usuário no estado
            setUser({
                id: usuarioId!,
                tipo: tipoUsuario!,
                nome: nome || undefined,
                email: email || undefined
            });
            setIsAuthenticated(true);

            // Configura o refresh token
            const expirationTime = getTokenExpirationTime(token);
            // Calcula o tempo para o próximo refresh (5 minutos antes da expiração)
            const refreshTime = expirationTime - (5 * 60 * 1000);

            // Limpa qualquer timeout existente para evitar múltiplos refreshes
            if (refreshTokenTimeoutId.current) {
                clearTimeout(refreshTokenTimeoutId.current);
            }

            // Configura o próximo refresh apenas se o tempo for positivo e o componente estiver montado
            if (refreshTime > 0 && isMounted.current) {
                refreshTokenTimeoutId.current = setTimeout(() => {
                    refreshToken();
                }, refreshTime);
            }
        };

        const clearAuthData = () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('usuario_Id');
            localStorage.removeItem('tipo');
            localStorage.removeItem('nome');
            localStorage.removeItem('email');
            setUser(null);
            setIsAuthenticated(false);
        };

        if (accessToken && usuarioId && tipoUsuario) {
            if (!isTokenExpired(accessToken)) {
                // Access token válido
                handleValidToken(accessToken);
            } else if (refreshTokenValue) {
                // Access token expirado, mas temos refresh token
                // Tentamos fazer o refresh de forma síncrona para evitar estado inconsistente
                (async () => {
                    try {
                        const success = await refreshToken();
                        if (!success) {
                            clearAuthData();
                        }
                    } catch {
                        clearAuthData();
                    } finally {
                        if (isMounted.current) {
                            setLoading(false);
                        }
                    }
                })();
                return; // Retornamos aqui para evitar setar loading=false duas vezes
            } else {
                // Sem refresh token válido
                clearAuthData();
            }
        } else {
            // Dados incompletos
            clearAuthData();
        }

        // Finaliza o carregamento
        setLoading(false);
    }, [isTokenExpired, getTokenExpirationTime, refreshToken]);

    // Carregar usuário ao iniciar e quando a rota mudar
    useEffect(() => {
        loadUser();

        // Cleanup function
        return () => {
            isMounted.current = false;
            if (refreshTokenTimeoutId.current) {
                clearTimeout(refreshTokenTimeoutId.current);
            }
        };
    }, [loadUser]);

    // Redirecionar para login se não estiver autenticado em rotas protegidas
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            const publicRoutes = ['/login', '/register', '/'];
            const isProtectedRoute = !publicRoutes.some(route => 
                location.pathname === route || location.pathname.startsWith(route + '/')
            );

            if (isProtectedRoute) {
                // Armazena a rota atual para redirecionamento após login
                sessionStorage.setItem('redirectAfterLogin', location.pathname);
                navigate('/login', { replace: true });
            }
        } else if (isAuthenticated && location.pathname === '/login') {
            // Redireciona para a página anterior ou home estiver-se autenticado e tentar acessar login
            const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, loading, location.pathname, navigate]);

    // Função de login
    const login = async (login: string, senha: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            let response;

            // Try with JSON format first (default)
            try {
                const loginData = {
                    login: login, // Not email, but the user's login
                    senha: senha
                };
                response = await api.post<LoginResponse>('/usuarios/login', loginData);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 403) {
                    // If we get a 403 error, try with form-urlencoded format
                    console.log('Tentando formato alternativo para login...');
                    const formData = new URLSearchParams();
                    formData.append('login', login);
                    formData.append('senha', senha);

                    response = await api.post<LoginResponse>('/usuarios/login', formData, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });
                } else {
                    throw error; // Re-throw if it's not a 403 error
                }
            }

            const { access_token, refresh_token, usuario_Id, tipo, nome, email } = response.data;

            // Armazena os tokens e dados do usuário
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('usuario_Id', usuario_Id);
            localStorage.setItem('tipo', tipo);

            if (nome) localStorage.setItem('nome', nome);
            if (email) localStorage.setItem('email', email);

            // Configura o usuário no estado
            setUser({
                id: usuario_Id,
                tipo: tipo,
                nome,
                email
            });

            // Configura o refresh token
            const expirationTime = getTokenExpirationTime(access_token);
            const refreshTime = expirationTime - (5 * 60 * 1000);

            if (refreshTokenTimeoutId.current) {
                clearTimeout(refreshTokenTimeoutId.current);
            }

            if (refreshTime > 0 && isMounted.current) {
                refreshTokenTimeoutId.current = setTimeout(() => {
                    refreshToken();
                }, refreshTime);
            }

            setIsAuthenticated(true);

            // Redirecionar para a página anterior ou home
            const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectPath);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Erro com resposta do servidor
                    if (error.response.status === 401) {
                        setError('Credenciais inválidas');
                    } else if (error.response.status === 403) {
                        setError('Acesso negado');
                    } else {
                        setError(`Erro do servidor: ${error.response.status}`);
                    }
                } else if (error.request) {
                    // Erro sem resposta do servidor
                    setError('Servidor não respondeu. Verifique sua conexão.');
                } else {
                    // Erro na configuração da requisição
                    setError('Erro ao configurar requisição');
                }
                console.error('Erro ao fazer login:', error);
            } else if (error instanceof Error) {
                setError(`Erro: ${error.message}`);
                console.error('Erro ao fazer login:', error.message);
            } else {
                setError('Erro inesperado ao fazer login');
                console.error('Erro desconhecido:', error);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    /**
     * Realiza o logout do usuário
     * 
     * Esta função:
     * 1. Notifica o backend para invalidar o refresh token
     * 2. Remove todos os dados do usuário do localStorage
     * 3. Limpa os timeouts de refresh do token
     * 4. Atualiza o estado para não autenticado
     * 5. Redireciona para a página de login
     */
    const logout = useCallback(async () => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        // Notificar o backend para invalidar o token (se estiver autenticado)
        if (accessToken && refreshToken) {
            try {
                await api.post('/usuarios/logout', { refreshToken }, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
            } catch (error) {
                console.error('Erro ao fazer logout no servidor:', error);
                // Continua com o logout local mesmo se o servidor falhar
            }
        }

        // Limpar todos os dados do usuário
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('usuario_Id');
        localStorage.removeItem('tipo');
        localStorage.removeItem('nome');
        localStorage.removeItem('email');

        // Limpar o timeout de refresh token
        if (refreshTokenTimeoutId.current) {
            clearTimeout(refreshTokenTimeoutId.current);
            refreshTokenTimeoutId.current = null;
        }

        // Atualizar o estado
        setUser(null);
        setIsAuthenticated(false);
        setError(null);

        // Redirecionar para login
        navigate('/login');
    }, [navigate]);

    /**
     * Verifica se o usuário atual tem um determinado papel/tipo
     * 
     * @param role O papel/tipo a ser verificado
     * @returns boolean True se o usuário tiver o papel especificado, false caso contrário
     */
    const hasRole = useCallback((role: string): boolean => {
        return user?.tipo === role;
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
                refreshToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
