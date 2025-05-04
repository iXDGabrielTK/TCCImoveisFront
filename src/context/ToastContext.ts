import { createContext, useContext } from 'react';

// Define the types for our toast
export type ToastType = 'success' | 'error' | 'info';

// Define the context interface
export interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

// Create the context with a default value
export const ToastContext = createContext<ToastContextType>({
    showToast: () => {},
});

// Custom hook to use the toast context
export const useToast = () => useContext(ToastContext);

// Define the Toast interface for use in the provider
export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}