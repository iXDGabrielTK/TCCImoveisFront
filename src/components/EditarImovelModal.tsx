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
                    ? imovel.fotosImovel.map((foto: any) => foto.urlFotoImovel || "") // Extrai apenas as URLs
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
            ...prevEndereco, // Mantém os outros campos do endereço
            [field]: value, // Atualiza apenas o campo alterado
        }));
    };

    const handleImageInputChange = (value: string) => {
        setImagem(value.split(",").map((url) => url.trim())); // Divide a string e remove espaços extras
    };


    const handleEdit = async () => {
        if (!selectedImovelId) {
            setErrorMessage("Imóvel não selecionado.");
            return;
        }

        // Transforma fotos em um array de strings (URLs)
        const fotosImovelArray = Array.isArray(imagem)
            ? imagem.map((foto: any) => foto.urlFotoImovel)
            : [imagem];

        const data = {
            tipoImovel,
            descricaoImovel,
            statusImovel,
            tamanhoImovel,
            precoImovel,
            fotosImovel: fotosImovelArray, // Garantir que é um array de strings
            enderecoImovel: endereco, // Certifique-se de que este objeto está completo
            historicoManutencao,
        };

        console.log("Payload enviado ao backend:", data);

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
                                <label htmlFor="tipo">Tipo do Imóvel:</label>
                                <input
                                    id="tipo"
                                    type="text"
                                    value={tipoImovel}
                                    onChange={(e) => setTipoImovel(e.target.value)}
                                    disabled={isLoading}
                                />

                                <label htmlFor="descricao">Descrição:</label>
                                <input
                                    id="descricao"
                                    type="text"
                                    value={descricaoImovel}
                                    onChange={(e) => setDescricaoImovel(e.target.value)}
                                    disabled={isLoading}
                                />

                                <label htmlFor="status">Status:</label>
                                <select
                                    id="status"
                                    value={statusImovel ? "Ativo" : "Inativo"}
                                    onChange={(e) => setStatusImovel(e.target.value === "Ativo")}
                                    disabled={isLoading}
                                >
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>

                                <label htmlFor="tamanho">Tamanho:</label>
                                <input
                                    id="tamanho"
                                    type="number"
                                    value={tamanhoImovel}
                                    onChange={(e) => setTamanhoImovel(parseInt(e.target.value))}
                                    disabled={isLoading}
                                />
                                <label htmlFor="preco">Preço:</label>
                                <input
                                    id="preco"
                                    type="number"
                                    value={precoImovel}
                                    onChange={(e) => setPrecoImovel(parseFloat(e.target.value))}
                                    disabled={isLoading}
                                />
                                <label htmlFor="historico">Histórico Manutenção:</label>
                                <input
                                    id="historico"
                                    type="text"
                                    value={historicoManutencao}
                                    onChange={(e) => setHistoricoManutencao(e.target.value)}
                                    disabled={isLoading}
                                />
                                <label htmlFor="fotos">Fotos:</label>
                                <input
                                    type="text"
                                    value={imagem.join(", ")} // Converte o array de strings para uma única string separada por vírgulas
                                    onChange={(e) => handleImageInputChange(e.target.value)} // Atualiza o estado
                                    style={{width: "100%"}}
                                />
                            </div>
                            <div className="endereco-imovel">
                                <h2>Endereço do Imóvel</h2>
                                <label htmlFor="rua">Rua:</label>
                                <input
                                    id="rua"
                                    type="text"
                                    value={endereco.rua}
                                    onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                                    disabled={isLoading}
                                />
                                <label htmlFor="numero">Número:</label>
                                <input
                                    id="numero"
                                    type="text"
                                    value={endereco.numero}
                                    onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                                    disabled={isLoading}
                                />
                                <label htmlFor="complemento">Complemento:</label>
                                <input
                                    id="complemento"
                                    type="text"
                                    value={endereco.complemento}
                                    onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                                />
                                <label htmlFor="bairro">Bairro:</label>
                                <input
                                    id="bairro"
                                    type="text"
                                    value={endereco.bairro}
                                    onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                                />
                                <label htmlFor="cidade">Cidade:</label>
                                <input
                                    id="cidade"
                                    type="text"
                                    value={endereco.cidade}
                                    onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                                />
                                <label htmlFor="estado">Estado:</label>
                                <input
                                    id="estado"
                                    type="text"
                                    value={endereco.estado}
                                    onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                                />
                                <label htmlFor="cep">CEP:</label>
                                <input
                                    id="cep"
                                    type="text"
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
