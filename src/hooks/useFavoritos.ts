import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritarImovel, desfavoritarImovel, buscarFavoritos } from '../services/favoritos';
import {Imovel} from "../types/Imovel";
import {useMemo} from "react";

export const useFavoritos = () => {
    const queryClient = useQueryClient();

    const { data: favoritos = [], isLoading } = useQuery<Imovel[]>({
        queryKey: ['favoritos'],
        queryFn: buscarFavoritos,
    });

    const favoritar = useMutation({
        mutationFn: favoritarImovel,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favoritos'] }),
    });

    const desfavoritar = useMutation({
        mutationFn: desfavoritarImovel,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favoritos'] }),
    });

    // ✅ Aqui está o segredo: Set memoizado
    const favoritosIds = useMemo(
        () => new Set(favoritos.map((imv) => imv.idImovel)),
        [favoritos]
    );

    const isFavoritado = (id: number) => favoritosIds.has(id);

    return {
        favoritos,
        favoritosIds,
        isFavoritado,
        favoritar: favoritar.mutate,
        desfavoritar: desfavoritar.mutate,
        isLoading,
    };
};
