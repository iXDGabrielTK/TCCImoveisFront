import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.context';

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
    }
    return context;
};
