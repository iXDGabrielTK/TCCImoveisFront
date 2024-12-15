import api from './api';

interface LoginResponse {
    token: string;
    usuario_Id: string;
    tipo: string;
}

export const login = async (login: string, senha: string): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/usuarios/login', { login, senha });

        const { token, usuario_Id, tipo } = response.data;

        console.log("Salvando usuarioId no localStorage:", usuario_Id);
        console.log("Salvando tipoUsuario no localStorage:", tipo);

        localStorage.setItem('token', token);
        localStorage.setItem('usuarioId', usuario_Id);
        localStorage.setItem('tipoUsuario', tipo);

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
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('tipoUsuario');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getUsuarioId = () => {
    return localStorage.getItem('usuarioId');
};

export const getTipoUsuario = () => {
    return localStorage.getItem('tipoUsuario');
};
