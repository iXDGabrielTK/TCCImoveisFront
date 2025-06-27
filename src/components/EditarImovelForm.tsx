import React, { useEffect, useState, useCallback, FormEvent } from "react";
import "../styles/EditarImovel.css";
import "../styles/shared.css";
import "../styles/CadastroImovel.css";
import api from "../services/api.ts";
import { ApiError, getErrorMessage } from "../utils/errorHandling";
import { useToast } from "../context/ToastContext";
import axios from "axios";
import InputMask from 'react-input-mask-next';

interface Imovel {
    idImovel: number;
    tipoImovel: string;
    descricaoImovel: string;
    statusImovel: boolean;
    tamanhoImovel: number;
    precoImovel: number;
    fotosImovel?: FotoImovelExistente[]; // <--- ATUALIZADO: Agora espera um array de FotoImovelExistente
    enderecoImovel: {
        idEncereco?: number;
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

interface FotoImovelExistente {
    id: number;
    urlFotoImovel: string;
    isDeleted?: boolean;
}

const EditarImovelForm: React.FC = () => {
    const { showToast } = useToast();

    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [selectedImovelId, setSelectedImovelId] = useState<string | null>(null);

    const [tipoImovel, setTipoImovel] = useState<string>("");
    const [descricaoImovel, setDescricaoImovel] = useState<string>("");
    const [statusImovel, setStatusImovel] = useState<boolean>(true);
    const [tamanhoImovel, setTamanhoImovel] = useState<number>(0);
    const [precoImovel, setPrecoImovel] = useState<number>(0);
    const [fotosImovel, setFotosImovel] = useState<File[]>([]);
    const [fotosImovelExistentes, setFotosImovelExistentes] = useState<FotoImovelExistente[]>([]);
    const [endereco, setEndereco] = useState({
        idEndereco: undefined,
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

    const [fieldErrors, setFieldErrors] = useState({
        selectedImovelId: '',
        tipoImovel: '',
        descricaoImovel: '',
        tamanhoImovel: '',
        precoImovel: '',
        fotosImovel: '', // Este erro será desconsiderado pela remoção da validação
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
    });

    const resetMessages = useCallback(() => {
        setErrorMessage("");
        setSuccessMessage("");
    }, []);

    const fetchImoveis = useCallback(async () => {
        setIsLoading(true);
        resetMessages();
        try {
            const role = localStorage.getItem('roles');
            const endpoint = role && role.includes('FUNCIONARIO') ? '/imoveis' : '/imoveis/por-corretor';
            const response = await api.get(endpoint, {
                params: { page: 0, size: 1000, sort: 'idImovel,asc' }
            });
            setImoveis(response.data?.content ?? response.data ?? []);
        } catch (error: unknown) {
            console.error("Erro ao buscar imóveis:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao buscar imóveis.");
            showToast("Erro ao buscar imóveis.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [resetMessages, showToast]);

    useEffect(() => {
        void fetchImoveis();
    }, [fetchImoveis]);

    const handleSelectChange = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const imovelId = event.target.value;
        setSelectedImovelId(imovelId);
        resetMessages();

        if (!imovelId) {
            setTipoImovel("");
            setDescricaoImovel("");
            setStatusImovel(true);
            setTamanhoImovel(0);
            setPrecoImovel(0);
            setHistoricoManutencao("");
            setFotosImovel([]);
            setFotosImovelExistentes([]);
            setEndereco({ // Limpar o endereço para valores vazios, incluindo idEndereco
                idEndereco: undefined, // <-- Limpa o ID também
                rua: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                estado: '',
                cep: '',
            });
            setFieldErrors(prev => ({ ...prev, selectedImovelId: 'Selecione um imóvel.' }));
            return;
        }

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
            setFotosImovel([]); // Limpar novas fotos na seleção
            setFotosImovelExistentes(
                // O ImovelDTO do backend agora retornará List<FotoImovelDTO>
                Array.isArray(imovel.fotosImovel)
                    ? imovel.fotosImovel.map((foto: { id: number, urlFotoImovel: string }) => ({ // 'foto' já é o objeto com id e url
                        id: foto.id, // Acessa o ID diretamente
                        urlFotoImovel: foto.urlFotoImovel,
                        isDeleted: false
                    }))
                    : []
            );
            setEndereco({ // Popula o endereço com dados do imóvel carregado, incluindo idEndereco
                idEndereco: imovel.enderecoImovel?.idEndereco, // <-- POPULA O ID DO ENDEREÇO
                rua: imovel.enderecoImovel?.rua || '',
                numero: imovel.enderecoImovel?.numero || '',
                complemento: imovel.enderecoImovel?.complemento || '',
                bairro: imovel.enderecoImovel?.bairro || '',
                cidade: imovel.enderecoImovel?.cidade || '',
                estado: imovel.enderecoImovel?.estado || '',
                cep: imovel.enderecoImovel?.cep || '',
            });
            setFieldErrors(prev => ({ ...prev, selectedImovelId: '' }));

        } catch (error: unknown) {
            console.error("Erro ao buscar detalhes do imóvel:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao carregar os detalhes do imóvel.");
            showToast("Erro ao carregar os detalhes do imóvel.", "error");
            setFieldErrors(prev => ({ ...prev, selectedImovelId: 'Erro ao carregar imóvel.' }));
        } finally {
            setIsLoading(false);
        }
    }, [resetMessages, showToast]);

    const handleEnderecoChange = useCallback((field: keyof typeof endereco, value: string | number | undefined) => {
        setEndereco((prevEndereco) => ({
            ...prevEndereco,
            [field]: value,
        }));
    }, []);

    const handleNewImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const novasFotosSelecionadas = Array.from(event.target.files);

            setFotosImovel(prevFotos => [...prevFotos, ...novasFotosSelecionadas]); // <-- LINHA ALTERADA
        }
    }, []);

    const removeExistingPhoto = useCallback((index: number) => {
        setFotosImovelExistentes(prev => {
            const newPhotos = [...prev];
            if (newPhotos[index]) {
                // Remova esta chamada API.DELETE daqui!
                // api.delete(`/fotosImovel/${photoToRemove.id}`)
                //     .then(...)
                //     .catch(...)

                // Em vez disso, apenas filtre a foto do estado local imediatamente
                const filteredPhotos = prev.filter((_, i) => i !== index);
                showToast("Foto removida localmente. Salve para aplicar as alterações.", "info");
                return filteredPhotos; // Retorne o novo array sem a foto
            }
            return newPhotos;
        });
    }, [showToast]);


    const removeNewPhoto = useCallback((index: number) => {
        setFotosImovel(prev => {
            const newPhotos = [...prev];
            newPhotos.splice(index, 1);
            return newPhotos;
        });
    }, []);

    const validateForm = useCallback(() => {
        let valid = true;
        const errors = { ...fieldErrors };

        if (!selectedImovelId) {
            errors.selectedImovelId = 'Selecione um imóvel.';
            valid = false;
        } else errors.selectedImovelId = '';

        if (!tipoImovel.trim()) {
            errors.tipoImovel = 'Tipo do imóvel é obrigatório.';
            valid = false;
        } else errors.tipoImovel = '';

        if (!descricaoImovel.trim()) {
            errors.descricaoImovel = 'Descrição é obrigatória.';
            valid = false;
        } else errors.descricaoImovel = '';

        if (tamanhoImovel <= 0) {
            errors.tamanhoImovel = 'Tamanho deve ser maior que zero.';
            valid = false;
        } else errors.tamanhoImovel = '';

        if (precoImovel <= 0) {
            errors.precoImovel = 'Preço deve ser maior que zero.';
            valid = false;
        } else errors.precoImovel = '';

        if (!endereco.rua.trim()) {
            errors.rua = 'Rua é obrigatória.';
            valid = false;
        } else errors.rua = '';

        if (!endereco.numero.trim()) {
            errors.numero = 'Número é obrigatório.';
            valid = false;
        } else errors.numero = '';

        if (!endereco.bairro.trim()) {
            errors.bairro = 'Bairro é obrigatório.';
            valid = false;
        } else errors.bairro = '';

        if (!endereco.cidade.trim()) {
            errors.cidade = 'Cidade é obrigatória.';
            valid = false;
        } else errors.cidade = '';

        if (!endereco.estado.trim()) {
            errors.estado = 'Estado é obrigatório.';
            valid = false;
        } else errors.estado = '';

        if (!endereco.cep.trim()) {
            errors.cep = 'CEP é obrigatório.';
            valid = false;
        } else errors.cep = '';

        setFieldErrors(errors);
        return valid;
    }, [selectedImovelId, tipoImovel, descricaoImovel, tamanhoImovel, precoImovel, endereco, fieldErrors]);


    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedImovelId) { // Se for null ou vazio, o formulário não deve tentar submeter
            setErrorMessage("Selecione um imóvel para editar.");
            showToast("Selecione um imóvel para editar.", "error");
            return;
        }
        if (!validateForm()) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Autenticação inválida. Refaça o login.', 'error');
            return;
        }

