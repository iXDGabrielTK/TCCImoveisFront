import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const RelatorioFavoritos: React.FC = () => {
    // A lógica para o relatório de favoritos virá aqui no futuro
    const handleGenerateReport = () => {
        console.log('Gerar Relatório de Favoritos (lógica a ser implementada)');
        // Exemplo: showToast('Funcionalidade de Relatório de Favoritos em desenvolvimento.', 'info');
    };

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
            <Typography variant="h5" gutterBottom>Gerar Relatório de Favoritos</Typography>
            <Typography variant="body2" color="text.secondary">
                Esta seção será utilizada para gerar relatórios de imóveis favoritados pelos usuários.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGenerateReport} disabled>
                Gerar Relatório (Em Breve)
            </Button>
        </Box>
    );
};

export default RelatorioFavoritos;
