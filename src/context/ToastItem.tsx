import React, { useEffect } from 'react';
import { Toast } from './ToastContext';

interface ToastItemProps extends Toast {
    onRemove: (id: number) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [id, onRemove]);

    return <div className={`toast toast-${type}`}>{message}</div>;
};

export default ToastItem;
