// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', 
});

export const fetchImoveis = async () => {
  const response = await api.get('/imoveis');
  return response.data;
};

export default api;
