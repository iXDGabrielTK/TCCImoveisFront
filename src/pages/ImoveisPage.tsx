
import React, { useEffect, useState } from 'react';
import ImoveisGrid from '../components/ImoveisGrid';
import '../styles/ImoveisPage.css';
import { Imovel } from '../types/Imovel';
import { Button, Stack, FormControl, InputLabel, Select, MenuItem, CircularProgress, Box } from '@mui/material'; // <-- Adicionado CircularProgress e Box
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchImobiliariasAprovadas, ImobiliariaResponse } from '../services/imobiliariaService';

const ImoveisPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated, hasRole} = useAuth();

    const [imobiliarias, setImobiliarias] = useState<ImobiliariaResponse[]>([]);
    const [selectedImobiliariaId, setSelectedImobiliariaId] = useState<number | ''>(() => {
        const imobIdFromUrl = parseInt(searchParams.get('imobiliariaId') || '');
        return isNaN(imobIdFromUrl) ? '' : imobIdFromUrl;
    });
    const [isFilterReady, setIsFilterReady] = useState(false);

    const handleImovelClick = (imovel: Imovel) => {
        navigate(`/imovel/${imovel.idImovel}`);
    };

    useEffect(() => {
        const loadAndSetFilter = async () => {
            console.log("--- ImoveisPage Debug (Início do useEffect) ---");
            console.log("isAuthenticated:", isAuthenticated);
            console.log("hasRole('CORRETOR'):", hasRole('CORRETOR'));

            setIsFilterReady(false);

            if (!isAuthenticated) {
                setSearchParams({});
                setSelectedImobiliariaId('');
                setImobiliarias([]);
                setIsFilterReady(true);
                return;
            }

            if (hasRole('FUNCIONARIO')) {
                setSearchParams({});
                setSelectedImobiliariaId('');
                setImobiliarias([]);
                setIsFilterReady(true);
            } else if (hasRole('CORRETOR')) {
                try {
                    const data = await fetchImobiliariasAprovadas();
                    console.log("API /imobiliaria/imobiliarias-aprovadas retornou:", data);
                    setImobiliarias(data);

                    const imobIdFromUrl = parseInt(searchParams.get('imobiliariaId') || '');
                    const isValidUrlImobId = data.some(imob => imob.id === imobIdFromUrl);

                    if (isValidUrlImobId) {
                        setSelectedImobiliariaId(imobIdFromUrl);
                        setSearchParams({ imobiliariaId: imobIdFromUrl.toString() });
                        console.log("selectedImobiliariaId definido pela URL:", imobIdFromUrl);
                    } else if (data.length > 0) {
                        setSelectedImobiliariaId(data[0].id);
                        setSearchParams({ imobiliariaId: data[0].id.toString() });
                        console.log("selectedImobiliariaId definido para primeira imobiliária:", data[0].id);
                    } else {
                        setSelectedImobiliariaId('');
                        setSearchParams({});
                        console.log("selectedImobiliariaId definido para vazio (corretor sem imobiliarias).");
                    }
                    setIsFilterReady(true);
                } catch (error) {
                    console.error("Erro ao carregar imobiliárias aprovadas para corretor:", error);
                    setSelectedImobiliariaId('');
                    setSearchParams({});
                    setIsFilterReady(true);
                }
            } else {
                setSelectedImobiliariaId('');
                setImobiliarias([]);
                setSearchParams({});
                setIsFilterReady(true);
            }
        };

        loadAndSetFilter();

    }, [isAuthenticated, hasRole, searchParams, setSearchParams]);


    useEffect(() => {
        if (isFilterReady && selectedImobiliariaId !== parseInt(searchParams.get('imobiliariaId') || '')) {
            if (selectedImobiliariaId) {
                setSearchParams({ imobiliariaId: selectedImobiliariaId.toString() });
            } else {
                setSearchParams({});
            }
        }
    }, [selectedImobiliariaId, setSearchParams, searchParams, isFilterReady]);


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

            {hasRole('CORRETOR') && imobiliarias.length > 1 && (
                <div style={{ marginBottom: '20px', width: '300px', margin: 'auto' }}>
                    <FormControl fullWidth>
                        <InputLabel id="select-imobiliaria-label">Filtrar por Minha Imobiliária</InputLabel>
                        <Select
                            labelId="select-imobiliaria-label"
                            value={selectedImobiliariaId}
                            label="Filtrar por Minha Imobiliária"
                            onChange={(e) => setSelectedImobiliariaId(e.target.value as number)}
                        >
                            {imobiliarias.map((imobiliaria) => (
                                <MenuItem key={imobiliaria.id} value={imobiliaria.id}>
                                    {imobiliaria.nome}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            )}

            {!isFilterReady ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
            </Box>
            ) : (
            <ImoveisGrid
                onImovelClick={handleImovelClick}
                modo={'todos'}
                selectedImobiliariaId={selectedImobiliariaId}
            />
            )}
        </div>
    );
};

export default ImoveisPage;