import React, { useState, useEffect } from "react";
import "../styles/CancelamentoPopup.css";

interface CancelamentoPopupProps {
    onClose: () => void;
}

interface Agendamento {
    id: number;
    dataAgendamento: string;
    horarioMarcado: boolean;
}

interface Imovel {
    id: number;
    descricaoImovel: string;
}

const CancelamentoPopup: React.FC<CancelamentoPopupProps> = ({ onClose }) => {
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [imovelSelecionado, setImovelSelecionado] = useState<number | null>(
        null
    );

    // Carrega os imóveis na inicialização
    useEffect(() => {
        fetch("http://localhost:8080/imoveis")
            .then((response) => response.json())
            .then((data: Imovel[]) => setImoveis(data))
            .catch((error) =>
                console.error("Erro ao carregar imóveis:", error)
            );
    }, []);

    // Atualiza os agendamentos ao selecionar um imóvel
    const handleImovelChange = (id: number) => {
        setImovelSelecionado(id);
        if (id) {
            fetch(`http://localhost:8080/agendamentos?imovelId=${id}`)
                .then((response) => response.json())
                .then((data: Agendamento[]) => {
                    console.log("Agendamentos recebidos:", data); // Verifique o que está sendo retornado
                    setAgendamentos(data);
                })
                .catch((error) => console.error("Erro ao carregar agendamentos:", error));
        } else {
            setAgendamentos([]);
        }
    };



    // Cancela um agendamento específico
    const handleCancelar = async (agendamentoId: number) => {
        try {
            await fetch(
                `http://localhost:8080/agendamentos/cancelar/${agendamentoId}`,
                {
                    method: "DELETE",
                }
            );
            alert("Agendamento cancelado com sucesso!");
            setAgendamentos((prev) =>
                prev.filter((a) => a.id !== agendamentoId)
            );
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
            alert("Erro ao cancelar agendamento.");
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <button onClick={onClose} className="close-popup">
                    Fechar
                </button>
                <h2>Cancelar Agendamentos</h2>
                <select
                    onChange={(e) =>
                        handleImovelChange(Number(e.target.value))
                    }
                >
                    <option value="">Selecione um imóvel</option>
                    {imoveis.map((imovel) => (
                        <option key={imovel.id} value={imovel.id}>
                            {imovel.descricaoImovel}
                        </option>
                    ))}
                </select>
                <ul>
                    {agendamentos.length > 0 ? (
                        agendamentos.map((agendamento) => (
                            <li key={agendamento.id}>
                                {agendamento.dataAgendamento} -{" "}
                                {agendamento.horarioMarcado ? "Tarde" : "Manhã"}
                                <button
                                    onClick={() => handleCancelar(agendamento.id)}
                                    className="cancel-button"
                                >
                                    Cancelar
                                </button>
                            </li>
                        ))
                    ) : (
                        <p>Nenhum agendamento encontrado para este imóvel.</p>
                    )}
                </ul>


            </div>
        </div>
    );
};

export default CancelamentoPopup;
