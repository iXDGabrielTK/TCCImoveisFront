import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import '../styles/shared.css';
import '../styles/CadastroVistoria.css'; // Importa os estilos de layout principais
import {isValidDate } from '../utils/errorHandling';

interface Imovel {
    idImovel: number;
    descricaoImovel: string;
    tipoImovel: string;
    enderecoImovel: {
        rua: string;
        numero: string;
        bairro: string;
    };
}

type Ambiente = {
    nome: string;
    descricao: string;
    fotos: File[];
};

const CadastroVistoriaForm: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [tipoVistoria, setTipoVistoria] = useState('');
    const [laudoVistoria, setLaudoVistoria] = useState('');
    const [dataVistoria, setDataVistoria] = useState('');
    const [selectedImovelId, setSelectedImovelId] = useState('');
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);

    const [fieldErrors, setFieldErrors] = useState({
        tipoVistoria: '',
        laudoVistoria: '',
        dataVistoria: '',
        imovelId: ''
    });

    useEffect(() => {
        api.get('/imoveis')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setImoveis(res.data);
                } else if (Array.isArray(res.data.content)) {
                    setImoveis(res.data.content);
                } else {
                    setImoveis([]);
                }
            })
            .catch(() => {
                setImoveis([]);
            });
    }, []);

    const adicionarAmbiente = () => {
        setAmbientes([...ambientes, { nome: '', descricao: '', fotos: [] }]);
    };

    const removerAmbiente = (index: number) => {
        const novaLista = [...ambientes];
        novaLista.splice(index, 1);
        setAmbientes(novaLista);
    };

    const atualizarAmbiente = (index: number, campo: keyof Ambiente, valor: string | File[]) => {
        const novaLista = [...ambientes];
        if (campo === 'fotos') {
            // Garante que valor é File[]
            novaLista[index].fotos = [...novaLista[index].fotos, ...((valor as File[]).filter((v): v is File => v instanceof File))];
        } else {
            novaLista[index][campo] = valor as string;
        }
        setAmbientes(novaLista);
    };

    const removerFoto = (ambienteIndex: number, fotoIndex: number) => {
        const novaLista = [...ambientes];
        novaLista[ambienteIndex].fotos.splice(fotoIndex, 1);
        setAmbientes(novaLista);
    };

    const validate = () => {
        let valid = true;
        const errors = { ...fieldErrors };

        if (!tipoVistoria.trim()) {
            errors.tipoVistoria = 'Tipo é obrigatório';
            valid = false;
        } else if (!['Inicial', 'Periódica', 'Final'].includes(tipoVistoria.trim())) {
            errors.tipoVistoria = 'Deve ser Inicial, Periódica ou Final';
            valid = false;
        } else errors.tipoVistoria = '';

        if (!laudoVistoria.trim()) {
            errors.laudoVistoria = 'Laudo é obrigatório';
            valid = false;
        } else if (laudoVistoria.trim().length < 10) {
            errors.laudoVistoria = 'Deve ter pelo menos 10 caracteres';
            valid = false;
        } else errors.laudoVistoria = '';

        if (!isValidDate(dataVistoria)) {
            errors.dataVistoria = 'Data inválida';
            valid = false;
        } else errors.dataVistoria = '';

        if (!selectedImovelId.trim() || isNaN(Number(selectedImovelId))) {
            errors.imovelId = 'Selecione um imóvel válido';
            valid = false;
        } else errors.imovelId = '';

        setFieldErrors(errors);
        return valid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const usuarioId = localStorage.getItem('usuario_Id');
        const token = localStorage.getItem('access_token');

        if (!usuarioId || !token) {
            showToast('Autenticação inválida. Refaça o login.', 'error');
            return;
        }

        const dados = {
            tipoVistoria,
            laudoVistoria,
            dataVistoria,
            imovelId: Number(selectedImovelId),
            usuarioId: Number(usuarioId),
            ambientes: ambientes.map((a) => ({ nome: a.nome, descricao: a.descricao }))
        };

        const formData = new FormData();
        formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }));

        ambientes.forEach((ambiente, ambienteIndex) => {
            ambiente.fotos.forEach((file, fotoIndex) => {
                // CORREÇÃO APLICADA AQUI: Incluindo o nome original do arquivo
                formData.append('fotos', file, `amb_${ambienteIndex}_${fotoIndex}_${file.name}`);
            });
        });

        // src/components/CadastroVistoriaForm.tsx

// ... (código anterior)

        try {
            setIsLoading(true);
            await api.post('/vistorias/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': undefined, // <-- DEFINA COMO UNDEFINED AQUI
                }
            });
            showToast('Vistoria registrada com sucesso!', 'success');
            setTimeout(() => navigate('/imoveis'), 1500);
        } catch (err) {
            console.error('Erro ao enviar:', err);
            showToast('Erro ao registrar vistoria com fotos.', 'error');
        } finally {
            setIsLoading(false);
        }

