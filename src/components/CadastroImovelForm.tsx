import React, {FormEvent, useState, useCallback, useEffect} from 'react';
import axios from 'axios';
import api from '../services/api';
import '../styles/shared.css';
import '../styles/CadastroImovel.css';
import { ApiError, getErrorMessage, isValidCep } from '../utils/errorHandling';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { NumericFormat } from "react-number-format";
import InputMask from 'react-input-mask'; // Importar InputMask para a máscara de CEP

interface CadastroImovelFormProps {
    onClose?: () => void;
}

// CustomInput para NumericFormat e InputMask
const CustomInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => <input ref={ref} {...props} />
);

const CadastroImovelForm: React.FC<CadastroImovelFormProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [step, setStep] = useState(1); // Mantém o controle de passos
    const [tipo, setTipo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(true);
    const [tamanho, setTamanho] = useState('');
    const [preco, setPreco] = useState('');
    const [fotosImovel, setFotosImovel] = useState<File[]>([]);
    const [imobiliarias, setImobiliarias] = useState<{ id: number; nome: string }[]>([]);
    const [imobiliariaId, setImobiliariaId] = useState<string>('');
    const [endereco, setEndereco] = useState({
        rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
    });
    const [historicoManutencao, setHistoricoManutencao] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        tipo: '', descricao: '', tamanho: '', imobiliariaId: '', preco: '', fotosImovel: '',
        cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
    });

    const resetMessages = useCallback(() => {
        setFieldErrors({
            tipo: '', descricao: '', tamanho: '', imobiliariaId: '', preco: '', fotosImovel: '',
            cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
        });
    }, []);

    const redirectOrClose = () => {
        if (onClose) onClose();
        else navigate('/imoveis');
    };

    const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEndereco((prev) => ({ ...prev, [name]: value }));

        if (name === 'cep') {
            if (!value.trim()) setFieldErrors((prev) => ({ ...prev, cep: 'CEP é obrigatório' }));
            else if (!isValidCep(value.replace(/\D/g, ''))) setFieldErrors((prev) => ({ ...prev, cep: 'CEP inválido' }));
            else setFieldErrors((prev) => ({ ...prev, cep: '' }));
        }

        if (['rua', 'numero', 'bairro', 'cidade', 'estado'].includes(name)) {
            if (!value.trim()) {
                setFieldErrors((prev) => ({ ...prev, [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} é obrigatório` }));
            } else {
                setFieldErrors((prev) => ({ ...prev, [name]: '' }));
            }
        }
        if (name === 'complemento') {
            setFieldErrors((prev) => ({ ...prev, complemento: '' })); // Complemento é opcional
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
            setFieldErrors((prev) => ({ ...prev, descricao: 'Mínimo de 10 caracteres' }));
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
            setFieldErrors((prev) => ({ ...prev, tamanho: 'Deve ser positivo' }));
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
            setFieldErrors((prev) => ({ ...prev, preco: 'Deve ser positivo' }));
            return false;
        }
        setFieldErrors((prev) => ({ ...prev, preco: '' }));
        return true;
    };

    const validateFotosImovel = (files: File[]) => {
        if (files.length === 0) {
            setFieldErrors((prev) => ({ ...prev, fotosImovel: 'Adicione pelo menos uma foto.' }));
            return false;
        }
        setFieldErrors((prev) => ({ ...prev, fotosImovel: '' }));
        return true;
    };

    const validateImobiliariaId = (v: string) => {
        if (!v) {
            setFieldErrors(prev => ({ ...prev, imobiliariaId: 'Imobiliária é obrigatória' }));
            return false;
        }
        setFieldErrors(prev => ({ ...prev, imobiliariaId: '' }));
        return true;
    };

    const handleImageInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setFotosImovel(prevFotos => {
                const updatedFotos = [...prevFotos, ...newFiles];
                validateFotosImovel(updatedFotos);
                return updatedFotos;
            });
        }
    }, []);


    const removeNewPhoto = useCallback((index: number) => {
        setFotosImovel(prev => {
            const newPhotos = [...prev];
            newPhotos.splice(index, 1);
            validateFotosImovel(newPhotos);
            return newPhotos;
        });
    }, []);

    const buscarCep = async () => {
        resetMessages();
        const cep = endereco.cep.replace(/\D/g, '');
        if (!isValidCep(cep)) {
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

    // Corrige o valor de roles para aceitar string ou array stringificado
    let role = localStorage.getItem('roles');
    if (role) {
        try {
            const parsed = JSON.parse(role);
            if (Array.isArray(parsed) && parsed.length > 0) {
                role = parsed[0];
            } else if (typeof parsed === 'string') {
                role = parsed;
            }
        } catch {
            // Se não for JSON, mantém o valor original
        }
    }
    console.log('role:', role); // Para depuração

    const validateFirstStep = () => {
        const valid = (
            validateTipo(tipo) &&
            validateDescricao(descricao) &&
            validateTamanho(tamanho) &&
            validatePreco(preco) &&
            (role === 'FUNCIONARIO' || validateImobiliariaId(imobiliariaId)) &&
            validateFotosImovel(fotosImovel)
        );
        setFieldErrors((prev) => ({ ...prev, complemento: '' }));
        return valid;
    };

    const validateSecondStep = () => {
        let valid = true;
        const addressFields = ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'] as const;
        for (const f of addressFields) {
            if (!endereco[f].trim()) {
                setFieldErrors((prev) => ({ ...prev, [f]: `${f.charAt(0).toUpperCase() + f.slice(1)} é obrigatório` }));
                valid = false;
            } else {
                setFieldErrors((prev) => ({ ...prev, [f]: '' }));
            }
        }
        if (!isValidCep(endereco.cep.replace(/\D/g, ''))) {
            setFieldErrors((prev) => ({ ...prev, cep: 'CEP inválido' }));
            valid = false;
        } else {
            setFieldErrors((prev) => ({ ...prev, cep: '' }));
        }
        return valid;
    };

    useEffect(() => {
        if (role && role !== 'FUNCIONARIO') {
            api.get('/imobiliaria/imobiliarias-aprovadas')
                .then(response => {
                    setImobiliarias(response.data);
                })
                .catch(error => {
                    showToast('Erro ao buscar imobiliárias', 'error');
                    console.error(error);
                });
        }
    }, [showToast, role]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        resetMessages();

        // Valida ambos os passos antes de submeter
        if (!validateFirstStep()) {
            setStep(1); // Retorna para o primeiro passo se houver erros
            return showToast('Por favor, corrija os erros na primeira etapa.', 'error');
        }
        if (!validateSecondStep()) {
            setStep(2); // Retorna para o segundo passo se houver erros
            return showToast('Por favor, corrija os erros na segunda etapa.', 'error');
        }

        const imovelData = {
            tipoImovel: tipo,
            descricaoImovel: descricao,
            statusImovel: status,
            tamanhoImovel: parseFloat(tamanho),
            precoImovel: parseFloat(preco),
            historicoManutencao,
            enderecoImovel: endereco,
            imobiliariaId: parseInt(imobiliariaId)
        };

        const formData = new FormData();
        formData.append('dados', new Blob([JSON.stringify(imovelData)], { type: 'application/json' }));

        fotosImovel.forEach((file) => {
            formData.append('fotos', file, file.name);
        });

        try {
            setIsLoading(true);
            await api.post('/imoveis', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
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

                            {/* Só mostra o campo de imobiliária se não for FUNCIONARIO */}
                            {role !== 'FUNCIONARIO' && (
                                <div className="form-group">
                                    <label htmlFor="imobiliariaId">* Imobiliária:</label>
                                    <select
                                        id="imobiliariaId"
                                        value={imobiliariaId}
                                        onChange={(e) => {
                                            setImobiliariaId(e.target.value);
                                            validateImobiliariaId(e.target.value);
                                        }}
                                        className={fieldErrors.imobiliariaId ? "input-error" : ""}
                                        required
                                    >
                                        <option value="">Selecione uma imobiliária</option>
                                        {imobiliarias.map(i => (
                                            <option key={i.id} value={i.id}>{i.nome}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.imobiliariaId && <span className="field-error-message">{fieldErrors.imobiliariaId}</span>}
                                </div>
                            )}

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
                                    customInput={CustomInput}
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
                                    customInput={CustomInput}
                                />
                                {fieldErrors.preco && <span className="field-error-message">{fieldErrors.preco}</span>}
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

                            {/* Histórico de Manutenção ocupa a largura total */}
                            <div className="form-group full-width">
                                <label htmlFor="manutencao">Histórico de Manutenção:</label>
                                <textarea
                                    id="manutencao"
                                    value={historicoManutencao}
                                    onChange={(e) => setHistoricoManutencao(e.target.value)}
                                    placeholder="Ex: Pintura em 2023, troca de telhado em 2022..."
                                />
                            </div>

                            {/* Campo de Upload de Fotos - Último item da primeira tela, ocupa largura total */}
                            <div className="form-group-file full-width">
                                <label className="file-input-label" htmlFor="file-upload-imovel">
                                    * Escolher Fotos do Imóvel
                                </label>
                                <input
                                    id="file-upload-imovel"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageInputChange}
                                    className="hidden-file-input"
                                />
                                <span className="file-name-display">
                                    {fotosImovel.length > 0 ?
                                        `${fotosImovel.length} foto(s) selecionada(s)` :
                                        'Nenhuma foto escolhida'
                                    }
                                </span>
                                {fieldErrors.fotosImovel &&
                                    <span className="field-error-message">{fieldErrors.fotosImovel}</span>}
                            </div>

                            {fotosImovel.length > 0 && (
                                <div className="thumbnail-grid full-width">
                                    {fotosImovel.map((foto, i) => (
                                        <div key={i} className="thumbnail-container">
                                            <img
                                                src={URL.createObjectURL(foto)}
                                                alt={`Foto ${i + 1}`}
                                                className="thumbnail"
                                            />
                                            <button
                                                type="button"
                                                className="remove-thumbnail-btn"
                                                onClick={() => removeNewPhoto(i)}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Fim do grid principal */}
                        <div className="navigation-buttons">
                            <button
                                type="button"
                                className="btn-step btn-next-step"
                                // Remova o onClick anterior se for para teste e adicione as validações
                                onClick={() => validateFirstStep() ? setStep(2) : showToast('Por favor, corrija os erros na primeira etapa.', 'error')}
                                style={{marginLeft: 'auto'}} // Adicione esta linha inline ou crie uma classe específica no CSS
                            >
                                Próximo ➔
                            </button>
                        </div>
                    </fieldset>
                )}

                {step === 2 && (
                    <fieldset>
                        <legend>Endereço do Imóvel</legend>
                        {/* Título para a seção de endereço */}
                        <div className="grid"> {/* Grid para endereço */}
                            <div className="form-group">
                                <label htmlFor="cep">* CEP:</label>
                                <InputMask
                                    mask="99999-999"
                                    maskChar="_"
                                    value={endereco.cep}
                                    onChange={handleEnderecoChange}
                                    onBlur={buscarCep}
                                >
                                    {(inputProps) => (
                                        <input
                                            {...inputProps}
                                            type="text"
                                            id="cep"
                                            name="cep"
                                            placeholder="Digite o CEP do imóvel"
                                            className={fieldErrors.cep ? "input-error" : ""}
                                            required
                                        />
                                    )}
                                </InputMask>

                                <a
                                    href="https://buscacepinter.correios.com.br/app/endereco/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cep-link"
                                >
                                    não sei o meu CEP
                                </a>

                                {fieldErrors.cep && (
                                    <span className="field-error-message">{fieldErrors.cep}</span>
                                )}
                            </div>


                            <div className="form-group">
                                <label htmlFor="estado">* Estado:</label>
                                <select
                                    name="estado"
                                    value={endereco.estado}
                                    onChange={handleEnderecoChange}
                                    className={fieldErrors.estado ? "input-error" : ""}
                                    required
                                >
                                    <option value="">Selecione o estado</option>
                                    <option value="AC">Acre</option>
                                    <option value="AL">Alagoas</option>
                                    <option value="AP">Amapá</option>
                                    <option value="AM">Amazonas</option>
                                    <option value="BA">Bahia</option>
                                    <option value="CE">Ceará</option>
                                    <option value="DF">Distrito Federal</option>
                                    <option value="ES">Espírito Santo</option>
                                    <option value="GO">Goiás</option>
                                    <option value="MA">Maranhão</option>
                                    <option value="MT">Mato Grosso</option>
                                    <option value="MS">Mato Grosso do Sul</option>
                                    <option value="MG">Minas Gerais</option>
                                    <option value="PA">Pará</option>
                                    <option value="PB">Paraíba</option>
                                    <option value="PR">Paraná</option>
                                    <option value="PE">Pernambuco</option>
                                    <option value="PI">Piauí</option>
                                    <option value="RJ">Rio de Janeiro</option>
                                    <option value="RN">Rio Grande do Norte</option>
                                    <option value="RS">Rio Grande do Sul</option>
                                    <option value="RO">Rondônia</option>
                                    <option value="RR">Roraima</option>
                                    <option value="SC">Santa Catarina</option>
                                    <option value="SP">São Paulo</option>
                                    <option value="SE">Sergipe</option>
                                    <option value="TO">Tocantins</option>
                                </select>
                                {fieldErrors.estado &&
                                    <span className="field-error-message">{fieldErrors.estado}</span>}
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
                                {fieldErrors.cidade &&
                                    <span className="field-error-message">{fieldErrors.cidade}</span>}
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
                                {fieldErrors.bairro &&
                                    <span className="field-error-message">{fieldErrors.bairro}</span>}
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
                                {fieldErrors.numero &&
                                    <span className="field-error-message">{fieldErrors.numero}</span>}
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="complemento">Complemento:</label>
                                <input
                                    type="text"
                                    name="complemento"
                                    value={endereco.complemento}
                                    onChange={handleEnderecoChange}
                                    placeholder="Ex: Bloco B, Apt 303"
                                    className={fieldErrors.complemento ? "input-error" : ""}
                                />
                                {fieldErrors.complemento &&
                                    <span className="field-error-message">{fieldErrors.complemento}</span>}
                            </div>

                        </div>
                        {/* Fim do grid de endereço */}

                        <div className="navigation-buttons">
                            <button
                                type="button"
                                className="btn-step btn-prev"
                                onClick={() => setStep(1)}
                            >
                                ⬅ Voltar
                            </button>
                            {/* REMOVA o div.submit-button AQUI. Deixe o botão ser filho direto. */}
                            <button
                                type="submit"
                                className="btn-step btn-next-step" // Já tem o estilo verde para submit
                                disabled={isLoading}
                            >
                                {isLoading ? 'Cadastrando...' : 'Cadastrar Imóvel'}
                            </button>
                        </div>
                    </fieldset>
                )}
            </form>
        </div>
    );
};

export default CadastroImovelForm;

