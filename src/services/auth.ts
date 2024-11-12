// src/services/auth.ts
import api from './api';

interface LoginResponse {
    token: string;
}

export const login = async (login: string, senha: string): Promise<string> => {
    try {
        const response = await api.post<LoginResponse>('/usuarios/login', { login, senha });
        const token = response.data.token; // Assumindo que o token está em `data.token`
        localStorage.setItem('token', token); // Armazena o token no localStorage
        return token;
    } catch (error: unknown) { // Usando `unknown` em vez de `any`
        if (error instanceof Error) {
            console.error('Erro ao fazer login:', error.message);
            throw new Error('Credenciais inválidas');
        } else {
            console.error('Erro desconhecido:', error);
            throw new Error('Erro inesperado ao fazer login');
        }
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const getToken = () => {
    return localStorage.getItem('token');
};
