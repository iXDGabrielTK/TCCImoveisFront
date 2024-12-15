import React, { useState } from 'react';
import '../styles/HomePage.css';
import Footer from '../components/Footer';
import ImoveisGrid from '../components/ImoveisGrid';
import ImovelDetalhes from '../components/ImovelDetalhes';
import { Imovel } from '../types/Imovel';

const HomePage: React.FC = () => {
    const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);

    const handleOpenDetalhesModal = (imovel: Imovel) => {
        setSelectedImovel(imovel);
    };

    const handleCloseDetalhesModal = () => {
        setSelectedImovel(null);
    };

    return (
        <div className="home-page">
            <ImoveisGrid onImovelClick={handleOpenDetalhesModal} />
            {selectedImovel && (
                <div className="modal-overlay" onClick={handleCloseDetalhesModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <ImovelDetalhes imovel={selectedImovel} onClose={handleCloseDetalhesModal} />
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default HomePage;
