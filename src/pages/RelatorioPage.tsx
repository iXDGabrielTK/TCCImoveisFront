import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import RelatorioUsuarios from '../components/RelatorioUsuarios';
import RelatorioAgendamentos from '../components/RelatorioAgendamento';
import RelatorioVistorias from '../components/RelatorioVistoria';
import RelatorioFavoritos from "../components/RelatorioFavoritos.tsx";
import RelatorioPropostas from '../components/RelatorioPropostas';
import '../styles/RelatorioPage.css';

const RelatorioPage: React.FC = () => {
    const [currentTab, setCurrentTab] = useState('agendamentos'); // Default para a primeira aba

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3, bgcolor: '#f8f9fa', borderRadius: 2, boxShadow: 3, mt: 4 }}>
            <Typography variant="h4" fontWeight={600} gutterBottom align="center" sx={{ mb: 4, color: '#333' }}>
                Central de Relatórios
            </Typography>

            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="abas de relatórios"
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                sx={{ mb: 4, '.MuiTab-root': { fontWeight: 'bold' } }}
            >
                <Tab label="Agendamentos" value="agendamentos" />
                <Tab label="Vistorias" value="vistorias" />
                <Tab label="Usuários" value="usuarios" />
                <Tab label="Favoritos" value="favoritos" />
                <Tab label="Propostas" value="propostas" />

            </Tabs>

            <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff' }}>
                {currentTab === 'agendamentos' && (
                    <RelatorioAgendamentos />
                )}
                {currentTab === 'vistorias' && (
                    <RelatorioVistorias />
                )}
                {currentTab === 'usuarios' && (
                    <RelatorioUsuarios />
                )}
                {currentTab === 'favoritos' && (
                    <RelatorioFavoritos />
                )}
                {currentTab === 'propostas' && (
                    <RelatorioPropostas />
                )}
            </Box>
        </Box>
    );
};

export default RelatorioPage;