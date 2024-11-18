import React, { useEffect, useState } from 'react';
import { Imovel } from '../types/Imovel';
import api from '../services/api';
import '../styles/ImoveisGrid.css';

interface ImoveisGridProps {
    onImovelClick: (imovel: Imovel) => void;
}

const ImoveisGrid: React.FC<ImoveisGridProps> = ({ onImovelClick }) => {
    const [imoveis, setImoveis] = useState<Imovel[]>([]);

    useEffect(() => {
        const fetchImoveis = async () => {
            try {
                const response = await api.get('/imoveis');
                setImoveis(response.data);
            } catch (error) {
                console.error("Erro ao buscar imóveis:", error);
            }
        };
        fetchImoveis();
    }, []);

    return (
        <div className="imoveis-grid">
            {imoveis.map((imovel) => (
                <div
                    key={imovel.idImovel || Math.random()} // Garantia de chave única, mesmo que idImovel esteja ausente
                    className="imovel-card"
                    onClick={() => onImovelClick(imovel)}
                >
                    {imovel.fotosImovel && imovel.fotosImovel.length > 0 ? (
                        <img src={imovel.fotosImovel[0]} alt={`Foto do imóvel ${imovel.tipoImovel}`} />
                    ) : (
                        <div className="no-image">Sem imagem</div>
                    )}

                    <h3>{imovel.tipoImovel}</h3>
                    <p>Valor: R$ {imovel.precoImovel}</p>
                </div>
            ))}
        </div>
    );
};

export default ImoveisGrid;
