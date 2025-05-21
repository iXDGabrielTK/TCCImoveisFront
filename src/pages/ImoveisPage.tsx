import React, { useEffect } from 'react';
import CadastroImovelForm from '../components/CadastroImovelForm';
import VistoriaForm from '../components/VistoriaForm';
import ImoveisGrid from '../components/ImoveisGrid';
import RelatorioModal from '../components/RelatorioModal';
import EditarVistoriaModal from '../components/EditarVistoriaModal';
import EditarImovelModal from '../components/EditarImovelModal';
import '../styles/ImoveisPage.css';
import { Imovel } from '../types/Imovel';
import useModal from '../hooks/useModal';
import { Button, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import ReportIcon from '@mui/icons-material/Assessment';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";

const ImoveisPage: React.FC = () => {
    const cadastroModal = useModal();
    const vistoriaModal = useModal();
    const editarVistoriaModal = useModal();
    const editarImovelModal = useModal();
    const relatorioModal = useModal();
    const navigate = useNavigate();
    const isAuthenticated = true; // Exemplo de verificação de autenticação

    const handleImovelClick = (imovel: Imovel) => {
        navigate(`/imovel/${imovel.idImovel}`);
    };

    const handleGenerateReport = (tipoRelatorio: string) => {
        console.log(`Gerando relatório: ${tipoRelatorio}`);
    };

    const fetchImoveis = () => {
        console.log('Fetching imóveis...');
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchImoveis();
        }
    }, [isAuthenticated]);

    return (
        <div className="imoveis-page">
            <div className="button-group-container">
                <Stack direction="row" spacing={2} sx={{ marginTop: 2 }} className="button-group">
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
                        color="info"
                        onClick={editarImovelModal.openModal}
                        startIcon={<EditIcon />}
                    >
                        Editar Imóvel
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
                    onClose={editarVistoriaModal.closeModal}
                />
            )}
            {editarImovelModal.isOpen && (
                <EditarImovelModal
                    isOpen={editarImovelModal.isOpen}
                    onClose={editarImovelModal.closeModal}
                />
            )}
            {relatorioModal.isOpen && (
                <RelatorioModal
                    isOpen={relatorioModal.isOpen}
                    onClose={relatorioModal.closeModal}
                    onGenerate={handleGenerateReport}
                />
            )}

            <ImoveisGrid onImovelClick={handleImovelClick} modo={'todos'} />

        </div>
    );
};

export default ImoveisPage;
