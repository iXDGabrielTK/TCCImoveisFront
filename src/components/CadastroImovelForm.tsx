import React, { FormEvent, useState, useCallback } from 'react';
import axios from 'axios'; // Para fazer a requisição à API
import api from '../services/api';
import '../styles/CadastroImovel.css';
import '../styles/shared.css';
import { ApiError, getErrorMessage, isValidUrl, isValidCep } from '../utils/errorHandling';
import { useToast } from '../context/ToastContext';

interface CadastroImovelFormProps {
    onClose: () => void;
}

const CadastroImovelForm: React.FC<CadastroImovelFormProps> = ({ onClose }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [tipo, setTipo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(true);
    const [tamanho, setTamanho] = useState('');
    const [preco, setPreco] = useState('');
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
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        tipo: '',
        descricao: '',
        tamanho: '',
        preco: '',
        imagem: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
    });

    const resetMessages = useCallback(() => {
        setErrorMessage("");
        setSuccessMessage("");
    }, [setErrorMessage, setSuccessMessage]);

    const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEndereco((prevEndereco) => ({
            ...prevEndereco,
            [name]: value,
        }));

        // Validate CEP in real-time
        if (name === 'cep') {
            if (!value.trim()) {
                setFieldErrors(prev => ({ ...prev, cep: 'CEP é obrigatório' }));
            } else if (!isValidCep(value)) {
                setFieldErrors(prev => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }));
            } else {
                setFieldErrors(prev => ({ ...prev, cep: '' }));
            }
        }

        // Validate other address fields
        if (['rua', 'numero', 'bairro', 'cidade', 'estado'].includes(name)) {
            if (!value.trim() && name !== 'complemento') { // complemento is optional
                setFieldErrors(prev => ({ ...prev, [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} é obrigatório` }));
            } else {
                setFieldErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
    };

    // Validation functions for other fields
    const validateTipo = (value: string) => {
        if (!value.trim()) {
            setFieldErrors(prev => ({ ...prev, tipo: 'Tipo é obrigatório' }));
            return false;
        } else {
            setFieldErrors(prev => ({ ...prev, tipo: '' }));
            return true;
        }
    };

    const validateDescricao = (value: string) => {
        if (!value.trim()) {
            setFieldErrors(prev => ({ ...prev, descricao: 'Descrição é obrigatória' }));
            return false;
        } else if (value.trim().length < 10) {
            setFieldErrors(prev => ({ ...prev, descricao: 'Descrição deve ter pelo menos 10 caracteres' }));
            return false;
        } else {
            setFieldErrors(prev => ({ ...prev, descricao: '' }));
            return true;
        }
    };

    const validateTamanho = (value: string) => {
        const tamanhoNum = parseFloat(value);
        if (!value.trim()) {
            setFieldErrors(prev => ({ ...prev, tamanho: 'Tamanho é obrigatório' }));
            return false;
        } else if (isNaN(tamanhoNum) || tamanhoNum <= 0) {
            setFieldErrors(prev => ({ ...prev, tamanho: 'Tamanho deve ser um número positivo' }));
            return false;
        } else {
            setFieldErrors(prev => ({ ...prev, tamanho: '' }));
            return true;
        }
    };

    const validatePreco = (value: string) => {
        const precoNum = parseFloat(value);
        if (!value.trim()) {
            setFieldErrors(prev => ({ ...prev, preco: 'Preço é obrigatório' }));
            return false;
        } else if (isNaN(precoNum) || precoNum <= 0) {
            setFieldErrors(prev => ({ ...prev, preco: 'Preço deve ser um número positivo' }));
            return false;
        } else {
            setFieldErrors(prev => ({ ...prev, preco: '' }));
            return true;
        }
    };

    const validateImagem = (value: string) => {
        if (!value.trim()) {
            setFieldErrors(prev => ({ ...prev, imagem: 'URL da imagem é obrigatória' }));
            return false;
        }

        const urls = value.split(',').map(url => url.trim()).filter(url => url);
        const validUrls = urls.filter(url => isValidUrl(url));

        if (validUrls.length === 0) {
            setFieldErrors(prev => ({ ...prev, imagem: 'Adicione pelo menos uma URL válida' }));
            return false;
        } else if (validUrls.length !== urls.length) {
            setFieldErrors(prev => ({ ...prev, imagem: 'Algumas URLs são inválidas' }));
            return false;
        } else {
            setFieldErrors(prev => ({ ...prev, imagem: '' }));
            return true;
        }
    };

    // Função para buscar o endereço na API ViaCEP
    const buscarCep = async () => {
        resetMessages();
        const cep = endereco.cep.replace(/\D/g, ''); // Remove caracteres não numéricos

        if (!isValidCep(cep)) {
            showToast('Digite um CEP válido com 8 dígitos.', 'error');
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.data.erro) {
                // Atualiza o estado do endereço com os dados retornados
                setEndereco((prevEndereco) => ({
                    ...prevEndereco,
                    rua: response.data.logradouro,
                    bairro: response.data.bairro,
                    cidade: response.data.localidade,
                    estado: response.data.uf,
                }));

                // Clear any field errors for the populated fields
                setFieldErrors(prev => ({
                    ...prev,
                    rua: '',
                    bairro: '',
                    cidade: '',
                    estado: ''
                }));

                showToast('Endereço encontrado com sucesso!', 'success');
            } else {
                showToast('CEP não encontrado. Verifique e tente novamente.', 'error');
            }
        } catch (error: unknown) {
            console.error('Erro ao buscar o CEP:', error);
            const apiError = error as ApiError;
            showToast(getErrorMessage(apiError), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const validateAllFields = () => {
        const isValidTipo = validateTipo(tipo);
        const isValidDescricao = validateDescricao(descricao);
        const isValidTamanho = validateTamanho(tamanho);
        const isValidPreco = validatePreco(preco);
        const isValidImagem = validateImagem(imagem);

        // Validate address fields
        let isValidAddress = true;
        const addressFields = ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'] as const;

        addressFields.forEach(field => {
            if (!endereco[field].trim()) {
                setFieldErrors(prev => ({ 
                    ...prev, 
                    [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório` 
                }));
                isValidAddress = false;
            }
        });

        if (!isValidCep(endereco.cep)) {
            setFieldErrors(prev => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }));
            isValidAddress = false;
        }

        return isValidTipo && isValidDescricao && isValidTamanho && 
               isValidPreco && isValidImagem && isValidAddress;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        resetMessages();

        // Validate all fields before submission
        if (!validateAllFields()) {
            showToast('Por favor, corrija os erros no formulário antes de enviar.', 'error');
            return;
        }

        const fotosArray = imagem
            .split(',')
            .map((url) => url.trim())
            .filter((url) => isValidUrl(url));

        const data = {
            tipoImovel: tipo,
            descricaoImovel: descricao,
            statusImovel: status,
            tamanhoImovel: parseFloat(tamanho),
            precoImovel: parseFloat(preco),
            fotosImovel: fotosArray,
            enderecoImovel: endereco,
            historicoManutencao,
        };

        try {
            setIsLoading(true);
            await api.post('/imoveis', data);
            showToast('Imóvel cadastrado com sucesso!', 'success');
            setTimeout(() => {
                onClose();
            }, 2000); // Fecha o formulário após 2 segundos para que o usuário possa ver a mensagem de sucesso
        } catch (error: unknown) {
            console.error('Erro ao cadastrar imóvel:', error);
            const apiError = error as ApiError;
            showToast(getErrorMessage(apiError), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const validateFirstStep = () => {
        const isValidTipo = validateTipo(tipo);
        const isValidDescricao = validateDescricao(descricao);
        const isValidTamanho = validateTamanho(tamanho);
        const isValidPreco = validatePreco(preco);
        const isValidImagem = validateImagem(imagem);

        return isValidTipo && isValidDescricao && isValidTamanho && isValidPreco && isValidImagem;
    };

    const nextStep = () => {
        if (step === 1) {
            if (validateFirstStep()) {
                setStep(2);
            } else {
                showToast('Por favor, corrija os erros antes de prosseguir.', 'error');
            }
        } else {
            setStep((prevStep) => prevStep + 1);
        }
    };

    const prevStep = () => setStep((prevStep) => prevStep - 1);

    return (
        <form className="form-carousel" onSubmit={handleSubmit}>
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
            {step === 1 && (
                <div className="form-step">
                    <label className="input-required">
                        Tipo:
                        <input
                            type="text"
                            value={tipo}
                            onChange={(e) => {
                                setTipo(e.target.value);
                                validateTipo(e.target.value);
                            }}
                            className={fieldErrors.tipo ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.tipo && <span className="field-error-message">{fieldErrors.tipo}</span>}
                    </label>
                    <label className="input-required">
                        Descrição:
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => {
                                setDescricao(e.target.value);
                                validateDescricao(e.target.value);
                            }}
                            className={fieldErrors.descricao ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.descricao && <span className="field-error-message">{fieldErrors.descricao}</span>}
                    </label>
                    <label>
                        Status:
                        <select
                            value={status ? "Desocupado" : "Ocupado"}
                            onChange={(e) => setStatus(e.target.value === "Desocupado")}
                            required
                        >
                            <option value="Desocupado">Desocupado</option>
                            <option value="Ocupado">Ocupado</option>
                        </select>
                    </label>
                    <label className="input-required">
                        Tamanho (m²):
                        <input
                            type="number"
                            value={tamanho}
                            onChange={(e) => {
                                setTamanho(e.target.value);
                                validateTamanho(e.target.value);
                            }}
                            className={fieldErrors.tamanho ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.tamanho && <span className="field-error-message">{fieldErrors.tamanho}</span>}
                    </label>
                    <label className="input-required">
                        Preço:
                        <input
                            type="number"
                            value={preco}
                            onChange={(e) => {
                                setPreco(e.target.value);
                                validatePreco(e.target.value);
                            }}
                            className={fieldErrors.preco ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.preco && <span className="field-error-message">{fieldErrors.preco}</span>}
                    </label>
                    <label className="input-required">
                        URLs das Imagens (separadas por vírgula):
                        <input
                            type="text"
                            value={imagem}
                            onChange={(e) => {
                                setImagem(e.target.value);
                                validateImagem(e.target.value);
                            }}
                            className={fieldErrors.imagem ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.imagem && <span className="field-error-message">{fieldErrors.imagem}</span>}
                    </label>
                    <label>
                        Histórico de Manutenção:
                        <textarea
                            value={historicoManutencao}
                            onChange={(e) => setHistoricoManutencao(e.target.value)}
                        />
                    </label>
                    <button
                        type="button"
                        className="btn-next-step"
                        onClick={nextStep}
                    >
                        Próximo ➔
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="form-step">
                    <label className="input-required">
                        CEP:
                        <input
                            type="text"
                            name="cep"
                            value={endereco.cep}
                            onChange={handleEnderecoChange}
                            onBlur={buscarCep}
                            className={fieldErrors.cep ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.cep && <span className="field-error-message">{fieldErrors.cep}</span>}
                    </label>
                    <label className="input-required">
                        Estado:
                        <input
                            type="text"
                            name="estado"
                            value={endereco.estado}
                            onChange={handleEnderecoChange}
                            className={fieldErrors.estado ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.estado && <span className="field-error-message">{fieldErrors.estado}</span>}
                    </label>
                    <label className="input-required">
                        Cidade:
                        <input
                            type="text"
                            name="cidade"
                            value={endereco.cidade}
                            onChange={handleEnderecoChange}
                            className={fieldErrors.cidade ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.cidade && <span className="field-error-message">{fieldErrors.cidade}</span>}
                    </label>
                    <label className="input-required">
                        Rua:
                        <input
                            type="text"
                            name="rua"
                            value={endereco.rua}
                            onChange={handleEnderecoChange}
                            className={fieldErrors.rua ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.rua && <span className="field-error-message">{fieldErrors.rua}</span>}
                    </label>
                    <label className="input-required">
                        Bairro:
                        <input
                            type="text"
                            name="bairro"
                            value={endereco.bairro}
                            onChange={handleEnderecoChange}
                            className={fieldErrors.bairro ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.bairro && <span className="field-error-message">{fieldErrors.bairro}</span>}
                    </label>
                    <label className="input-required">
                        Número:
                        <input
                            type="text"
                            name="numero"
                            value={endereco.numero}
                            onChange={handleEnderecoChange}
                            className={fieldErrors.numero ? "input-error" : ""}
                            required
                        />
                        {fieldErrors.numero && <span className="field-error-message">{fieldErrors.numero}</span>}
                    </label>
                    <label>
                        Complemento:
                        <input
                            type="text"
                            name="complemento"
                            value={endereco.complemento}
                            onChange={handleEnderecoChange}
                        />
                    </label>
                    <small style={{color: 'gray'}}>
                        Dados preenchidos automaticamente. Você pode ajustá-los, se necessário.
                    </small>
                    <div className="navigation-buttons">
                        <button
                            type="button"
                            className="btn-prev-step"
                            onClick={prevStep}
                        >
                            ⬅ Voltar
                        </button>
                        <button
                            type="submit"
                            className="btn-submit-form"
                            disabled={isLoading}
                        >
                            {isLoading ? "Cadastrando..." : "Cadastrar Imóvel"}
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
};

export default CadastroImovelForm;
