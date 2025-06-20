import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const RelatorioPropostas: React.FC = () => {
    // A lógica para o relatório de propostas de compra virá aqui no futuro
    const handleGenerateReport = () => {
        console.log('Gerar Relatório de Propostas de Compra (lógica a ser implementada)');
        // Exemplo: showToast('Funcionalidade de Relatório de Propostas em desenvolvimento.', 'info');
    };

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
            <Typography variant="h5" gutterBottom>Gerar Relatório de Propostas de Compra</Typography>
            <Typography variant="body2" color="text.secondary">
                Esta seção será utilizada para gerar relatórios de propostas de compra de imóveis.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGenerateReport} disabled>
                Gerar Relatório (Em Breve)
            </Button>
        </Box>
    );
};

export default RelatorioPropostas;