// src/services/auth.ts
import api from './api';

interface LoginResponse {
    token: string;
    usuario_Id: string; // Assume que a resposta inclui o ID do usuário
}

export const login = async (login: string, senha: string): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/usuarios/login', { login, senha });

        const { token, usuario_Id } = response.data;

        console.log("Salvando usuarioId no localStorage:", usuario_Id);
        localStorage.setItem('token', token);
        localStorage.setItem('usuario_Id', usuario_Id);

        return response.data;
    } catch (error: unknown) {
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
    localStorage.removeItem('usuario_Id'); // Remove também o usuarioId
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getUsuarioId = () => {
    return localStorage.getItem('usuario_Id'); // Nova função para recuperar o usuarioId
};
