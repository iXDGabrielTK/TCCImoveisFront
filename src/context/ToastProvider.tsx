import React, { useState, useCallback } from 'react';
import { ToastContext, Toast, ToastType } from './ToastContext';
import ToastItem from './ToastItem';
import '../styles/shared.css';

interface ToastProviderProps {
    children: React.ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();

        setToasts(prev => {
            if (prev.some(t => t.message === message && t.type === type)) return prev;
            const next = [...prev, { id, message, type }];
            return next.length > 5 ? next.slice(1) : next;
        });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        {...toast}
                        onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;