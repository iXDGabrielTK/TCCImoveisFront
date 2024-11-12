import React, { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import Footer from '../components/Footer';
import api from "../services/api.ts";
import { Imovel } from "../types/Imovel";

const HomePage: React.FC = () => {
    const [imoveis, setImoveis] = useState<Imovel[]>([]);

    useEffect(() => {
        const fetchImoveis = async () => {
            try {
                const response = await api.get('/imoveis');
                console.log('Dados recebidos:', response.data);
                setImoveis(response.data);
            } catch (error) {
                console.error('Erro ao buscar imóveis:', error);
            }
        };
        fetchImoveis();
    }, []);

    return (
        <div className="home-page">
            <div className="imoveis-grid">
                {imoveis.map((imovel) => (
                    <div key={imovel.id} className="imovel-card">
                        <img src={imovel.imageUrl} alt={imovel.descricaoImovel} className="imovel-image" />
                        <h2 className="imovel-title">{imovel.descricaoImovel}</h2>
                        <p className="imovel-price">Valor: R$ {imovel.precoImovel}</p>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;
