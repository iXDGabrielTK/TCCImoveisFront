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
import FavoritoButton from './FavoritoButton'; // ajuste o caminho se necessário
import { useFavoritos } from '../hooks/useFavoritos';

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
    const [somenteFavoritos, setSomenteFavoritos] = useState<string>('todos');
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

        setIsLoading(true);
        resetMessages();

        const params: {
            page: number;
            size: number;
            sort: string;
            valorMax?: number;
        } = {
            page: reset ? 0 : page,
            size: 8,
            sort: 'idImovel,asc',
        };

        if (modo === 'filtrados' && valorMaximo) {
            params.valorMax = valorMaximo;
        }

        try {
            const endpoint = modo === 'filtrados' && valorMaximo
                ? '/imoveis/disponiveis'
                : '/imoveis';

            const response = await api.get(endpoint, { params });
            const pageData = response.data;
            const novosImoveis = pageData.content;

            setImoveis(prev => {
                const idsExistentes = new Set(prev.map((imv: Imovel) => imv.idImovel));
                const novosFiltrados = novosImoveis.filter((imv: Imovel) => !idsExistentes.has(imv.idImovel));
                return [...prev, ...novosFiltrados];
            });

            if (pageData.last || novosImoveis.length < 8) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Erro ao buscar imóveis:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao buscar imóveis. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    }, [modo, valorMaximo, page, resetMessages]);

    useEffect(() => {
        void fetchImoveis(true);
    }, [tipoResidencia, valor, termoBusca, fetchImoveis]);

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

    const { favoritosIds } = useFavoritos();

    const filterImoveis = useCallback(() => {
        let filtered = imoveis.map(imv => ({
            ...imv,
            favoritado: favoritosIds.has(imv.idImovel)
        }));

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

        if (somenteFavoritos === 'favoritos') {
            filtered = filtered.filter(imv => imv.favoritado === true);
        }

        setFilteredImoveis(filtered);
    }, [imoveis, tipoResidencia, valor, termoBusca, somenteFavoritos, favoritosIds]);

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
                        <MenuItem value="Apartamento"                                               >Apartamento</MenuItem>
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
                <FormControl variant="standard" sx={{ minWidth: 150, marginLeft: '16px' }}>
                    <InputLabel>Favoritos</InputLabel>
                    <Select
                        value={somenteFavoritos}
                        onChange={(e) => setSomenteFavoritos(e.target.value)}
                        disabled={isLoading}
                    >
                        <MenuItem value="todos">Todos</MenuItem>
                        <MenuItem value="favoritos">Apenas Favoritos</MenuItem>
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
                        // MODIFICAÇÃO AQUI:
                        const primeiraImagem =
                            imovel.fotosImovel?.[0]?.urlFotoImovel // Acessa a propriedade 'urlFotoImovel' do primeiro objeto
                            && typeof imovel.fotosImovel[0].urlFotoImovel === "string" // Garante que é uma string
                            && (imovel.fotosImovel[0].urlFotoImovel as string).trim() !== "" // Garante que não está vazia
                                ? imovel.fotosImovel[0].urlFotoImovel // Usa a URL completa se todas as condições forem verdadeiras
                                : "https://placehold.co/300x200"; // Caso contrário, usa o placeholder

                        return (
                            <div key={imovel.idImovel} className="imovel-card">
                                <div className="imagem-container">
                                    <img src={primeiraImagem} alt={`Foto do imóvel ${imovel.tipoImovel}`} />
                                    <div className="favorito-btn-wrapper">
                                        <FavoritoButton idImovel={imovel.idImovel} />
                                    </div>
                                </div>

                                <div
                                    className="imovel-content"
                                    onClick={() =>
                                        onImovelClick
                                            ? onImovelClick(imovel)
                                            : navigate(`/imovel/${imovel.idImovel}`, { state: { origem } })
                                    }
                                >
                                    <h3>{imovel.tipoImovel}</h3>
                                    <p>Valor: R$ {imovel.precoImovel}</p>
                                </div>
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