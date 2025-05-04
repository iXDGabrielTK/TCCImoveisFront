// src/utils/errorHandling.ts

/**
 * Interface for API errors with response data
 */
export interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
    message?: string;
}

/**
 * Get a user-friendly error message based on the HTTP status code
 * @param error - The error object from the API call
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: ApiError): string => {
    // Check if the error is undefined or null
    if (!error) {
        return "Ocorreu um erro inesperado.";
    }

    // Check for offline status
    if (!navigator.onLine) {
        return "Você está offline. Verifique sua conexão com a internet e tente novamente.";
    }

    // Handle different HTTP status codes
    if (error.response?.status === 400) {
        return "Dados inválidos. Verifique os campos e tente novamente.";
    }
    if (error.response?.status === 401) {
        return "Sessão expirada. Faça login novamente.";
    }
    if (error.response?.status === 403) {
        return "Você não tem permissão para realizar esta ação.";
    }
    if (error.response?.status === 404) {
        return "Recurso não encontrado. Atualize a página e tente novamente.";
    }
    if (error.response?.status === 500) {
        return "Erro no servidor. Tente novamente mais tarde.";
    }

    // Return the error message from the API if available, or a generic message
    return error.response?.data?.message || "Ocorreu um erro inesperado.";
};

/**
 * Validate if a URL is valid
 * @param url - The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate if a string is a valid date in the format YYYY-MM-DD
 * @param dateString - The date string to validate
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
    // Check if the format is YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    // Check if the date is valid
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

/**
 * Validate if a string is a valid CEP (Brazilian postal code)
 * @param cep - The CEP to validate
 * @returns True if the CEP is valid, false otherwise
 */
export const isValidCep = (cep: string): boolean => {
    // Remove non-numeric characters
    const numericCep = cep.replace(/\D/g, '');
    // Check if it has 8 digits
    return numericCep.length === 8;
};
