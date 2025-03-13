import React, { useEffect, useState } from 'react';
import { Imovel } from '../types/Imovel';
import api from '../services/api';
import '../styles/ImoveisGrid.css';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface ImoveisGridProps {
    onImovelClick: (imovel: Imovel) => void;
}

const ImoveisGrid: React.FC<ImoveisGridProps> = ({ onImovelClick }) => {
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [filteredImoveis, setFilteredImoveis] = useState<Imovel[]>([]);
    const [tipoResidencia, setTipoResidencia] = useState<string>('');
    const [valor, setValor] = useState<string>('');

    useEffect(() => {
        const fetchImoveis = async () => {
            try {
                const response = await api.get('/imoveis');
                setImoveis(response.data);
                setFilteredImoveis(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Erro ao buscar imóveis:", error);
            }
        };
        fetchImoveis();
    }, []);

    useEffect(() => {
        filterImoveis();
    }, [tipoResidencia, valor]);

    const filterImoveis = () => {
        let filtered = imoveis;

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
    };

    return (
        <div>
            <div className="filters">
                <FormControl variant="standard" sx={{ border: 'none', boxShadow: 'none', minWidth: 120, marginRight: '16px' }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                        value={tipoResidencia}
                        onChange={(e) => setTipoResidencia(e.target.value as string)}
                        label="Tipo de Residência"
                    >
                        <MenuItem value="Apartamento">Apartamento</MenuItem>
                        <MenuItem value="Casa">Casa</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="standard" sx={{ border: 'none', boxShadow: 'none', minWidth: 120 }}>
                    <InputLabel>Valor</InputLabel>
                    <Select
                        value={valor}
                        onChange={(e) => setValor(e.target.value as string)}
                        label="Valor"
                    >
                        <MenuItem value="Menor Valor">Menor Valor</MenuItem>
                        <MenuItem value="Maior Valor">Maior Valor</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <div className="imoveis-grid">
                {filteredImoveis.map((imovel) => (
                    <div
                        key={imovel.idImovel || Math.random()}
                        className="imovel-card"
                        onClick={() => onImovelClick(imovel)}
                    >
                        <img
                            src={
                                imovel.fotosImovel && imovel.fotosImovel.length > 0
                                    ? imovel.fotosImovel[0]
                                    : "https://via.placeholder.com/300x200?text=Sem+Imagens"
                            }
                            alt={`Foto do imóvel ${imovel.tipoImovel}`}
                        />
                        <h3>{imovel.tipoImovel}</h3>
                        <p>Valor: R$ {imovel.precoImovel}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImoveisGrid;