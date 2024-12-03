import React, { useState } from 'react';
import Slider from './Slider';
import { Imovel } from '../types/Imovel';
import '../styles/ImovelDetalhes.css';
import { getHolidays } from '../types/holidays';
import CustomDatePicker from './CustomDatePicker';

interface ImovelDetalhesProps {
    imovel: Imovel;
    onClose: () => void;
}

const ImovelDetalhes: React.FC<ImovelDetalhesProps> = ({ imovel, onClose }) => {
    const imageUrls = Array.isArray(imovel.fotosImovel)
        ? imovel.fotosImovel
        : typeof imovel.fotosImovel === 'string'
            ? imovel.fotosImovel.split(',').map((url) => url.trim())
            : ["https://via.placeholder.com/300x200?text=Sem+Imagens"];

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [periodo, setPeriodo] = useState<string>('Manhã');
    const [nomeVisitante, setNomeVisitante] = useState<string>('');

    const holidays = getHolidays(new Date().getFullYear());

    const handleAgendarVisita = async () => {
        const usuarioIdRaw = localStorage.getItem("usuario_Id");
        console.log("Usuario ID recuperado do localStorage (raw):", usuarioIdRaw);
        const usuario_Id = usuarioIdRaw ? parseInt(usuarioIdRaw, 10) : null;
        console.log("Usuario ID convertido:", usuario_Id);


        console.log("Usuario ID recuperado do localStorage:", usuarioIdRaw); // Verifica o valor antes da conversão
        console.log("Usuario ID convertido:", usuario_Id); // Verifica o valor após a conversão

        if (!startDate || !nomeVisitante.trim()) {
            alert("Por favor, selecione uma data e insira seu nome.");
            return;
        }

        const formattedDate = startDate.toISOString().split('T')[0];

        const data = {
            nomeVisitante,
            imovelId: imovel.idImovel,
            dataAgendamento: formattedDate,
            horarioMarcado: periodo === 'Tarde',
            usuario_Id, // Usa o valor convertido
        };

        console.log("Dados enviados para a API:", data);

        try {
            const response = await fetch('http://localhost:8080/agendamentos/agendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert("Agendamento realizado com sucesso!");
                setStartDate(null);
                setNomeVisitante('');
                setPeriodo('Manhã');
            } else {
                const errorMessage = await response.text();
                alert(`Erro ao agendar: ${errorMessage}`);
            }
        } catch (error) {
            alert(`Erro de conexão: ${error}`);
        }
    };



    return (
        <div className="imovel-detalhes-modal">
            <div className="imovel-detalhes-content">
                <div className="imovel-detalhes-left">
                    <Slider images={imageUrls} />
                </div>
                <div className="imovel-detalhes-right">
                    <button onClick={onClose} className="close-button">Fechar</button>
                    <div className="imovel-info">
                        <h1>{imovel.tipoImovel ? "Residencial" : "Comercial"}</h1>
                        <p><em>{imovel.descricaoImovel}</em></p>
                        <hr />
                        <p><strong>Valor:</strong> R$ {imovel.precoImovel}</p>
                        <p><strong>Tamanho:</strong> {imovel.tamanhoImovel} m²</p>
                        <p><strong>Status:</strong> {imovel.statusImovel ? "Disponível" : "Indisponível"}</p>
                        <p><strong>Rua:</strong> {imovel.enderecoImovel?.rua || "Não informado"}</p>
                        <p><strong>Número:</strong> {imovel.enderecoImovel?.numero || "Não informado"}</p>
                        <p><strong>Cidade:</strong> {imovel.enderecoImovel?.cidade || "Não informado"}</p>
                    </div>
                    <div className="agendamento-container">
                        <h2>Agendar Visita</h2>
                        <>
                            <input
                                type="text"
                                placeholder="Nome do visitante"
                                value={nomeVisitante}
                                onChange={(e) => setNomeVisitante(e.target.value)}
                            />
                            <CustomDatePicker
                                selected={startDate || undefined}
                                onChange={(date: Date | null) => setStartDate(date)}
                                holidays={holidays}
                                errorMessage={!startDate ? "Selecione uma data válida" : undefined}
                            />

                            <div className="radio-container">
                                <label>
                                    <input
                                        type="radio"
                                        value="Manhã"
                                        checked={periodo === 'Manhã'}
                                        onChange={() => setPeriodo('Manhã')}
                                    />
                                    Manhã
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="Tarde"
                                        checked={periodo === 'Tarde'}
                                        onChange={() => setPeriodo('Tarde')}
                                    />
                                    Tarde
                                </label>
                            </div>
                            <button onClick={handleAgendarVisita} className="agendar-visita">
                                Agendar uma visita
                            </button>
                        </>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImovelDetalhes;