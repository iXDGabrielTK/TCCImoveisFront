import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Notificacao } from '../types/Notificacao';

export const aprovarSolicitacao = async (tipo: 'corretor' | 'imobiliaria', id: number) => {
    const endpoint = tipo === 'corretor'
        ? `/notificacoes/corretor/${id}/aprovar`
        : `/notificacoes/imobiliaria/aprovar/${id}`;
    return api.put(endpoint);
};

export const recusarSolicitacao = async (tipo: 'corretor' | 'imobiliaria', id: number) => {
    const endpoint = tipo === 'corretor'
        ? `/notificacoes/corretor/${id}/recusar`
        : `/notificacoes/imobiliaria/recusar/${id}`;
    return api.put(endpoint);
};

export const useNotifications = () => {
    return useQuery<Notificacao[]>({
        queryKey: ["notificacoes"],
        queryFn: async () => {
            const response = await api.get("/notificacoes");
            return response.data;
        },
        staleTime: 1000 * 60 * 2,
    });
};

export const useNotificacoesPrivadas = () => {
    return useQuery<Notificacao[]>({
        queryKey: ["notificacoes", "privadas"],
        queryFn: async () => {
            const response = await api.get("/notificacoes/privadas");
            return response.data;
        },
        staleTime: 1000 * 60 * 2,
    });
};

export const useMarcarComoLida = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.patch(`/notificacoes/${id}/lida`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
        }
    });
};

export const useArquivarNotificacao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.patch(`/notificacoes/${id}/arquivar`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
        }
    });
};

export const useNotificacoesNaoLidas = () => {
    return useQuery<Notificacao[]>({
        queryKey: ["notificacoes", "nao-lidas"],
        queryFn: async () => {
            const response = await api.get("/notificacoes/nao-lidas");
            return response.data;
        },
        staleTime: 1000 * 60 * 2,
    });
};
