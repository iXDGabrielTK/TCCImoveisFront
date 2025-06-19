import api from './api';
import { Imovel } from '../types/Imovel';

export const favoritarImovel = async (idImovel: number) => {
    await api.post(`/favoritos/${idImovel}`);
};

export const desfavoritarImovel = async (idImovel: number) => {
    await api.delete(`/favoritos/${idImovel}`);
};

export const buscarFavoritos = async () => {
    const response = await api.get('/favoritos');
    return response.data as Imovel[]; // ou ImovelDTO se estiver usando DTOs
};
