import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Imovel } from '../types/Imovel';
import api from '../services/api';
import '../styles/ImoveisGrid.css';
import '../styles/shared.css';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import { useNavigate } from "react-router-dom";
import SkeletonImovel from './SkeletonImovel.tsx';
import { useImoveisContext } from '../context/ImoveisContext';
import LoadingText from "./LoadingText.tsx";
import FavoritoButton from "./FavoritoButton.tsx";
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

interface ImoveisGridProps {
    modo: 'todos' | 'filtrados' | 'favoritos';
    valorMaximo?: number;
    origem?: "simulacao" | "padrao";
    onImovelClick?: (imovel: Imovel) => void;
    onEmpty?: () => void;
    selectedImobiliariaId?: number | '';
}

const ImoveisGrid: React.FC<ImoveisGridProps> = ({ modo, valorMaximo, origem = "padrao", onImovelClick, onEmpty, selectedImobiliariaId }) => { // <--- selectedImobiliariaId adicionado aqui
    const navigate = useNavigate();
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [filteredImoveis, setFilteredImoveis] = useState<Imovel[]>([]);
    const [tipoResidencia, setTipoResidencia] = useState<string>('');
    const [valor, setValor] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const { termoBusca } = useImoveisContext();
    const observerRef = useRef<HTMLDivElement | null>(null);

    const resetMessages = useCallback(() => {
        setErrorMessage("");
    }, []);

    const fetchImoveis = useCallback(async (reset = false) => {
        if (reset) {
            setPage(0);
            setImoveis([]);
            setHasMore(true);
        }

        if (modo === 'favoritos') {
            setIsLoading(true);
            resetMessages();
            try {
                const response = await api.get('/favoritos');
                const favoritos = response.data;
                setImoveis(favoritos);
                setHasMore(false);
                if (favoritos.length === 0 && onEmpty) onEmpty();
            } catch (error) {
                console.error("Erro ao buscar favoritos:", error);
                const apiError = error as ApiError;
                setErrorMessage(apiError?.response?.data?.message || "Erro ao buscar favoritos. Tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);
        resetMessages();

        let endpoint = '/imoveis';
        const params: {
            page: number;
            size: number;
            sort: string;
            valorMax?: number;
        } = {
            page: reset ? 0 : page,
            size: 8,
            sort: 'idImovel,desc',
        };

        if (selectedImobiliariaId) {
            endpoint = `/imoveis/por-imobiliaria/${selectedImobiliariaId}`;
        } else if (modo === 'filtrados' && valorMaximo) {
            endpoint = '/imoveis/disponiveis';
            params.valorMax = valorMaximo;
        }

        try {
            const response = await api.get(endpoint, { params });
            const pageData = response.data;
            const novosImoveis = pageData.content;

            setImoveis(prev => {
                const idsExistentes = new Set(prev.map((imv: Imovel) => imv.idImovel));
                const novosFiltrados = novosImoveis.filter((imv: Imovel) => !idsExistentes.has(imv.idImovel));
                return [...prev, ...novosFiltrados];
            });

            if (pageData.last || novosImoveis.length < params.size) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Erro ao buscar imóveis:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao buscar imóveis. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }

    }, [resetMessages, modo, page, valorMaximo, onEmpty, selectedImobiliariaId]);

    useEffect(() => {
        void fetchImoveis(true);
    }, [tipoResidencia, valor, termoBusca, fetchImoveis, selectedImobiliariaId]);

    useEffect(() => {
        if (page !== 0) void fetchImoveis();
    }, [fetchImoveis, page]);

    useEffect(() => {
        if (!hasMore || isLoading) return;

        const currentRef = observerRef.current;
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setPage(prevPage => prevPage + 1);
                }
            },
            { threshold: 1.0 }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [hasMore, isLoading]);

    const normalizar = (texto: string) =>
        texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    const filterImoveis = useCallback(() => {
        let filtered = [...imoveis];

        if (tipoResidencia) {
            filtered = filtered.filter(imovel => imovel.tipoImovel === tipoResidencia);
        }

        if (termoBusca) {
            const termo = normalizar(termoBusca);
            filtered = filtered.filter(imovel => {
                const campos = [
                    imovel.tipoImovel,
                    imovel.descricaoImovel,
                    imovel.enderecoImovel?.rua,
                    imovel.enderecoImovel?.bairro,
                    imovel.enderecoImovel?.cidade,
                    imovel.enderecoImovel?.estado,
                ];
                return campos.some(campo => typeof campo === 'string' && normalizar(campo).includes(termo));
            });
        }

        if (valor) {
            filtered = filtered.sort((a, b) => {
                if (valor === 'Menor Valor') return a.precoImovel - b.precoImovel;
                if (valor === 'Maior Valor') return b.precoImovel - a.precoImovel;
                return 0;
            });
        }

        setFilteredImoveis(filtered);
    }, [imoveis, tipoResidencia, valor, termoBusca]);

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
                <FormControl variant="standard" sx={{ minWidth: 120, marginRight: '16px' }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select value={tipoResidencia} onChange={(e) => setTipoResidencia(e.target.value)} disabled={isLoading}>
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="Apartamento">Apartamento</MenuItem>
                        <MenuItem value="Casa">Casa</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <InputLabel>Valor</InputLabel>
                    <Select value={valor} onChange={(e) => setValor(e.target.value)} disabled={isLoading}>
                        <MenuItem value="">Sem ordenação</MenuItem>
                        <MenuItem value="Menor Valor">Menor Valor</MenuItem>
                        <MenuItem value="Maior Valor">Maior Valor</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {isLoading && page === 0 ? (
                <div className="imoveis-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <SkeletonImovel key={index} />
                    ))}
                </div>
            ) : (
                <div className="imoveis-grid">
                    {filteredImoveis.map((imovel) => {
                        const primeiraImagem =
                            imovel.fotosImovel?.[0]?.urlFotoImovel?.trim() !== ""
                                ? imovel.fotosImovel[0].urlFotoImovel
                                : "https://placehold.co/300x200";

                        return (
                            <div
                                key={imovel.idImovel}
                                className="imovel-card"
                                onClick={() =>
                                    onImovelClick
                                        ? onImovelClick(imovel)
                                        : navigate(`/imovel/${imovel.idImovel}`, { state: { origem } })
                                }
                            >
                                <Box position="relative" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                                    <img
                                        src={primeiraImagem}
                                        alt={`Foto do imóvel ${imovel.tipoImovel}`}
                                        style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                                    />
                                    <div style={{position: 'absolute', top: '8px', left: '8px', zIndex: 2,
                                        background: '#2563eb', color: 'white',
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '14px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.10)'}}>
                                        {imovel.tipoImovel}
                                    </div>
                                    <FavoritoButton idImovel={imovel.idImovel} />
                                </Box>

                                <div style={{fontSize: '24px', fontWeight: 'bold', color: '#16a34a', marginBottom: '12px',
                                    borderRadius: '8px', padding: '8px 0',
                                    textAlign: 'center'}}>
                                    R$ {imovel.precoImovel.toLocaleString('pt-BR')}
                                </div>

                                <div style={{marginBottom: '12px', fontSize: '14px', color: '#6b7280', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                    <LocationOnIcon style={{ color: '#2563eb', fontSize: 25, flexShrink: 0 }} />
                                    <span>
                                        <strong>{imovel.enderecoImovel?.bairro}</strong><br/>
                                         {imovel.enderecoImovel?.rua}, {imovel.enderecoImovel?.cidade}, {imovel.enderecoImovel?.estado}
                                    </span>
                                </div>

                                <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #808080', margin: '8px 0 12px 0'}} />

                                {imovel.descricaoImovel && (
                                    <div style={{fontSize: '14px', color: '#6b7280', maxHeight: '56px', overflow: 'hidden', position: 'relative', marginBottom: '8px', textAlign: 'left'}}>
                                        {imovel.descricaoImovel.length > 100
                                            ? `${imovel.descricaoImovel.substring(0, 100)}...`
                                            : imovel.descricaoImovel
                                        }
                                        {imovel.descricaoImovel.length > 100 && (
                                            <span style={{
                                                position: 'absolute', right: 0, bottom: 0, paddingLeft: '8px',
                                                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, #fff 80%)',
                                                color: '#2563eb', cursor: 'pointer', fontWeight: 500
                                            }}>
                                                ver mais
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {isLoading && page > 0 && (
                <Box textAlign="center" mt={2}>
                    <LoadingText />
                </Box>
            )}

            {hasMore && (
                <div ref={observerRef}>
                    {isLoading && page > 0 && (
                        <Box textAlign="center" mt={2}>
                            <LoadingText />
                        </Box>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImoveisGrid;