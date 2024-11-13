// src/pages/ImoveisPage.tsx
import React, { useState } from 'react';
import CadastroImovelForm from '../components/CadastroImovelForm';
import ImoveisGrid from '../components/ImoveisGrid';
import ImovelDetalhes from '../components/ImovelDetalhes';
import { Imovel } from '../types/Imovel'; // Importe a interface correta

const ImoveisPage: React.FC = () => {
    const [isCadastroModalOpen, setCadastroModalOpen] = useState(false);
    const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null); // Define como Imovel | null

    const handleOpenCadastroModal = () => setCadastroModalOpen(true);
    const handleCloseCadastroModal = () => setCadastroModalOpen(false);

    // Função para abrir o modal de detalhes com o imóvel selecionado
    const handleOpenDetalhesModal = (imovel: Imovel) => {
        setSelectedImovel(imovel);
    };

    // Função para fechar o modal de detalhes
    const handleCloseDetalhesModal = () => {
        setSelectedImovel(null);
    };

    return (
        <div className="imoveis-page">
            <button onClick={handleOpenCadastroModal} className="open-modal-button">
                Cadastrar Novo Imóvel
            </button>

            {isCadastroModalOpen && (
                <div className="modal-overlay" onClick={handleCloseCadastroModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={handleCloseCadastroModal} className="close-modal-button">
                            Fechar
                        </button>
                        <CadastroImovelForm onClose={handleCloseCadastroModal} />
                    </div>
                </div>
            )}

            <ImoveisGrid onImovelClick={handleOpenDetalhesModal} /> {/* Passe o manipulador para o grid */}

            {selectedImovel && (
                <div className="modal-overlay" onClick={handleCloseDetalhesModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <ImovelDetalhes imovel={selectedImovel} onClose={handleCloseDetalhesModal} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImoveisPage;
