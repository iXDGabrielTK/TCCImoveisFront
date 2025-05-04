import { createContext } from 'react';

/**
 * Interface para o usuário autenticado
 */
export interface User {
    id: string;              // ID do usuário
    tipo: string;            // Tipo/papel do usuário (ex: 'admin', 'funcionario', 'cliente')
    nome?: string;           // Nome do usuário (opcional)
    email?: string;          // Email do usuário (opcional)
}

/**
 * Interface para o token JWT decodificado
 */
export interface DecodedToken {
    exp: number;             // Timestamp de expiração do token
    [key: string]: unknown;  // Outras propriedades do token
}

/**
 * Interface para a resposta da API de login
 */
export interface LoginResponse {
    access_token: string;    // Token JWT de acesso
    refresh_token: string;   // Token JWT de refresh
    usuario_Id: string;      // ID do usuário
    tipo: string;            // Tipo/papel do usuário
    nome?: string;           // Nome do usuário (opcional)
    email?: string;          // Email do usuário (opcional)
}

/**
 * Interface para a resposta da API de refresh token
 */
export interface RefreshTokenResponse {
    access_token: string;    // Novo token JWT de acesso
    refresh_token: string;   // Novo token JWT de refresh
}

/**
 * Interface para o contexto de autenticação
 */
export interface AuthContextType {
    isAuthenticated: boolean;                            // Indica se o usuário está autenticado
    user: User | null;                                   // Dados do usuário autenticado
    loading: boolean;                                    // Indica se está carregando dados de autenticação
    error: string | null;                                // Mensagem de erro, se houver
    login: (login: string, senha: string) => Promise<void>; // Função para fazer login
    logout: () => void;                                  // Função para fazer logout
    hasRole: (role: string) => boolean;                  // Função para verificar se o usuário tem determinado papel
    refreshToken: () => Promise<boolean>;                // Função para atualizar o token de acesso
}

// Valor padrão para o contexto
const defaultContext: AuthContextType = {
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    login: async () => {},
    logout: () => {},
    hasRole: () => false,
    refreshToken: async () => false
};

export const AuthContext = createContext<AuthContextType>(defaultContext);
