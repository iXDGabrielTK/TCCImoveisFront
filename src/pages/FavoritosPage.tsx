import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImoveisGrid from "../components/ImoveisGrid";
import { Imovel } from "../types/Imovel";
import "../styles/HomePage.css";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Typography } from "@mui/material";

const FavoritosPage: React.FC = () => {
    const navigate = useNavigate();
    const [vazio, setVazio] = useState(false);

    const handleOpenDetalhes = (imovel: Imovel) => {
        navigate(`/imovel/${imovel.idImovel}`, { state: { origem: "favoritos" } });
    };

    return (
        <div className="home-page">
            {vazio ? (
                <Box textAlign="center" mt={5}>
                    <FavoriteBorderIcon style={{ fontSize: 80, color: '#ccc' }} />
                    <Typography variant="h6" mt={2}>
                        Você ainda não tem imóveis favoritos.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Clique no <span style={{ color: '#e91e63' }}>❤️</span> nos imóveis para adicioná-los aos seus favoritos.
                    </Typography>
                    <Typography
                        variant="body2"
                        color="primary"
                        sx={{
                            mt: 2,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            '&:hover': { color: '#00695c' }
                        }}
                        onClick={() => navigate("/home")}
                    >
                        Veja nossos imóveis disponíveis
                    </Typography>
                </Box>
            ) : (
                <ImoveisGrid
                    onImovelClick={handleOpenDetalhes}
                    modo="favoritos"
                    onEmpty={() => setVazio(true)}
                />
            )}
        </div>
    );
};

export default FavoritosPage;
