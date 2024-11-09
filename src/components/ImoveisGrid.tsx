// src/components/ImoveisGrid.tsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/ImoveisGrid.css';

interface Imovel {
    id: string;
    descricaoImovel: string;
    precoImovel: number;
    imageUrl: string;
}

const ImoveisGrid: React.FC = () => {
    const [imoveis, setImoveis] = useState<Imovel[]>([]);

    useEffect(() => {
        async function fetchImoveis() {
            const response = await api.get('/imoveis');
            setImoveis(response.data);
        }
        fetchImoveis();
    }, []);

    return (
        <div className="imoveis-grid">
            {imoveis.map((imovel) => (
                <div key={imovel.id} className="imovel-card">
                    <img src={imovel.imageUrl} alt={imovel.descricaoImovel} />
                    <h3>{imovel.descricaoImovel}</h3>
                    <p>Valor: R$ {imovel.precoImovel}</p>
                </div>
            ))}
        </div>
    );
};

export default ImoveisGrid;
