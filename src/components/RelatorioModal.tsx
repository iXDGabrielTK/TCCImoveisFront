import React from 'react';
import '../styles/RelatorioModal.css';
import { Button, Stack } from '@mui/material';

interface RelatorioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (tipoRelatorio: string) => void;
}

const RelatorioModal: React.FC<RelatorioModalProps> = ({ isOpen, onClose, onGenerate }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="relatorio-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Gerar Relatório</h2>
                <p>Escolha o tipo de relatório para gerar:</p>
                <Stack direction="column" spacing={2}>
                    <Button variant="contained" color="secondary" onClick={() => onGenerate('agendamentos')}>
                        Relatório de Agendamentos
                    </Button>
                    <p>Faz um relatório mensal sobre os agendamentos deste mês.</p>

                    <Button variant="contained" color="secondary" onClick={() => onGenerate('vistorias')}>
                        Relatório de Vistorias
                    </Button>
                    <p>Relatório com histórico de vistorias realizadas em imóveis.</p>

                    <Button variant="contained" color="secondary" onClick={() => onGenerate('usuarios')}>
                        Relatório de Usuários
                    </Button>
                    <p>Relatório sobre a quantidade de usuários que acessaram o sistema.</p>
                </Stack>
                <Button variant="outlined" color="success" onClick={onClose} style={{ marginTop: '20px' }}>
                    Fechar
                </Button>
            </div>
        </div>
    );
};

export default RelatorioModal;
