import React, { useEffect, useState, useCallback } from 'react';
import { Imovel } from '../types/Imovel';
import api from '../services/api';
import '../styles/ImoveisGrid.css';
import '../styles/shared.css';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from "react-router-dom";

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

interface ImoveisGridProps {
    modo: 'todos' | 'filtrados';
    valorMaximo?: number;
    origem?: "simulacao" | "padrao";
    onImovelClick?: (imovel: Imovel) => void;
}


const ImoveisGrid: React.FC<ImoveisGridProps> = ({ modo, valorMaximo, origem = "padrao", onImovelClick }) => {
    const navigate = useNavigate();
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [filteredImoveis, setFilteredImoveis] = useState<Imovel[]>([]);
    const [tipoResidencia, setTipoResidencia] = useState<string>('');
    const [valor, setValor] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const resetMessages = useCallback(() => {
        setErrorMessage("");
    }, []);

    const fetchImoveis = useCallback(async () => {
        try {
            setIsLoading(true);
            resetMessages();
            let response;

            if (modo === 'filtrados' && valorMaximo) {
                response = await api.get('/imoveis/disponiveis', {
                    params: { valorMax: valorMaximo },
                });
            } else {
                response = await api.get('/imoveis');
            }

            setImoveis(response.data);
            setFilteredImoveis(response.data);
        } catch (error: unknown) {
            console.error("Erro ao buscar imóveis:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao buscar imóveis. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    }, [resetMessages, modo, valorMaximo]);

    useEffect(() => {
        const loadImoveis = async () => {
            await fetchImoveis();
        };
        void loadImoveis();
    }, [fetchImoveis]);

    const filterImoveis = useCallback(() => {
        let filtered = [...imoveis];

        if (tipoResidencia) {
            filtered = filtered.filter(imovel => imovel.tipoImovel === tipoResidencia);
        }

        if (valor) {
            filtered = filtered.sort((a, b) => {
                if (valor === 'Menor Valor') {
                    return a.precoImovel - b.precoImovel;
                } else if (valor === 'Maior Valor') {
                    return b.precoImovel - a.precoImovel;
                }
                return 0;
            });
        }

        setFilteredImoveis(filtered);
    }, [imoveis, tipoResidencia, valor]);

    useEffect(() => {
        filterImoveis();
    }, [filterImoveis]);

    return (
        <div>
            {errorMessage && (
                <div className="error-container">
                    <p className="error-title">Erro:</p>
                    <p className="error-message">{errorMessage}</p>
                </div>
            )}

            <div className="filters">
                <FormControl
                    variant="standard"
                    sx={{ border: 'none', boxShadow: 'none', minWidth: 120, marginRight: '16px' }}
                >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                        value={tipoResidencia}
                        onChange={(e) => setTipoResidencia(e.target.value as string)}
                        label="Tipo de Residência"
                        disabled={isLoading}
                        MenuProps={{
                            disablePortal: true,
                            disableScrollLock: true,
                            PaperProps: {
                                sx: {
                                    mt: 1,
                                    backgroundColor: '#f3f3f3',
                                    borderRadius: '8px',
                                    boxShadow: 3,
                                    border: 'none',
                                    zIndex: 1100
                                },
                            },
                            BackdropProps: {
                                sx: {
                                    backgroundColor: 'transparent',
                                },
                            },
                        }}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="Apartamento">Apartamento</MenuItem>
                        <MenuItem value="Casa">Casa</MenuItem>
                    </Select>
                </FormControl>

                <FormControl
                    variant="standard"
                    sx={{ border: 'none', boxShadow: 'none', minWidth: 120 }}
                >
                    <InputLabel>Valor</InputLabel>
                    <Select
                        value={valor}
                        onChange={(e) => setValor(e.target.value as string)}
                        label="Valor"
                        disabled={isLoading}
                        MenuProps={{
                            disablePortal: true,
                            disableScrollLock: true,
                            PaperProps: {
                                sx: {
                                    mt: 1,
                                    backgroundColor: '#f3f3f3',
                                    borderRadius: '8px',
                                    boxShadow: 3,
                                    border: 'none',
                                    zIndex: 1100
                                },
                            },
                            BackdropProps: {
                                sx: {
                                    backgroundColor: 'transparent',
                                },
                            },
                        }}
                    >
                        <MenuItem value="">Sem ordenação</MenuItem>
                        <MenuItem value="Menor Valor">Menor Valor</MenuItem>
                        <MenuItem value="Maior Valor">Maior Valor</MenuItem>
                    </Select>
                </FormControl>
            </div>


            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Carregando imóveis...</p>
                </div>
            ) : (
                <div className="imoveis-grid">
                    {filteredImoveis.map((imovel) => {
                        const primeiraImagem =
                            typeof imovel.fotosImovel?.[0] === "string" && (imovel.fotosImovel[0] as string).trim() !== ""
                                ? imovel.fotosImovel[0]
                                : "https://placehold.co/300x200";

                        return (
                            <div
                                key={imovel.idImovel || Math.random()}
                                className="imovel-card"
                                onClick={() =>
                                    onImovelClick
                                        ? onImovelClick(imovel)
                                        : navigate(`/imovel/${imovel.idImovel}`, {
                                            state: { origem }, // ⬅️ passando origem para a próxima tela
                                        })
                                }
                            >
                                <img
                                    src={primeiraImagem}
                                    alt={`Foto do imóvel ${imovel.tipoImovel}`}
                                />
                                <h3>{imovel.tipoImovel}</h3>
                                <p>Valor: R$ {imovel.precoImovel}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ImoveisGrid;
