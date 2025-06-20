import React, { useEffect } from 'react';
import ImoveisGrid from '../components/ImoveisGrid';
import '../styles/ImoveisPage.css';
import { Imovel } from '../types/Imovel';
import { Button, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";

const ImoveisPage: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = true;

    const handleImovelClick = (imovel: Imovel) => {
        navigate(`/imovel/${imovel.idImovel}`);
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
                        onClick={() => navigate('/editar-vistoria')}
                        className="btn-editar-vistoria"
                        startIcon={<DescriptionIcon />}
                    >
                        Editar Vistoria
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => navigate('/editar-imovel')}
                        startIcon={<EditIcon />}
                    >
                        Editar Imóvel
                    </Button>
                </Stack>
            </div>

            <ImoveisGrid onImovelClick={handleImovelClick} modo={'todos'} />

        </div>
    );
};

export default ImoveisPage;