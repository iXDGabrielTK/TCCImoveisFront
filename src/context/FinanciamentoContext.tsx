import React, { createContext, useContext, useState } from 'react';

interface SimulacaoData {
    entrada: string;
    rendaMensal: string;
    prazo: number;
}

interface FinanciamentoContextType {
    simulacao: SimulacaoData | null;
    setSimulacao: (data: SimulacaoData) => void;
    resetSimulacao: () => void;
}

const FinanciamentoContext = createContext<FinanciamentoContextType | undefined>(undefined);

export const FinanciamentoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [simulacao, setSimulacaoState] = useState<SimulacaoData | null>(null);

    const setSimulacao = (data: SimulacaoData) => setSimulacaoState(data);
    const resetSimulacao = () => setSimulacaoState(null);

    return (
        <FinanciamentoContext.Provider value={{ simulacao, setSimulacao, resetSimulacao }}>
            {children}
        </FinanciamentoContext.Provider>
    );
};

export const useFinanciamento = (): FinanciamentoContextType => {
    const context = useContext(FinanciamentoContext);
    if (context === undefined) {
        throw new Error('useFinanciamento deve ser usado dentro de um FinanciamentoProvider');
    }
    return context;
};
