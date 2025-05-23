import React, { useEffect, useState, useCallback } from "react";
import "../styles/EditarImovel.css";
import '../styles/shared.css';
import api from "../services/api.ts";
import { ApiError, getErrorMessage } from "../utils/errorHandling";
import { useToast } from "../context/ToastContext";

interface Imovel {
    idImovel: number;
    tipoImovel: string;
    descricaoImovel: string;
    statusImovel: boolean;
    tamanhoImovel: number;
    precoImovel: number;
    fotosImovel?: string | string[];
    enderecoImovel: {
        rua: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
    historicoManutencao: string;
}

interface EditarImovelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EditarImovelModal: React.FC<EditarImovelModalProps> = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [selectedImovelId, setSelectedImovelId] = useState<string | null>(null);

    const [tipoImovel, setTipoImovel] = useState<string>("");
    const [descricaoImovel, setDescricaoImovel] = useState<string>("");
    const [statusImovel, setStatusImovel] = useState<boolean>(true);
    const [tamanhoImovel, setTamanhoImovel] = useState<number>(0);
    const [precoImovel, setPrecoImovel] = useState<number>(0);
    const [imagem, setImagem] = useState<string[]>([]); // Array de strings
    const [endereco, setEndereco] = useState({
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
    });
    const [historicoManutencao, setHistoricoManutencao] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const resetMessages = useCallback(() => {
        setErrorMessage("");
        setSuccessMessage("");
    }, [setErrorMessage, setSuccessMessage]);

