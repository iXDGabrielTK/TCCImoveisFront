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
    const [imagem, setImagem] = useState('');
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
            console.log(response.data);
        } catch (error) {
            console.error("Erro ao buscar imóveis:", error);
            setErrorMessage("Erro ao buscar vistorias.");
        } finally {
        setIsLoading(false);
    }};

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
            const usuarioId = localStorage.getItem("usuario_Id");
            if (!usuarioId) {
                throw new Error("Usuário não autenticado. ID não encontrado.");
            }

            const response = await api.get(`/imoveis/${imovelId}`, {
                params: { usuarioId },
            });
            const imovel = response.data;

            console.log("ID do imóvel selecionado para edição:", selectedImovelId);
            console.log("Detalhes do imóvel:", imovel);

            // Ajuste os estados com base no retorno da API
            setTipoImovel(imovel.tipoImovel || "");
            setDescricaoImovel(imovel.descricaoImovel || "");
            setStatusImovel(imovel.statusImovel || false);
            setTamanhoImovel(imovel.tamanhoImovel || 0);
            setPrecoImovel(imovel.precoImovel || 0);

            setImagem(
                imovel.fotosImovel && imovel.fotosImovel.length > 0
                    ? imovel.fotosImovel.map((foto: any) => foto.urlFotoImovel).join(", ")
                    : ""
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
            setHistoricoManutencao(imovel.historicoManutencao || "");
        } catch (error) {
            console.error("Erro ao buscar detalhes do imóvel:", error);
            setErrorMessage("Erro ao carregar os detalhes do imóvel.");
        }
    };

    const handleEdit = async () => {
        if (!selectedImovelId || !tipoImovel || !descricaoImovel || !tamanhoImovel || !precoImovel) {
            setErrorMessage("Todos os campos devem ser preenchidos.");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            await axios.put(`/imoveis/${selectedImovelId}`, {
                tipoImovel,
                descricaoImovel,
                statusImovel,
                tamanhoImovel,
                precoImovel,
                imagem,
                endereco,
                historicoManutencao,
            });

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
                                <label htmlFor="imagem">Imagens:</label>
                                <input
                                    id="imagem"
                                    type="text"
                                    value={imagem}
                                    onChange={(e) => setImagem(e.target.value)}
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
                            </div>
                            <div className="endereco-imovel">
                                <h2>Endereço do Imóvel</h2>
                                <label htmlFor="rua">Rua:</label>
                                <input
                                    id="rua"
                                    type="text"
                                    value={endereco.rua}
                                    onChange={(e) => setEndereco({...endereco, rua: e.target.value})}
                                    disabled={isLoading}
                                />
                                <label htmlFor="numero">Número:</label>
                                <input
                                    id="numero"
                                    type="text"
                                    value={endereco.numero}
                                    onChange={(e) => setEndereco({...endereco, numero: e.target.value})}
                                />
                                <label htmlFor="complemento">Complemento:</label>
                                <input
                                    id="complemento"
                                    type="text"
                                    value={endereco.complemento}
                                    onChange={(e) => setEndereco({...endereco, complemento: e.target.value})}
                                />
                                <label htmlFor="bairro">Bairro:</label>
                                <input
                                    id="bairro"
                                    type="text"
                                    value={endereco.bairro}
                                    onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                                />
                                <label htmlFor="cidade">Cidade:</label>
                                <input
                                    id="cidade"
                                    type="text"
                                    value={endereco.cidade}
                                    onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}
                                />
                                <label htmlFor="estado">Estado:</label>
                                <input
                                    id="estado"
                                    type="text"
                                    value={endereco.estado}
                                    onChange={(e) => setEndereco({...endereco, estado: e.target.value})}
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
