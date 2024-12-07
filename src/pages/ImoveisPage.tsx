import React, { useState } from 'react';
import CadastroImovelForm from '../components/CadastroImovelForm';
import VistoriaForm from '../components/VistoriaForm';
import ImoveisGrid from '../components/ImoveisGrid';
import ImovelDetalhes from '../components/ImovelDetalhes';
import RelatorioModal from '../components/RelatorioModal';
import EditarVistoriaModal from '../components/EditarVistoriaModal';
import '../styles/ImoveisPage.css';
import { Imovel } from '../types/Imovel';
import useModal from '../hooks/useModal';
import { Button, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import ReportIcon from '@mui/icons-material/Assessment';

const ImoveisPage: React.FC = () => {
    const cadastroModal = useModal();
    const vistoriaModal = useModal();
    const editarVistoriaModal = useModal();
    const relatorioModal = useModal();
    const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
    const [selectedVistoria, setSelectedVistoria] = useState<string | null>(null);

    const handleCloseEditarVistoriaModal = () => {
        setSelectedVistoria(null); // Reseta a vistoria selecionada
        editarVistoriaModal.closeModal();
    };

    const handleOpenDetalhesModal = (imovel: Imovel) => {
        setSelectedImovel(imovel);
    };

    const handleGenerateReport = (tipoRelatorio: string) => {
        console.log(`Gerando relatório: ${tipoRelatorio}`);
        // Lógica para geração de relatórios
    };

    return (
        <div className="imoveis-page">
            <div className="button-group">
                <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={cadastroModal.openModal}
                        className="btn-cadastrar-imovel"
                        startIcon={<HomeIcon />}
                    >
                        Cadastrar Novo Imóvel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={vistoriaModal.openModal}
                        className="btn-registrar-vistoria"
                        startIcon={<DescriptionIcon />}
                    >
                        Registrar Vistoria
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={editarVistoriaModal.openModal}
                        className="btn-editar-vistoria"
                        startIcon={<DescriptionIcon />}
                    >
                        Editar Vistoria
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={relatorioModal.openModal}
                        className="btn-gerar-relatorio"
                        startIcon={<ReportIcon />}
                    >
                        Gerar Relatório
                    </Button>
                </Stack>
            </div>
            {cadastroModal.isOpen && (
                <div className="modal-overlay" onClick={cadastroModal.closeModal}>
                    <div className="imoveis-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={cadastroModal.closeModal} className="btn-close-modal">
                            Fechar
                        </button>
                        <CadastroImovelForm onClose={cadastroModal.closeModal} />
                    </div>
                </div>
            )}
            {vistoriaModal.isOpen && (
                <div className="modal-overlay" onClick={vistoriaModal.closeModal}>
                    <div className="imoveis-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={vistoriaModal.closeModal} className="btn-close-modal">
                            Fechar
                        </button>
                        <VistoriaForm onClose={vistoriaModal.closeModal} />
                    </div>
                </div>
            )}
            {editarVistoriaModal.isOpen && (
                <EditarVistoriaModal
                    isOpen={editarVistoriaModal.isOpen}
                    onClose={handleCloseEditarVistoriaModal}
                    selectedVistoria={selectedVistoria} // Passando a vistoria selecionada
                />
            )}
            {relatorioModal.isOpen && (
                <RelatorioModal
                    isOpen={relatorioModal.isOpen}
                    onClose={relatorioModal.closeModal}
                    onGenerate={handleGenerateReport}
                />
            )}

            <ImoveisGrid onImovelClick={handleOpenDetalhesModal} />

            {selectedImovel && (
                <div className="modal-overlay" onClick={() => setSelectedImovel(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <ImovelDetalhes imovel={selectedImovel} onClose={() => setSelectedImovel(null)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImoveisPage;