    const fetchImoveis = useCallback(async () => {
        setIsLoading(true);
        resetMessages();
        try {
            const response = await api.get('/imoveis', {
                params: { page: 0, size: 1000, sort: 'idImovel,asc' }
            });
            setImoveis(response.data?.content ?? []);
        } catch (error: unknown) {
            console.error("Erro ao buscar imóveis:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao buscar imóveis.");
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, setImoveis, setErrorMessage, resetMessages]);

    useEffect(() => {
        if (!isOpen) return;

        const loadImoveis = async () => {
            await fetchImoveis();
        };

        void loadImoveis();
    }, [isOpen, fetchImoveis]);

    const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const imovelId = event.target.value;

        if (!imovelId) {
            setErrorMessage("Erro: ID do imóvel inválido.");
            return;
        }

        setSelectedImovelId(imovelId);
        resetMessages();
        setIsLoading(true);

        try {
            const response = await api.get(`/imoveis/${imovelId}`);
            const imovel = response.data;

            setTipoImovel(imovel.tipoImovel || "");
            setDescricaoImovel(imovel.descricaoImovel || "");
            setStatusImovel(imovel.statusImovel || false);
            setTamanhoImovel(imovel.tamanhoImovel || 0);
            setPrecoImovel(imovel.precoImovel || 0);
            setHistoricoManutencao(imovel.historicoManutencao || "");
            setImagem(
                Array.isArray(imovel.fotosImovel)
                    ? imovel.fotosImovel.map((foto: string | { urlFotoImovel: string }) => {
                        if (typeof foto === 'string') return foto;
                        return foto.urlFotoImovel || "";
                    })
                    : []
            );
            setEndereco({
                rua: imovel.enderecoImovel?.rua || '',
                numero: imovel.enderecoImovel?.numero || '',
                complemento: imovel.enderecoImovel?.complemento || '',
                bairro: imovel.enderecoImovel?.bairro || '',
                cidade: imovel.enderecoImovel?.cidade || '',
                estado: imovel.enderecoImovel?.estado || '',
                cep: imovel.enderecoImovel?.cep || '',
            });
        } catch (error: unknown) {
            console.error("Erro ao buscar detalhes do imóvel:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao carregar os detalhes do imóvel.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnderecoChange = (field: keyof typeof endereco, value: string) => {
        setEndereco((prevEndereco) => ({
            ...prevEndereco,
            [field]: value,
        }));
    };

    const handleImageInputChange = (value: string) => {
        const filteredImages = value
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url !== "" && url.startsWith("http"));
        setImagem(filteredImages);
    };


    const handleEdit = async () => {
        if (!selectedImovelId) {
            setErrorMessage("Imóvel não selecionado.");
            return;
        }

        const fotosImovelArray = imagem.filter((url) => url && url.trim() !== "" && url.startsWith("http"));

        if (fotosImovelArray.length === 0) {
            setErrorMessage("Adicione pelo menos uma URL válida de imagem.");
            return;
        }

        const data = {
            tipoImovel,
            descricaoImovel,
            statusImovel,
            tamanhoImovel,
            precoImovel,
            fotosImovel: fotosImovelArray,
            enderecoImovel: endereco,
            historicoManutencao,
        };

        console.log("Payload enviado:", data);

        try {
            setIsLoading(true);
            resetMessages();

            await api.put(`/imoveis/${selectedImovelId}`, data);

            setSuccessMessage("Imóvel atualizado com sucesso!");
            await fetchImoveis();
        } catch (error: unknown) {
            console.error("Erro ao editar imóvel:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao editar imóvel.");
        } finally {
            setIsLoading(false);
        }
    };



    const handleCancel = () => {
        if (!selectedImovelId) {
            showToast("Selecione um imóvel para cancelar.", "error");
            return;
        }

        setShowConfirmDialog(true);
    };

    const proceedWithCancellation = async () => {
        try {
            setIsLoading(true);
            resetMessages();

            await api.put(`/imoveis/${selectedImovelId}/cancelar`);
            showToast("Imóvel cancelado com sucesso!", "success");
            setSuccessMessage("Imóvel cancelado com sucesso!");
            await fetchImoveis();
        } catch (error: unknown) {
            console.error("Erro ao cancelar imóvel:", error);
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
                <h2>Editar Imóvel</h2>
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

                <label htmlFor="imovel-select" className="label-imovel">Selecione o imóvel:</label>
                <select
                    id="imovel-select"
                    className="imovel-select"
                    value={selectedImovelId || ""}
                    onChange={handleSelectChange}
                    disabled={isLoading}
                >
                    <option value="">Selecione...</option>
                    {imoveis.map((imovel) => (
                        <option key={imovel.idImovel} value={imovel.idImovel}>
                            {imovel.descricaoImovel} - {imovel.tipoImovel}
                        </option>
                    ))}
                </select>

                {selectedImovelId && (
                    <>
                        <label htmlFor="tipo" className="label-imovel">Tipo do Imóvel:</label>
                        <input
                            id="tipo"
                            type="text"
                            className="input-imovel"
                            value={tipoImovel}
                            onChange={(e) => setTipoImovel(e.target.value)}
                            disabled={isLoading}
                        />

                        <label htmlFor="descricao" className="label-imovel">Descrição:</label>
                        <input
                            id="descricao"
                            type="text"
                            className="input-imovel"
                            value={descricaoImovel}
                            onChange={(e) => setDescricaoImovel(e.target.value)}
                            disabled={isLoading}
                        />

                        <label htmlFor="status" className="label-imovel">Status:</label>
                        <select
                            id="status"
                            className="imovel-select"
                            value={statusImovel ? "Ativo" : "Inativo"}
                            onChange={(e) => setStatusImovel(e.target.value === "Ativo")}
                            disabled={isLoading}
                        >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>

                        <label htmlFor="tamanho" className="label-imovel">Tamanho:</label>
                        <input
                            id="tamanho"
                            type="number"
                            className="input-imovel"
                            value={tamanhoImovel}
                            onChange={(e) => setTamanhoImovel(parseInt(e.target.value))}
                            disabled={isLoading}
                        />

                        <label htmlFor="preco" className="label-imovel">Preço:</label>
                        <input
                            id="preco"
                            type="number"
                            className="input-imovel"
                            value={precoImovel}
                            onChange={(e) => setPrecoImovel(parseFloat(e.target.value))}
                            disabled={isLoading}
                        />

                        <label htmlFor="historico" className="label-imovel">Histórico Manutenção:</label>
                        <input
                            id="historico"
                            type="text"
                            className="input-imovel"
                            value={historicoManutencao}
                            onChange={(e) => setHistoricoManutencao(e.target.value)}
                            disabled={isLoading}
                        />

                        <label htmlFor="fotos" className="label-imovel">Fotos:</label>
                        <input
                            id="fotos"
                            type="text"
                            className="input-imovel"
                            value={imagem.join(", ")}
                            onChange={(e) => handleImageInputChange(e.target.value)}
                        />

                        <div className="form-grid">
                            <div>
                                <label htmlFor="rua" className="label-imovel">Rua:</label>
                                <input
                                    id="rua"
                                    type="text"
                                    className="input-imovel"
                                    value={endereco.rua}
                                    onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="numero" className="label-imovel">Número:</label>
                                <input
                                    id="numero"
                                    type="text"
                                    className="input-imovel"
                                    value={endereco.numero}
                                    onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="complemento" className="label-imovel">Complemento:</label>
                                <input
                                    id="complemento"
                                    type="text"
                                    className="input-imovel"
                                    value={endereco.complemento}
                                    onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="bairro" className="label-imovel">Bairro:</label>
                                <input
                                    id="bairro"
                                    type="text"
                                    className="input-imovel"
                                    value={endereco.bairro}
                                    onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="cidade" className="label-imovel">Cidade:</label>
                                <input
                                    id="cidade"
                                    type="text"
                                    className="input-imovel"
                                    value={endereco.cidade}
                                    onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="estado" className="label-imovel">Estado:</label>
                                <input
                                    id="estado"
                                    type="text"
                                    className="input-imovel"
                                    value={endereco.estado}
                                    onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="cep" className="label-imovel">CEP:</label>
                                <input
                                    id="cep"
                                    type="text"
                                    className="input-imovel"
                                    value={endereco.cep}
                                    onChange={(e) => setEndereco({...endereco, cep: e.target.value})}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button onClick={handleEdit} disabled={isLoading}>
                                {isLoading ? "Salvando..." : "Salvar"}
                            </button>
                            <button onClick={handleCancel} disabled={isLoading}>
                                {isLoading ? "Apagando..." : "Apagar Imóvel"}
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
                    <p>Tem certeza que deseja <strong>apagar</strong> este imóvel? Esta ação não pode ser desfeita.</p>
                    <div className="dialog-buttons">
                        <button onClick={() => setShowConfirmDialog(false)}>Não</button>
                        <button 
                            onClick={proceedWithCancellation}
                            className="danger-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processando..." : "Sim, apagar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditarImovelModal;
