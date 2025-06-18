import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

// === Controle de fila para requisições enquanto “token” está a ser renovado ===
let onLogout: (() => void) | null = null;
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

export const setLogoutHandler = (handler: () => void) => {
    onLogout = handler;
};

const processQueue = (error: AxiosError | null, token: string | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// === Interceptor de Requisição: adiciona Authorization em toda requisição ===
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// === Interceptor de Resposta: tenta automaticamente fazer refresh ===
api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('refresh_token');

            console.warn("Com token.");

            if (!refreshToken) {
                console.warn("Sem refresh token — redirecionando para login.");
                localStorage.clear();
                window.location.replace('/login')
                return Promise.reject(error);
            }

            if (onLogout) {
                onLogout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                console.warn("Refresh token já está a ser renovado.");
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers)
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    localStorage.clear();
                    window.location.replace('/login')
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.warn("Tentando renovar token.");
                const response = await api.post('/usuarios/refresh-token', { refreshToken });

                const { access_token, refresh_token } = response.data;

                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);

                processQueue(null, access_token);

                if (originalRequest.headers)
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;

                console.warn("Token renovado com sucesso.");
                return api(originalRequest);
            } catch (err) {
                console.error("Erro ao tentar renovar token. Redirecionando para login.");
                processQueue(err as AxiosError, null);
                localStorage.clear();
                console.warn("Redirecionando para login...");
                window.location.replace('/login')
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
