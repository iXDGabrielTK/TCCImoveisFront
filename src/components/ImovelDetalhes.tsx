import React, { useState } from 'react';
import Slider from './Slider';
import { Imovel } from '../types/Imovel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/ImovelDetalhes.css';
import { getHolidays } from '../types/holidays';

interface ImovelDetalhesProps {
    imovel: Imovel;
    onClose: () => void;
}

const ImovelDetalhes: React.FC<ImovelDetalhesProps> = ({ imovel, onClose }) => {
    const imageUrls = imovel.fotosImovel.map((foto) => foto.urlFotoImovel);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [periodo, setPeriodo] = useState<string>('Manhã');
    const [nomeVisitante, setNomeVisitante] = useState<string>('');

    const holidays = getHolidays(new Date().getFullYear());

    const isWeekdayOrHoliday = (date: Date) => {
        const day = date.getDay();
        const formattedDate = date.toISOString().split('T')[0];
        return day !== 0 && day !== 6 && !holidays.includes(formattedDate);
    };

    const handleAgendarVisita = async () => {
        if (!startDate || !nomeVisitante) {
            alert("Por favor, selecione uma data e insira seu nome.");
            return;
        }

        const data = {
            nomeVisitante,
            imovelId: imovel.idImovel,
            dataAgendamento: startDate.toISOString(),
            horarioMarcado: periodo === 'Tarde'
        };

        try {
            const response = await fetch('http://localhost:8080/agendamentos/agendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                <button onClick={onClose} className="close-button">Fechar</button>
                <Slider images={imageUrls}/>
                <div className="imovel-info">
                    <div className="header">
                        <h1>{imovel.tipoImovel ? "Residencial" : "Comercial"}</h1>
                    </div>
                    <p><em>{imovel.descricaoImovel}</em></p>
                    <hr/>
                    <p><strong>Valor:</strong> R$ {imovel.precoImovel}</p>
                    <p><strong>Tamanho:</strong> {imovel.tamanhoImovel} m²</p>
                    <p><strong>Status:</strong> {imovel.statusImovel ? "Disponível" : "Indisponível"}</p>
                    <p><strong>Rua:</strong> {imovel.enderecoImovel?.rua || "Não informado"}</p>
                    <p><strong>Número:</strong> {imovel.enderecoImovel?.numero || "Não informado"}</p>
                    <p><strong>Cidade:</strong> {imovel.enderecoImovel?.cidade || "Não informado"}</p>

                    <div style={{marginTop: '20px', width: '100%'}}>
                        <input
                            type="text"
                            placeholder="Nome do visitante"
                            value={nomeVisitante}
                            onChange={(e) => setNomeVisitante(e.target.value)}
                            style={{ marginBottom: '10px', width: '100%' }}
                        />
                        <div style={{marginBottom: '10px'}}>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                filterDate={isWeekdayOrHoliday}
                                dayClassName={(date) =>
                                    isWeekdayOrHoliday(date) ? '' : 'disabled-day'
                                }
                                placeholderText="Selecione uma data"
                                minDate={new Date()}
                            />
                        </div>
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
                    </div>
                    <button className="agendar-visita" onClick={handleAgendarVisita}>
                        Agendar uma visita
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImovelDetalhes;
