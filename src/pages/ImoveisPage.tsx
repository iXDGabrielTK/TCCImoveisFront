import React, { useEffect } from 'react';
import ImoveisGrid from '../components/ImoveisGrid';
import RelatorioModal from '../components/RelatorioModal';
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
    // REMOVIDO: A chamada ao hook useModal para editarVistoriaModal não é mais necessária
    // const editarVistoriaModal = useModal();
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
                        onClick={() => navigate('/cadastro-imovel')}
                        className="btn-cadastrar-imovel"
                        startIcon={<HomeIcon />}
                    >
                        Cadastrar Novo Imóvel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => navigate('/cadastro-vistoria')}
                        className="btn-registrar-vistoria"
                        startIcon={<DescriptionIcon />}
                    >
                        Registrar Vistoria
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/editar-vistoria')} // ALTERADO AQUI: Navega para a tela de edição
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

            {/* REMOVIDO: O modal de edição de vistoria não é mais renderizado aqui */}
            {/* {editarVistoriaModal.isOpen && (
                <EditarVistoriaModal
                    isOpen={editarVistoriaModal.isOpen}
                    onClose={editarVistoriaModal.closeModal}
                />
            )} */}
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