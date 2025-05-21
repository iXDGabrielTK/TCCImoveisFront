import { createContext, useContext, useState, ReactNode } from 'react';

interface ImoveisContextType {
    termoBusca: string;
    setTermoBusca: (termo: string) => void;
}

const ImoveisContext = createContext<ImoveisContextType | undefined>(undefined);

export const ImoveisProvider = ({ children }: { children: ReactNode }) => {
    const [termoBusca, setTermoBusca] = useState('');

    return (
        <ImoveisContext.Provider value={{ termoBusca, setTermoBusca }}>
            {children}
        </ImoveisContext.Provider>
    );
};

export const useImoveisContext = () => {
    const context = useContext(ImoveisContext);
    if (!context) {
        throw new Error('useImoveisContext deve ser usado dentro de um ImoveisProvider');
    }
    return context;
};
