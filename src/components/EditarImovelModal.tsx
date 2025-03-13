import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/EditarImovel.css";
import api from "../services/api.ts";

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

    useEffect(() => {
        if (isOpen) {
            fetchImoveis();
        }
    }, [isOpen]);

    const fetchImoveis = async () => {
        try {
            const response = await api.get('/imoveis');
            setImoveis(response.data);
        } catch (error) {
            console.error("Erro ao buscar imóveis:", error);
            setErrorMessage("Erro ao buscar imóveis.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const imovelId = event.target.value;

        if (!imovelId) {
            setErrorMessage("Erro: ID do imóvel inválido.");
            return;
        }

        setSelectedImovelId(imovelId);
        setErrorMessage("");
        setSuccessMessage("");

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
        } catch (error) {
            console.error("Erro ao buscar detalhes do imóvel:", error);
            setErrorMessage("Erro ao carregar os detalhes do imóvel.");
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

        // Remove URLs inválidas
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
            setErrorMessage("");
            setSuccessMessage("");

            await api.put(`/imoveis/${selectedImovelId}`, data);

            setSuccessMessage("Imóvel atualizado com sucesso!");
            fetchImoveis();
        } catch (error) {
            console.error("Erro ao editar imóvel:", error);
            setErrorMessage("Erro ao editar imóvel.");
        } finally {
            setIsLoading(false);
        }
    };



    const handleCancel = async () => {
        if (!selectedImovelId) {
            setErrorMessage("Selecione um imóvel para cancelar.");
            return;
        }

        if (!window.confirm("Tem certeza que deseja cancelar este imóvel?")) return;

        try {
            setIsLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            await axios.put(`/imoveis/${selectedImovelId}/cancelar`);
            setSuccessMessage("Imóvel cancelado com sucesso!");
            await fetchImoveis();
        } catch (error) {
            console.error("Erro ao cancelar imóvel:", error);
            setErrorMessage("Erro ao cancelar imóvel.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Editar Imóvel</h2>
                {errorMessage && <p className="error">{errorMessage}</p>}
                {successMessage && <p className="success">{successMessage}</p>}

                <label htmlFor="imovel-select">Selecione o imóvel:</label>
                <select
                    id="imovel-select"
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
                        <div className="form-container">
                            <div className="dados-imovel">
                                <h2>Dados do Imóvel</h2>
                                <label htmlFor="tipo" className={"label-imovel"}>Tipo do Imóvel:</label>
                                <input
                                    id="tipo"
                                    type="text"
                                    className="input"
                                    value={tipoImovel}
                                    onChange={(e) => setTipoImovel(e.target.value)}
                                    disabled={isLoading}
                                />

                                <label htmlFor="descricao" className={"label-imovel"}>Descrição:</label>
                                <input
                                    id="descricao"
                                    type="text"
                                    className="input"
                                    value={descricaoImovel}
                                    onChange={(e) => setDescricaoImovel(e.target.value)}
                                    disabled={isLoading}
                                />

                                <label htmlFor="status" className={"label-imovel"}>Status:</label>
                                <select
                                    id="status"
                                    className="select"
                                    value={statusImovel ? "Ativo" : "Inativo"}
                                    onChange={(e) => setStatusImovel(e.target.value === "Ativo")}
                                    disabled={isLoading}
                                >
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>

                                <label htmlFor="tamanho" className={"label-imovel"}>Tamanho:</label>
                                <input
                                    id="tamanho"
                                    type="number"
                                    className="input"
                                    value={tamanhoImovel}
                                    onChange={(e) => setTamanhoImovel(parseInt(e.target.value))}
                                    disabled={isLoading}
                                />
                                <label htmlFor="preco" className={"label-imovel"}>Preço:</label>
                                <input
                                    id="preco"
                                    type="number"
                                    className="input"
                                    value={precoImovel}
                                    onChange={(e) => setPrecoImovel(parseFloat(e.target.value))}
                                    disabled={isLoading}
                                />
                                <label htmlFor="historico" className={"label-imovel"}>Histórico Manutenção:</label>
                                <input
                                    id="historico"
                                    type="text"
                                    className="input"
                                    value={historicoManutencao}
                                    onChange={(e) => setHistoricoManutencao(e.target.value)}
                                    disabled={isLoading}
                                />
                                <label htmlFor="fotos" className={"label-imovel"}>Fotos:</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={imagem.join(", ")}
                                    onChange={(e) => handleImageInputChange(e.target.value)}
                                    style={{width: "100%"}}
                                />
                            </div>
                            <div className="endereco-imovel">
                                <h2>Endereço do Imóvel</h2>
                                <label htmlFor="rua" className={"label-imovel"}>Rua:</label>
                                <input
                                    id="rua"
                                    type="text"
                                    className="input"
                                    value={endereco.rua}
                                    onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                                    disabled={isLoading}
                                />
                                <label htmlFor="numero" className={"label-imovel"}>Número:</label>
                                <input
                                    id="numero"
                                    type="text"
                                    className="input"
                                    value={endereco.numero}
                                    onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                                    disabled={isLoading}
                                />
                                <label htmlFor="complemento" className={"label-imovel"}>Complemento:</label>
                                <input
                                    id="complemento"
                                    type="text"
                                    className="input"
                                    value={endereco.complemento}
                                    onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                                />
                                <label htmlFor="bairro" className={"label-imovel"}>Bairro:</label>
                                <input
                                    id="bairro"
                                    type="text"
                                    className="input"
                                    value={endereco.bairro}
                                    onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                                />
                                <label htmlFor="cidade" className={"label-imovel"}>Cidade:</label>
                                <input
                                    id="cidade"
                                    type="text"
                                    className="input"
                                    value={endereco.cidade}
                                    onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                                />
                                <label htmlFor="estado" className={"label-imovel"}>Estado:</label>
                                <input
                                    id="estado"
                                    type="text"
                                    className="input"
                                    value={endereco.estado}
                                    onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                                />
                                <label htmlFor="cep" className={"label-imovel"}>CEP:</label>
                                <input
                                    id="cep"
                                    type="text"
                                    className="input"
                                    value={endereco.cep}
                                    onChange={(e) => setEndereco({...endereco, cep: e.target.value})}
                                />
                            </div>
                        </div>
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

export default EditarImovelModal;
