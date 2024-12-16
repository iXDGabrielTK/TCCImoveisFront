import "../styles/CancelamentoPopup.css";
import React, { useState } from "react";
import { format, parseISO } from "date-fns"; // Importa funções de formatação
import { ptBR } from "date-fns/locale";

interface Agendamento {
    id: number;
    dataAgendamento: string; // ISO format
    horarioMarcado: boolean;
    cancelado: boolean;
}

interface Props {
    agendamentos: Agendamento[];
    onClose: () => void;
    onCancel: (id: number, motivo: string) => void;
}

const AgendamentosPopUp: React.FC<Props> = ({ agendamentos, onClose, onCancel }) => {
    const [showConfirmation, setShowConfirmation] = useState<number | null>(null);
    const [cancelReason, setCancelReason] = useState<string>("");

    const handleCancel = (id: number) => {
        if (cancelReason) {
            onCancel(id, cancelReason);
            setShowConfirmation(null);
            setCancelReason("");
        } else {
            alert("Por favor, selecione um motivo para cancelar.");
        }
    };

    // Função para formatar data no padrão brasileiro
    const formatarData = (dataISO: string) => {
        try {
            return format(parseISO(dataISO), "dd/MM/yyyy", { locale: ptBR });
        } catch {
            return dataISO; // Caso a data não seja válida
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="popup-close" onClick={onClose}>
                    X
                </button>
                <h2>Seus Agendamentos</h2>
                {agendamentos.length === 0 ? (
                    <p>Nenhum agendamento disponível.</p>
                ) : (
                    <ul className="agendamento-list">
                        {agendamentos.map((agendamento) => (
                            <li
                                key={agendamento.id}
                                className={`agendamento-item ${
                                    agendamento.cancelado ? "item-cancelado" : ""
                                }`}
                            >
                                <div className="agendamento-info">
                                    <span
                                        className={`status-circle ${
                                            agendamento.cancelado ? "inactive" : "active"
                                        }`}
                                    ></span>
                                    {/* Exibe a data formatada */}
                                    <span className="date-text">
                                        {formatarData(agendamento.dataAgendamento)}
                                    </span>
                                    {!agendamento.cancelado && (
                                        <button
                                            className="cancel-button"
                                            onClick={() =>
                                                setShowConfirmation((prev) =>
                                                    prev === agendamento.id ? null : agendamento.id
                                                )
                                            }
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                                {!agendamento.cancelado && showConfirmation === agendamento.id && (
                                    <div className="confirm-cancel">
                                        <hr className="divider" />
                                        <div className="cancel-options">
                                            <select
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                className="reason-select"
                                            >
                                                <option value="">Motivo</option>
                                                <option value="Problema pessoal">
                                                    Problema pessoal
                                                </option>
                                                <option value="Erro no agendamento">
                                                    Erro no agendamento
                                                </option>
                                                <option value="Outro">Outro</option>
                                            </select>
                                            <span className="confirmation-text">Tem certeza?</span>
                                            <button
                                                className="confirm-button"
                                                onClick={() => handleCancel(agendamento.id)}
                                            >
                                                Sim!
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AgendamentosPopUp;
