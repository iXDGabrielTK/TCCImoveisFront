// ToastProvider.tsx
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
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (

                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <ToastItem key={toast.id} {...toast} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;