// ... (resto do código)
    };

    return (
        <div className="cadastro-imovel-page"> {/* Usa a classe de layout principal */}
            <h1>Registrar Nova Vistoria</h1>
            <form className="form-carousel" onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Informações da Vistoria</legend>
                    <div className="grid">
                        <div className="form-group">
                            <label>* Imóvel</label>
                            <select
                                value={selectedImovelId}
                                onChange={(e) => setSelectedImovelId(e.target.value)}
                                className={fieldErrors.imovelId ? 'input-error' : ''}
                            >
                                <option value="">Selecione...</option>
                                {imoveis.map((imovel) => (
                                    <option key={imovel.idImovel} value={imovel.idImovel}>
                                        {imovel.descricaoImovel} - {imovel.tipoImovel}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.imovelId && <span className="field-error-message">{fieldErrors.imovelId}</span>}
                        </div>

                        <div className="form-group">
                            <label>* Tipo de Vistoria</label>
                            <select
                                value={tipoVistoria}
                                onChange={(e) => setTipoVistoria(e.target.value)}
                                className={fieldErrors.tipoVistoria ? 'input-error' : ''}
                            >
                                <option value="">Selecione o tipo</option>
                                <option value="Inicial">Inicial</option>
                                <option value="Periódica">Periódica</option>
                                <option value="Final">Final</option>
                            </select>
                            {fieldErrors.tipoVistoria && <span className="field-error-message">{fieldErrors.tipoVistoria}</span>}
                        </div>

                        <div className="form-group">
                            <label>* Data</label>
                            <input
                                type="date"
                                value={dataVistoria}
                                onChange={(e) => setDataVistoria(e.target.value)}
                                className={fieldErrors.dataVistoria ? 'input-error' : ''}
                            />
                            {fieldErrors.dataVistoria && <span className="field-error-message">{fieldErrors.dataVistoria}</span>}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>* Laudo</label>
                        <textarea
                            rows={4}
                            value={laudoVistoria}
                            onChange={(e) => setLaudoVistoria(e.target.value)}
                            placeholder="Descrição detalhada da vistoria"
                            className={fieldErrors.laudoVistoria ? 'input-error' : ''}
                        />
                        {fieldErrors.laudoVistoria && <span className="field-error-message">{fieldErrors.laudoVistoria}</span>}
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Ambientes Inspecionados</legend>
                    {ambientes.map((ambiente, index) => (
                        <div key={index} className="form-group full-width" style={{ marginBottom: '20px' }}>
                            <label>Nome do Ambiente #{index + 1}</label>
                            <input
                                type="text"
                                placeholder="Ex: Quarto 1"
                                value={ambiente.nome}
                                onChange={(e) => atualizarAmbiente(index, 'nome', e.target.value)}
                            />

                            <label style={{ marginTop: '8px' }}>Descrição</label>
                            <textarea
                                placeholder="Ex: Parede com rachadura..."
                                rows={3}
                                value={ambiente.descricao}
                                onChange={(e) => atualizarAmbiente(index, 'descricao', e.target.value)}
                            />

                            <div className="form-group-file">
                                <label className="file-input-label" htmlFor={`file-upload-${index}`}>
                                    Escolher Arquivos
                                </label>
                                <input
                                    id={`file-upload-${index}`}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => atualizarAmbiente(index, 'fotos', Array.from(e.target.files || []))}
                                    className="hidden-file-input"
                                />
                                <span className="file-name-display">
                                    {ambiente.fotos.length > 0 ?
                                        `${ambiente.fotos.length} arquivo(s) selecionado(s)` :
                                        'Nenhum arquivo escolhido'
                                    }
                                </span>
                            </div>

                            <div className="thumbnail-grid">
                                {ambiente.fotos.map((foto, i) => (
                                    <div key={i} className="thumbnail-container">
                                        <img
                                            src={URL.createObjectURL(foto)}
                                            alt={`Foto ${i + 1}`}
                                            className="thumbnail"
                                        />
                                        <button
                                            type="button"
                                            className="remove-thumbnail-btn"
                                            onClick={() => removerFoto(index, i)}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => removerAmbiente(index)}
                                className="btn-step"
                                style={{ backgroundColor: '#f44336', color: 'white', marginTop: '20px' }}
                            >
                                Remover Ambiente
                            </button>
                        </div>
                    ))}

                    <div className="navigation-buttons">
                        <button type="button" className="btn-step" onClick={adicionarAmbiente}>
                            + Adicionar Ambiente
                        </button>
                    </div>
                </fieldset>

                <div className="navigation-buttons">
                    <button type="submit" className="btn-step btn-next-step" disabled={isLoading}>
                        {isLoading ? 'Enviando...' : 'Registrar Vistoria'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CadastroVistoriaForm;