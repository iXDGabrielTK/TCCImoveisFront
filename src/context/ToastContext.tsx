import React, { useState, ReactNode } from 'react';
import '../styles/shared.css';
import { ToastContext, ToastType, Toast } from './ToastContext';

interface ToastProviderProps {
    children: ReactNode;
}

// Toast component
const ToastItem: React.FC<Toast & { onRemove: (id: number) => void }> = ({ 
    id, 
    message, 
    type, 
    onRemove 
}) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(id);
        }, 3000); // Remove after 3 seconds

        return () => clearTimeout(timer);
    }, [id, onRemove]);

    return (
        <div className={`toast toast-${type}`}>
            {message}
        </div>
    );
};

// Provider component
const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Function to add a new toast
    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    };

    // Function to remove a toast
    const removeToast = (id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onRemove={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
