import api from './api';

export interface ImobiliariaResponse {
    id: number;
    nome: string;
    cnpj: string;
}

export const fetchImobiliariasAprovadas = async (): Promise<ImobiliariaResponse[]> => {
    try {
        const response = await api.get('/imobiliaria/imobiliarias-aprovadas');

        console.log("API /imobiliaria/imobiliarias-aprovadas retornou:", response.data);

        if (response.status === 403) {
            console.warn("Usuário não tem permissão (role CORRETOR) para listar imobiliárias aprovadas.");
            return [];
        }

        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            console.error("Erro de autenticação: Usuário não logado ou token inválido/expirado. Redirecione para o login se necessário.");
            throw new Error("Usuário não autenticado.");
        }
        console.error("Erro em imobiliariaService.ts - fetchImobiliariasAprovadas:", error);
        throw new Error(`Erro ao buscar imobiliárias: ${error.message || error.response?.statusText || 'Erro desconhecido'}`);
    }
};