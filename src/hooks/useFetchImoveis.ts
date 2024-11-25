import api from '../services/api';

export function useFetchImoveis() {
    return async () => {
        return await api.get('/imoveis');
    };
}
