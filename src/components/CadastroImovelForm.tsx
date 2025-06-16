import React, { FormEvent, useState, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';
import '../styles/shared.css';
import '../styles/CadastroImovel.css';
import { ApiError, getErrorMessage, isValidUrl, isValidCep } from '../utils/errorHandling';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { NumericFormat } from "react-number-format";

interface CadastroImovelFormProps {
    onClose?: () => void;
}
const CustomInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => <input ref={ref} {...props} />
);

const CadastroImovelForm: React.FC<CadastroImovelFormProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [tipo, setTipo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(true);
    const [tamanho, setTamanho] = useState('');
    const [preco, setPreco] = useState('');
    const [imagem, setImagem] = useState('');
    const [endereco, setEndereco] = useState({
        rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
    });
    const [historicoManutencao, setHistoricoManutencao] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        tipo: '', descricao: '', tamanho: '', preco: '', imagem: '',
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '',
    });


    const resetMessages = useCallback(() => {
        setFieldErrors({
            tipo: '', descricao: '', tamanho: '', preco: '', imagem: '',
            cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '',
        });
    }, []);

    const redirectOrClose = () => {
        if (onClose) onClose();
        else navigate('/imoveis');
    };

    const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEndereco((prev) => ({ ...prev, [name]: value }));

        if (name === 'cep') {
            if (!value.trim()) setFieldErrors((prev) => ({ ...prev, cep: 'CEP é obrigatório' }));
            else if (!isValidCep(value)) setFieldErrors((prev) => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }));
            else setFieldErrors((prev) => ({ ...prev, cep: '' }));
        }

        if (['rua', 'numero', 'bairro', 'cidade', 'estado'].includes(name)) {
            if (!value.trim()) setFieldErrors((prev) => ({ ...prev, [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} é obrigatório` }));
            else setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateTipo = (v: string) => {
        if (!v.trim()) {
            setFieldErrors((prev) => ({ ...prev, tipo: 'Tipo é obrigatório' }));
            return false;
        }
        setFieldErrors((prev) => ({ ...prev, tipo: '' }));
        return true;
    };

    const validateDescricao = (v: string) => {
        if (!v.trim()) {
            setFieldErrors((prev) => ({ ...prev, descricao: 'Descrição é obrigatória' }));
            return false;
        }
        if (v.trim().length < 10) {
            setFieldErrors((prev) => ({ ...prev, descricao: 'Descrição deve ter pelo menos 10 caracteres' }));
            return false;
        }
        setFieldErrors((prev) => ({ ...prev, descricao: '' }));
        return true;
    };

    const validateTamanho = (v: string) => {
        const n = parseFloat(v);
        if (!v.trim()) {
            setFieldErrors((prev) => ({ ...prev, tamanho: 'Tamanho é obrigatório' }));
            return false;
        }
        if (isNaN(n) || n <= 0) {
            setFieldErrors((prev) => ({ ...prev, tamanho: 'Tamanho deve ser um número positivo' }));
            return false;
        }
        setFieldErrors((prev) => ({ ...prev, tamanho: '' }));
        return true;
    };

    const validatePreco = (v: string) => {
        const n = parseFloat(v);
        if (!v.trim()) {
            setFieldErrors((prev) => ({ ...prev, preco: 'Preço é obrigatório' }));
            return false;
        }
        if (isNaN(n) || n <= 0) {
            setFieldErrors((prev) => ({ ...prev, preco: 'Preço deve ser um número positivo' }));
            return false;
        }
        setFieldErrors((prev) => ({ ...prev, preco: '' }));
        return true;
    };

    const validateImagem = (v: string) => {
        if (!v.trim()) {
            setFieldErrors((prev) => ({ ...prev, imagem: 'URL da imagem é obrigatória' }));
            return false;
        }
        const urls = v.split(',').map((u) => u.trim()).filter(Boolean);
        const valid = urls.every((u) => isValidUrl(u));
        if (!valid) {
            setFieldErrors((prev) => ({ ...prev, imagem: 'Algumas URLs são inválidas' }));
            return false;
        }
        setFieldErrors((prev) => ({ ...prev, imagem: '' }));
        return true;
    };

    const buscarCep = async () => {
        resetMessages();
        const cep = endereco.cep.replace(/\D/g, '');
        if (!isValidCep(cep)) return showToast('Digite um CEP válido com 8 dígitos.', 'error');
        try {
            setIsLoading(true);
            const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (!data.erro) {
                setEndereco((prev) => ({ ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }));
                setFieldErrors((prev) => ({ ...prev, rua: '', bairro: '', cidade: '', estado: '' }));
                showToast('Endereço encontrado com sucesso!', 'success');
            } else showToast('CEP não encontrado.', 'error');
        } catch (e) {
            console.error(e);
            showToast('Erro ao buscar o CEP.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const validateAllFields = () => {
        const valid = [validateTipo(tipo), validateDescricao(descricao), validateTamanho(tamanho), validatePreco(preco), validateImagem(imagem)];
        const fields = ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'] as const;
        let addressValid = true;
        for (const f of fields) {
            if (!endereco[f].trim()) {
                setFieldErrors((prev) => ({ ...prev, [f]: `${f.charAt(0).toUpperCase() + f.slice(1)} é obrigatório` }));
                addressValid = false;
            }
        }
        if (!isValidCep(endereco.cep)) {
            setFieldErrors((prev) => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }));
            addressValid = false;
        }
        return valid.every(Boolean) && addressValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        resetMessages();
        if (!validateAllFields()) return showToast('Por favor, corrija os erros.', 'error');

        const fotosArray = imagem.split(',').map((url) => url.trim()).filter((url) => isValidUrl(url));
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
            setTimeout(() => redirectOrClose(), 2000);
        } catch (error) {
            console.error(error);
            const apiError = error as ApiError;
            showToast(getErrorMessage(apiError), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const validateFirstStep = () => validateTipo(tipo) && validateDescricao(descricao) && validateTamanho(tamanho) && validatePreco(preco) && validateImagem(imagem);


    return (
        <div className="cadastro-imovel-page">
            <h1>Cadastrar Novo Imóvel</h1>
            <form className="form-carousel" onSubmit={handleSubmit}>
                {step === 1 && (
                    <fieldset>
                        <legend>Informações do Imóvel</legend>
                        <div className="grid">
                            <div className="form-group">
                                <label htmlFor="tipo">* Tipo:</label>
                                <input
                                    id="tipo"
                                    type="text"
                                    value={tipo}
                                    onChange={(e) => {
                                        setTipo(e.target.value);
                                        validateTipo(e.target.value);
                                    }}
                                    placeholder="Ex: Casa, Apartamento, Terreno"
                                    className={fieldErrors.tipo ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.tipo && <span className="field-error-message">{fieldErrors.tipo}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="descricao">* Descrição:</label>
                                <input
                                    id="descricao"
                                    type="text"
                                    value={descricao}
                                    onChange={(e) => {
                                        setDescricao(e.target.value);
                                        validateDescricao(e.target.value);
                                    }}
                                    placeholder="Breve descrição do imóvel"
                                    className={fieldErrors.descricao ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.descricao && <span className="field-error-message">{fieldErrors.descricao}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">* Status:</label>
                                <select
                                    id="status"
                                    value={status ? "Desocupado" : "Ocupado"}
                                    onChange={(e) => setStatus(e.target.value === "Desocupado")}
                                    required
                                >
                                    <option value="Desocupado">Desocupado</option>
                                    <option value="Ocupado">Ocupado</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="tamanho">* Tamanho (m²):</label>
                                <NumericFormat
                                    id="tamanho"
                                    className={fieldErrors.tamanho ? "input-error" : ""}
                                    value={tamanho}
                                    onValueChange={(values) => {
                                        setTamanho(values.value);
                                        validateTamanho(values.value);
                                    }}
                                    suffix=" m²"
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    placeholder="Área em m²"
                                    required
                                    customInput={CustomInput} // Usando o CustomInput estável
                                />
                                {fieldErrors.tamanho &&
                                    <span className="field-error-message">{fieldErrors.tamanho}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="preco">* Preço:</label>
                                <NumericFormat
                                    id="preco"
                                    className={fieldErrors.preco ? "input-error" : ""}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    value={preco}
                                    onValueChange={(values) => {
                                        setPreco(values.value);
                                        validatePreco(values.value);
                                    }}
                                    required
                                    placeholder="Digite o valor do imóvel"
                                    customInput={CustomInput} // Usando o CustomInput estável
                                />
                                {fieldErrors.preco && <span className="field-error-message">{fieldErrors.preco}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="imagem">* URLs das Imagens (separadas por vírgula):</label>
                                <input
                                    id="imagem"
                                    type="text"
                                    value={imagem}
                                    onChange={(e) => {
                                        setImagem(e.target.value);
                                        validateImagem(e.target.value);
                                    }}
                                    placeholder="URLs separadas por vírgula"
                                    className={fieldErrors.imagem ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.imagem && <span className="field-error-message">{fieldErrors.imagem}</span>}
                            </div>

                            <div className="form-group" style={{gridColumn: "1 / -1"}}>
                                <label htmlFor="manutencao">Histórico de Manutenção:</label>
                                <textarea
                                    id="manutencao"
                                    value={historicoManutencao}
                                    onChange={(e) => setHistoricoManutencao(e.target.value)}
                                    placeholder="Ex: Pintura em 2023, troca de telhado em 2022..."
                                />
                            </div>
                        </div>
                        <div className="navigation-buttons">
                            <div></div>
                            <button
                                type="button"
                                className="btn-step btn-next"
                                onClick={() => validateFirstStep() ? setStep(2) : showToast('Corrija os erros.', 'error')}
                            >
                                Próximo ➔
                            </button>
                        </div>
                    </fieldset>
                )}

                {step === 2 && (
                    <fieldset>
                        <legend>Endereço do Imóvel</legend>
                        <div className="grid">
                            <div className="form-group">
                                <label htmlFor="cep">* CEP:</label>
                                <input
                                    type="text"
                                    name="cep"
                                    value={endereco.cep}
                                    onChange={handleEnderecoChange}
                                    onBlur={buscarCep}
                                    placeholder="Digite o CEP do imóvel"
                                    className={fieldErrors.cep ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.cep && <span className="field-error-message">{fieldErrors.cep}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="estado">* Estado:</label>
                                <input
                                    type="text"
                                    name="estado"
                                    value={endereco.estado}
                                    onChange={handleEnderecoChange}
                                    placeholder="Ex: PR, SP, RJ"
                                    className={fieldErrors.estado ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.estado && <span className="field-error-message">{fieldErrors.estado}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="cidade">* Cidade:</label>
                                <input
                                    type="text"
                                    name="cidade"
                                    value={endereco.cidade}
                                    onChange={handleEnderecoChange}
                                    placeholder="Ex: Curitiba, São Paulo"
                                    className={fieldErrors.cidade ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.cidade && <span className="field-error-message">{fieldErrors.cidade}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="rua">* Rua:</label>
                                <input
                                    type="text"
                                    name="rua"
                                    value={endereco.rua}
                                    onChange={handleEnderecoChange}
                                    placeholder="Ex: Rua das Flores"
                                    className={fieldErrors.rua ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.rua && <span className="field-error-message">{fieldErrors.rua}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="bairro">* Bairro:</label>
                                <input
                                    type="text"
                                    name="bairro"
                                    value={endereco.bairro}
                                    onChange={handleEnderecoChange}
                                    placeholder="Ex: Centro, Jardim América"
                                    className={fieldErrors.bairro ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.bairro && <span className="field-error-message">{fieldErrors.bairro}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="numero">* Número:</label>
                                <input
                                    type="text"
                                    name="numero"
                                    value={endereco.numero}
                                    onChange={handleEnderecoChange}
                                    placeholder="Número do imóvel"
                                    className={fieldErrors.numero ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.numero && <span className="field-error-message">{fieldErrors.numero}</span>}
                            </div>
                            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                <label htmlFor="complemento">Complemento:</label>
                                <input
                                    type="text"
                                    name="complemento"
                                    value={endereco.complemento}
                                    onChange={handleEnderecoChange}
                                    placeholder="Ex: Bloco B, Apt 303"
                                />
                            </div>
                        </div>
                        <small style={{ color: 'gray' }}>
                            Dados preenchidos automaticamente. Você pode ajustá-los, se necessário.
                        </small>
                        <div className="navigation-buttons">
                            <div style={{flex: 1}}>
                                <button
                                    type="button"
                                    className="btn-step btn-prev-step"
                                    onClick={() => setStep(1)}
                                >
                                    ⬅ Voltar
                                </button>
                            </div>
                            <div className="submit-button">
                                <button
                                    type="submit"
                                    className="btn-step btn-next-step"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Cadastrando...' : 'Cadastrar Imóvel'}
                                </button>
                            </div>
                        </div>
                    </fieldset>
                )}
            </form>
        </div>
    );
};

export default CadastroImovelForm;