        try {
            setIsLoading(true);
            resetMessages();

            const fotosAtuais = fotosImovelExistentes.filter(f => !f.isDeleted); // Certifique-se que isDeleted não é usado aqui, se você removeu imediatamente

            const imovelData = {
                tipoImovel,
                descricaoImovel,
                statusImovel,
                tamanhoImovel,
                precoImovel,
                historicoManutencao,
                // Certifique-se de que o idEndereco é enviado se existir
                enderecoImovel: {
                    idEndereco: endereco.idEndereco, // <-- Incluindo idEndereco
                    rua: endereco.rua,
                    numero: endereco.numero,
                    complemento: endereco.complemento,
                    bairro: endereco.bairro,
                    cidade: endereco.cidade,
                    estado: endereco.estado,
                    cep: endereco.cep,
                },
                fotosImovel: fotosAtuais, // Enviar fotos existentes atuais
                // idsCorretores: [],
                // idsImobiliarias: [],
            };

            const formData = new FormData();
            formData.append('dados', new Blob([JSON.stringify(imovelData)], { type: 'application/json' }));

            // Adicionar novas fotos
            fotosImovel.forEach((file) => {
                formData.append('fotos', file, file.name);
            });

            // 3. Enviar requisição de atualização
            await api.put(`/imoveis/${selectedImovelId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', // Importante para FormData
                }
            });

            setSuccessMessage("Imóvel atualizado com sucesso!");
            showToast("Imóvel atualizado com sucesso!", "success");
            await fetchImoveis(); // Buscar novamente para atualizar a lista e o estado
            setSelectedImovelId(null); // Limpar seleção
            setTipoImovel("");
            setDescricaoImovel("");
            setStatusImovel(true);
            setTamanhoImovel(0);
            setPrecoImovel(0);
            setHistoricoManutencao("");
            setFotosImovel([]);
            setFotosImovelExistentes([]);
            setEndereco({ idEndereco: undefined, rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }); // <-- Resetar idEndereco

        } catch (error: unknown) {
            console.error("Erro ao editar imóvel:", error);
            const apiError = error as ApiError;
            setErrorMessage(apiError?.response?.data?.message || "Erro ao editar imóvel.");
            showToast(getErrorMessage(apiError), "error");
        } finally {
            setIsLoading(false);
        }
    };


    const handleCancelImovel = () => {
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
            setSelectedImovelId(null);
            setTipoImovel("");
            setDescricaoImovel("");
            setStatusImovel(true);
            setTamanhoImovel(0);
            setPrecoImovel(0);
            setHistoricoManutencao("");
            setFotosImovel([]);
            setFotosImovelExistentes([]);
            setEndereco({ idEndereco: undefined, rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }); // <-- Resetar idEndereco
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

    // Função buscarCep igual ao CadastroImovelForm
    const buscarCep = async () => {
        const cep = endereco.cep.replace(/\D/g, '');
        if (!cep || cep.length !== 8) {
            setFieldErrors((prev) => ({ ...prev, cep: 'CEP inválido' }));
            return showToast('Digite um CEP válido com 8 dígitos.', 'error');
        }
        try {
            setIsLoading(true);
            const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (!data.erro) {
                setEndereco((prev) => ({ ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }));
                setFieldErrors((prev) => ({ ...prev, rua: '', bairro: '', cidade: '', estado: '' }));
                showToast('Endereço encontrado com sucesso!', 'success');
            } else {
                showToast('CEP não encontrado.', 'error');
                setFieldErrors((prev) => ({ ...prev, cep: 'CEP não encontrado' }));
            }
        } catch (e) {
            console.error(e);
            showToast('Erro ao buscar o CEP.', 'error');
            setFieldErrors((prev) => ({ ...prev, cep: 'Erro ao buscar o CEP' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}
            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}
            <div className="cadastro-imovel-page">
                <h1>Editar Imóvel</h1>
                <form className="form-carousel" onSubmit={handleEditSubmit}>
                    <fieldset>
                        <legend>Selecionar Imóvel para Edição</legend>
                        <div className="form-group full-width">
                            <label htmlFor="imovel-select">* Selecione o imóvel:</label>
                            <select
                                id="imovel-select"
                                className={fieldErrors.selectedImovelId ? 'input-error' : ''}
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
                            {fieldErrors.selectedImovelId && <span className="field-error-message">{fieldErrors.selectedImovelId}</span>}
                        </div>
                    </fieldset>

                    {selectedImovelId && (
                        <>
                            <fieldset>
                                <legend>Dados do Imóvel</legend>
                                <div className="grid">
                                    <div className="form-group">
                                        <label htmlFor="tipo">* Tipo do Imóvel:</label>
                                        <input
                                            id="tipo"
                                            type="text"
                                            value={tipoImovel}
                                            onChange={(e) => setTipoImovel(e.target.value)}
                                            className={fieldErrors.tipoImovel ? 'input-error' : ''}
                                            disabled={isLoading}
                                        />
                                        {fieldErrors.tipoImovel && <span className="field-error-message">{fieldErrors.tipoImovel}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="tamanho">* Tamanho (m²):</label>
                                        <input
                                            id="tamanho"
                                            type="number"
                                            value={tamanhoImovel}
                                            onChange={(e) => setTamanhoImovel(parseFloat(e.target.value))}
                                            className={fieldErrors.tamanhoImovel ? 'input-error' : ''}
                                            disabled={isLoading}
                                        />
                                        {fieldErrors.tamanhoImovel && <span className="field-error-message">{fieldErrors.tamanhoImovel}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="preco">* Preço:</label>
                                        <input
                                            id="preco"
                                            type="number"
                                            value={precoImovel}
                                            onChange={(e) => setPrecoImovel(parseFloat(e.target.value))}
                                            className={fieldErrors.precoImovel ? 'input-error' : ''}
                                            disabled={isLoading}
                                        />
                                        {fieldErrors.precoImovel && <span className="field-error-message">{fieldErrors.precoImovel}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">* Status:</label>
                                        <select
                                            id="status"
                                            value={statusImovel ? "Ativo" : "Inativo"}
                                            onChange={(e) => setStatusImovel(e.target.value === "Ativo")}
                                            disabled={isLoading}
                                        >
                                            <option value="Ativo">Ativo</option>
                                            <option value="Inativo">Inativo</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="descricao">* Descrição:</label>
                                    <textarea
                                        id="descricao"
                                        rows={4}
                                        value={descricaoImovel}
                                        onChange={(e) => setDescricaoImovel(e.target.value)}
                                        placeholder="Descreva o imóvel com detalhes..."
                                        className={fieldErrors.descricaoImovel ? 'input-error' : ''}
                                        disabled={isLoading}
                                    ></textarea>
                                    {fieldErrors.descricaoImovel && <span className="field-error-message">{fieldErrors.descricaoImovel}</span>}
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="historico">Histórico Manutenção:</label>
                                    <textarea
                                        id="historico"
                                        rows={3}
                                        value={historicoManutencao}
                                        onChange={(e) => setHistoricoManutencao(e.target.value)}
                                        placeholder="Histórico de manutenções..."
                                        disabled={isLoading}
                                    ></textarea>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Endereço</legend>
                                <div className="grid">
                                    <div className="form-group">
                                        <label htmlFor="rua">* Rua:</label>
                                        <input
                                            id="rua"
                                            type="text"
                                            value={endereco.rua}
                                            onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                                            className={fieldErrors.rua ? 'input-error' : ''}
                                            disabled={isLoading}
                                        />
                                        {fieldErrors.rua && <span className="field-error-message">{fieldErrors.rua}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="numero">* Número:</label>
                                        <input
                                            id="numero"
                                            type="text"
                                            value={endereco.numero}
                                            onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                                            className={fieldErrors.numero ? 'input-error' : ''}
                                            disabled={isLoading}
                                        />
                                        {fieldErrors.numero && <span className="field-error-message">{fieldErrors.numero}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="complemento">Complemento:</label>
                                        <input
                                            id="complemento"
                                            type="text"
                                            value={endereco.complemento}
                                            onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="bairro">* Bairro:</label>
                                        <input
                                            id="bairro"
                                            type="text"
                                            value={endereco.bairro}
                                            onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                                            className={fieldErrors.bairro ? 'input-error' : ''}
                                            disabled={isLoading}
                                        />
                                        {fieldErrors.bairro && <span className="field-error-message">{fieldErrors.bairro}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cidade">* Cidade:</label>
                                        <input
                                            id="cidade"
                                            type="text"
                                            value={endereco.cidade}
                                            onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                                            className={fieldErrors.cidade ? 'input-error' : ''}
                                            disabled={isLoading}
                                        />
                                        {fieldErrors.cidade && <span className="field-error-message">{fieldErrors.cidade}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="estado">* Estado:</label>
                                        <input
                                            id="estado"
                                            type="text"
                                            value={endereco.estado}
                                            onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                                            className={fieldErrors.estado ? 'input-error' : ''}
                                            disabled={isLoading}
                                        />
                                        {fieldErrors.estado && <span className="field-error-message">{fieldErrors.estado}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cep">* CEP:</label>
                                        <InputMask
                                            mask="99999-999"
                                            value={endereco.cep}
                                            onChange={e => handleEnderecoChange('cep', e.target.value)}
                                            onBlur={buscarCep}
                                            disabled={isLoading}
                                            id="cep"
                                            className={fieldErrors.cep ? 'input-error' : ''}
                                            required
                                        />
                                        <a
                                            href="https://buscacepinter.correios.com.br/app/endereco/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cep-link"
                                        >
                                            não sei o meu CEP
                                        </a>
                                        {fieldErrors.cep && <span className="field-error-message">{fieldErrors.cep}</span>}
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Fotos do Imóvel</legend>
                                {fotosImovelExistentes.filter(f => !f.isDeleted).length > 0 && (
                                    <>
                                        <label style={{marginTop: '15px'}}>Fotos Existentes:</label>
                                        <div className="thumbnail-grid">
                                            {fotosImovelExistentes.filter(f => !f.isDeleted).map((foto, i) => (
                                                <div key={foto.id}
                                                     className="thumbnail-container"> {/* <--- Adicionado key={foto.id} */}
                                                    <img
                                                        src={foto.urlFotoImovel}
                                                        alt={`Foto existente ${i + 1}`}
                                                        className="thumbnail"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-thumbnail-btn"
                                                        onClick={() => removeExistingPhoto(i)}
                                                        disabled={isLoading}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <div className="form-group-file"
                                     style={{marginTop: fotosImovelExistentes.filter(f => !f.isDeleted).length > 0 ? '15px' : '0'}}>
                                    <label className="file-input-label" htmlFor="file-upload-imovel">
                                        Escolher Novas Fotos
                                    </label>
                                    <input
                                        id="file-upload-imovel"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleNewImageChange}
                                        className="hidden-file-input"
                                        disabled={isLoading}
                                    />
                                    <span className="file-name-display">
                                        {fotosImovel.length > 0 ?
                                            `${fotosImovel.length} nova(s) foto(s) selecionada(s)` :
                                            'Nenhuma nova foto escolhida'
                                        }
                                    </span>
                                </div>
                                {fieldErrors.fotosImovel &&
                                    <span className="field-error-message">{fieldErrors.fotosImovel}</span>}

                                {fotosImovel.length > 0 && (
                                    <div className="thumbnail-grid">
                                        {fotosImovel.map((foto, i) => (
                                            <div key={i} className="thumbnail-container"> {/* <--- Adicionado key={i} */}
                                                <img
                                                    src={URL.createObjectURL(foto)}
                                                    alt={`Nova foto ${i + 1}`}
                                                    className="thumbnail"
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-thumbnail-btn"
                                                    onClick={() => removeNewPhoto(i)}
                                                    disabled={isLoading}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </fieldset>

                            <div className="navigation-buttons">
                                <button type="submit" className="btn-step btn-next-step" disabled={isLoading}>
                                    {isLoading ? 'Salvando Edição...' : 'Salvar Edição do Imóvel'}
                                </button>
                                <button type="button" className="btn-step btn-remove-ambiente" onClick={handleCancelImovel}
                                        disabled={isLoading}>
                                    {isLoading ? "Apagando..." : "Apagar Imóvel"}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                {showConfirmDialog && (
                    <div className="confirm-dialog">
                        <p>Tem certeza que deseja <strong>apagar</strong> este imóvel? Esta ação não pode ser desfeita.</p>
                        <div className="dialog-buttons">
                            <button onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>Não</button>
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
        </>
    );
};

export default EditarImovelForm;

