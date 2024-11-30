import "../styles/CancelamentoPopup.css";
import React from "react";

interface Agendamento {
    id: number; // O ID do agendamento
    dataAgendamento: string; // Data do agendamento (em formato ISO 8601 ou string)
    nomeVisitante: string; // Nome do visitante
    horarioMarcado: boolean; // Indica se o horário está marcado
    cancelado: boolean; // Indica se o agendamento foi cancelado
}


interface Props {
    agendamentos: Agendamento[];
    onClose: () => void;
    onCancel: (id: number) => void;
}

const AgendamentosPopUp: React.FC<Props> = ({ agendamentos, onClose, onCancel }) => {
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
                            <li key={agendamento.id} className="agendamento-item">
                                <span
                                    className={`status-circle ${
                                        agendamento.cancelado ? "inactive" : "active"
                                    }`}
                                ></span>
                                <span>{agendamento.nomeVisitante}</span>
                                {!agendamento.cancelado && (
                                    <button
                                        className="cancel-button"
                                        onClick={() => onCancel(agendamento.id)}
                                        title="Cancelar agendamento"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                {agendamento.cancelado && <span>Cancelado</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};



export default AgendamentosPopUp;
