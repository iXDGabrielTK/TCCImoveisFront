import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/EditarVistoria.css";

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
    const [vistorias, setVistorias] = useState<Vistoria[]>([]);
    const [selectedVistoria, setSelectedVistoria] = useState<number | null>(null);
    const [tipoVistoria, setTipoVistoria] = useState<string>("");
    const [laudoVistoria, setLaudoVistoria] = useState("");
    const [dataVistoria, setDataVistoria] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchVistorias();
        }
    }, [isOpen]);

    const fetchVistorias = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");
            const response = await api.get("/vistorias");
            setVistorias(response.data);
        } catch (error) {
            console.error("Erro ao buscar vistorias:", error);
            setErrorMessage("Erro ao buscar vistorias.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const vistoriaId = parseInt(event.target.value, 10);

        if (isNaN(vistoriaId)) {
            setErrorMessage("Erro: ID da vistoria inválido.");
            return;
        }

        setSelectedVistoria(vistoriaId);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            console.log(`Buscando detalhes para vistoria ID: ${vistoriaId}`);
            const response = await api.get(`/vistorias/${vistoriaId}`);
            const vistoria = response.data;

            setTipoVistoria(vistoria.tipoVistoria);
            setLaudoVistoria(vistoria.laudoVistoria);
            setDataVistoria(vistoria.dataVistoria);
        } catch (error) {
            console.error("Erro ao buscar detalhes da vistoria:", error);
            setErrorMessage("Erro ao carregar os detalhes da vistoria.");
        }
    };


    const handleEdit = async () => {
        if (!selectedVistoria || !tipoVistoria || !laudoVistoria || !dataVistoria) {
            setErrorMessage("Todos os campos devem ser preenchidos.");
            return;
        }

        const formattedDate = new Date(dataVistoria).toISOString().split('T')[0];

        try {
            setIsLoading(true);
            setErrorMessage("");
            setSuccessMessage("");
            await api.put(`/vistorias/${selectedVistoria}`, {
                tipoVistoria,
                laudoVistoria,
                dataVistoria: formattedDate,
            });
            setSuccessMessage("Vistoria editada com sucesso!");
            fetchVistorias();
        } catch (error) {
            console.error("Erro ao editar vistoria:", error);
            setErrorMessage("Erro ao editar vistoria.");
        } finally {
            setIsLoading(false);
        }
    };



    const handleCancel = async () => {
        if (!selectedVistoria) {
            setErrorMessage("Selecione uma vistoria para cancelar.");
            return;
        }

        if (!window.confirm("Tem certeza que deseja cancelar esta vistoria?")) return;

        try {
            setIsLoading(true);
            setErrorMessage("");
            setSuccessMessage("");
            await api.put(`/vistorias/${selectedVistoria}/cancelar`);
            setSuccessMessage("Vistoria cancelada com sucesso!");
            fetchVistorias();
        } catch (error) {
            console.error("Erro ao cancelar vistoria:", error);
            setErrorMessage("Erro ao cancelar vistoria.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Editar Vistoria</h2>
                {errorMessage && <p className="error">{errorMessage}</p>}
                {successMessage && <p className="success">{successMessage}</p>}

                <label htmlFor="vistoria-select" className={"label-vistoria"}>Selecione a vistoria:</label>
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
                        <label htmlFor="tipo" className={"label-vistoria"}>Tipo da Vistoria:</label>
                        <input
                            id="tipo"
                            type="text"
                            className="input-vistoria"
                            value={tipoVistoria}
                            onChange={(e) => setTipoVistoria(e.target.value)}
                            disabled={isLoading}
                        />

                        <label htmlFor="laudo" className={"label-vistoria"}>Laudo da Vistoria:</label>
                        <input
                            id="laudo"
                            type="text"
                            className="input-vistoria"
                            value={laudoVistoria}
                            onChange={(e) => setLaudoVistoria(e.target.value)}
                            disabled={isLoading}
                        />

                        <label htmlFor="data" className={"label-vistoria"}>Data da Vistoria:</label>
                        <input
                            id="data"
                            type="date"
                            className="input-vistoria"
                            value={dataVistoria}
                            onChange={(e) => setDataVistoria(e.target.value)}
                            disabled={isLoading}
                        />

                        <div className="modal-actions">
                            <button onClick={handleEdit} disabled={isLoading}>
                                {isLoading ? "Salvando..." : "Salvar"}
                            </button>
                            <button onClick={handleCancel} disabled={isLoading}>
                                {isLoading ? "Cancelando..." : "Cancelar"}
                            </button>
                        </div>
                    </>
                )}

                <button className="close-button" onClick={onClose} disabled={isLoading}>
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default EditarVistoriaModal;
