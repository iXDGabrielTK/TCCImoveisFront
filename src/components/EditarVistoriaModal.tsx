import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import "../styles/EditarVistoria.css";
import "../styles/shared.css";
import { ApiError, getErrorMessage } from "../utils/errorHandling";
import { useToast } from "../context/ToastContext";

interface Vistoria {
    idVistoria: number;
    tipoVistoria: string;
    laudoVistoria: string;
    dataVistoria: string;
}

interface EditarVistoriaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EditarVistoriaModal: React.FC<EditarVistoriaModalProps> = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const [vistorias, setVistorias] = useState<Vistoria[]>([]);
    const [selectedVistoria, setSelectedVistoria] = useState<number | null>(null);
    const [tipoVistoria, setTipoVistoria] = useState<string>("");
    const [laudoVistoria, setLaudoVistoria] = useState("");
    const [dataVistoria, setDataVistoria] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const resetMessages = useCallback(() => {
        setErrorMessage("");
        setSuccessMessage("");
    }, [setErrorMessage, setSuccessMessage]);

    const fetchVistorias = useCallback(async () => {
        try {
            setIsLoading(true);
            resetMessages();
            const response = await api.get("/vistorias");
            setVistorias(response.data);
        } catch (error: unknown) {
            console.error("Erro ao buscar vistorias:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao buscar vistorias.");
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, setVistorias, setErrorMessage, resetMessages]);

    useEffect(() => {
        if (!isOpen) return;

        const loadVistorias = async () => {
            await fetchVistorias();
        };

        void loadVistorias(); 
    }, [isOpen, fetchVistorias]);



    const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const vistoriaId = parseInt(event.target.value, 10);

        if (isNaN(vistoriaId)) {
            setErrorMessage("ID da vistoria inválido.");
            return;
        }

        setSelectedVistoria(vistoriaId);
        resetMessages();

        try {
            const response = await api.get(`/vistorias/${vistoriaId}`);
            const vistoria = response.data;

            setTipoVistoria(vistoria.tipoVistoria);
            setLaudoVistoria(vistoria.laudoVistoria);
            setDataVistoria(vistoria.dataVistoria);
        } catch (error: unknown) {
            console.error("Erro ao buscar detalhes da vistoria:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao carregar os detalhes da vistoria.");
        }
    };

    const handleSaveEdicao = async () => {
        if (!selectedVistoria || !tipoVistoria || !laudoVistoria || !dataVistoria) {
            setErrorMessage("Todos os campos devem ser preenchidos.");
            return;
        }

        try {
            setIsLoading(true);
            resetMessages();
            await api.put(`/vistorias/${selectedVistoria}`, {
                tipoVistoria,
                laudoVistoria,
                dataVistoria, // já está no formato "yyyy-mm-dd"
            });
            setSuccessMessage("Vistoria editada com sucesso!");
            await fetchVistorias();
        } catch (error: unknown) {
            console.error("Erro ao editar vistoria:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao editar vistoria.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelarVistoria = () => {
        if (!selectedVistoria) {
            showToast("Selecione uma vistoria para cancelar.", "error");
            setErrorMessage("Selecione uma vistoria para cancelar.");
            return;
        }

        setShowConfirmDialog(true);
    };

    const proceedWithCancellation = async () => {
        try {
            setIsLoading(true);
            resetMessages();
            await api.put(`/vistorias/${selectedVistoria}/cancelar`);
            showToast("Vistoria cancelada com sucesso!", "success");
            setSuccessMessage("Vistoria cancelada com sucesso!");
            await fetchVistorias();
        } catch (error: unknown) {
            console.error("Erro ao cancelar vistoria:", error);
            const apiError = error as ApiError;
            showToast(getErrorMessage(apiError), "error");
            setErrorMessage(getErrorMessage(apiError));
        } finally {
            setIsLoading(false);
            setShowConfirmDialog(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Editar Vistoria</h2>
                {errorMessage && (
                    <div className="error-container">
                        <p className="error-title">Erro:</p>
                        <p className="error-message">{errorMessage}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="success-container">
                        <p className="success-message">{successMessage}</p>
                    </div>
                )}

                <label htmlFor="vistoria-select" className="label-vistoria">Selecione a vistoria:</label>
                <select
                    id="vistoria-select"
                    className="vistoria-select"
                    value={selectedVistoria || ""}
                    onChange={handleSelectChange}
                    disabled={isLoading}
                >
                    <option value="">Selecione...</option>
                    {vistorias.map((vistoria) => (
                        <option key={vistoria.idVistoria} value={vistoria.idVistoria}>
                            {vistoria.tipoVistoria} - {vistoria.dataVistoria}
                        </option>
                    ))}
                </select>

                {selectedVistoria && (
                    <>
                        <label htmlFor="tipo" className="label-vistoria">Tipo da Vistoria:</label>
                        <input
                            id="tipo"
                            type="text"
                            className="input-vistoria"
                            value={tipoVistoria}
                            onChange={(e) => setTipoVistoria(e.target.value)}
                            disabled={isLoading}
                        />

                        <label htmlFor="laudo" className="label-vistoria">Laudo da Vistoria:</label>
                        <input
                            id="laudo"
                            type="text"
                            className="input-vistoria"
                            value={laudoVistoria}
                            onChange={(e) => setLaudoVistoria(e.target.value)}
                            disabled={isLoading}
                        />

                        <label htmlFor="data" className="label-vistoria">Data da Vistoria:</label>
                        <input
                            id="data"
                            type="date"
                            className="input-vistoria"
                            value={dataVistoria}
                            onChange={(e) => setDataVistoria(e.target.value)}
                            disabled={isLoading}
                        />

                        <div className="modal-actions">
                            <button onClick={handleSaveEdicao} disabled={isLoading}>
                                {isLoading ? "Salvando..." : "Salvar"}
                            </button>
                            <button onClick={handleCancelarVistoria} disabled={isLoading}>
                                {isLoading ? "Cancelando..." : "Cancelar Vistoria"}
                            </button>
                        </div>
                    </>
                )}

                <button className="close-button" onClick={onClose} disabled={isLoading}>
                    Fechar
                </button>
            </div>

            {showConfirmDialog && (
                <div className="confirm-dialog">
                    <p>Tem certeza que deseja <strong>cancelar</strong> esta vistoria? Esta ação não pode ser desfeita.</p>
                    <div className="dialog-buttons">
                        <button onClick={() => setShowConfirmDialog(false)}>Não</button>
                        <button 
                            onClick={proceedWithCancellation}
                            className="danger-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processando..." : "Sim, cancelar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditarVistoriaModal;
