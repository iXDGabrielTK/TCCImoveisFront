// src/services/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true // Isso envia cookies com a requisição, se necessário
});

// Interceptor para adicionar o token de autenticação às requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Variável para controlar se já está tentando atualizar o token
let isRefreshing = false;
// Fila de requisições que falharam por token expirado
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = [];

// Função para processar a fila de requisições após o refresh do token
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

// Interceptor para lidar com erros de resposta e tentar refresh do token
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Se o erro for 401 (Unauthorized) e não for uma requisição de refresh token ou logout
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url.includes('refresh-token') &&
            !originalRequest.url.includes('logout')) {

            if (isRefreshing) {
                // Se já está atualizando o token, adiciona a requisição à fila
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Tenta atualizar o token usando o refresh token
                const refreshToken = localStorage.getItem('refresh_token');

                if (!refreshToken) {
                    throw new Error('Refresh token não encontrado');
                }

                const response = await api.post('/usuarios/refresh-token', {
                    refreshToken
                });

                const { access_token, refresh_token } = response.data;

                // Armazena os novos tokens
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);

                // Atualiza o header da requisição original
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                // Processa a fila de requisições que falharam
                processQueue(null, access_token);

                return api(originalRequest);
            } catch (refreshError) {
                // Se falhar ao atualizar o token, processa a fila com erro
                processQueue(refreshError, null);

                // Limpa os dados de autenticação
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('usuario_Id');
                localStorage.removeItem('tipo');
                localStorage.removeItem('nome');
                localStorage.removeItem('email');

                // Redireciona para login
                window.location.href = '/login';

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Se receber 403 (Forbidden)
        if (error.response?.status === 403) {
            console.error('Acesso negado:', error.response.data);
            // Pode ser um problema de permissão ou token inválido
            // Considere redirecionar para login se for um problema de autenticação
        }

        return Promise.reject(error);
    }
);


export default api;
