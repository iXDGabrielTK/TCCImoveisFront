import React, { FormEvent, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import '../styles/shared.css';
import '../styles/CadastroImovel.css'; // Estilos de layout principais
import '../styles/CadastroVistoria.css'; // Estilos específicos de vistoria

import { ApiError, getErrorMessage, isValidDate } from '../utils/errorHandling';

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

interface VistoriaExistente {
    idVistoria: number;
    tipoVistoria: string;
    laudoVistoria: string;
    dataVistoria: string;
    imovel: {
        idImovel: number;
        descricaoImovel: string;
    };
    ambientes: AmbienteVistoriaExistente[];
}

interface AmbienteVistoriaExistente {
    id: number;
    nome: string;
    descricao: string;
    fotos: FotoVistoriaExistente[];
}

interface FotoVistoriaExistente {
    id: number;
    urlFotoVistoria: string;
    isDeleted?: boolean; // Adicionado: para marcar fotos a serem deletadas
}

type AmbienteForm = {
    id?: number; // Opcional para ambientes novos
    nome: string;
    descricao: string;
    fotos: File[]; // Novas fotos
    fotosExistentes: FotoVistoriaExistente[]; // Fotos já existentes
};

const EditarVistoriaForm: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [vistorias, setVistorias] = useState<VistoriaExistente[]>([]);
    const [selectedVistoriaId, setSelectedVistoriaId] = useState('');
    const [imoveis, setImoveis] = useState<Imovel[]>([]); // Para mostrar o imóvel, mas o select será da vistoria

    const [tipoVistoria, setTipoVistoria] = useState('');
    const [laudoVistoria, setLaudoVistoria] = useState('');
    const [dataVistoria, setDataVistoria] = useState('');
    const [ambientes, setAmbientes] = useState<AmbienteForm[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({
        selectedVistoriaId: '',
        tipoVistoria: '',
        laudoVistoria: '',
        dataVistoria: '',
        // Adicione erros para ambientes se necessário
    });

    const fetchVistorias = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/vistorias");
            if (Array.isArray(response.data)) {
                setVistorias(response.data);
            } else if (Array.isArray(response.data.content)) {
                setVistorias(response.data.content);
            } else {
                setVistorias([]);
            }
        } catch (error: unknown) {
            console.error("Erro ao buscar vistorias:", error);
            const apiError = error as ApiError;
            showToast(getErrorMessage(apiError) || "Erro ao buscar vistorias.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        // Carrega as vistorias existentes ao montar a página
        fetchVistorias();
        // Opcional: Carregar imóveis se precisar para um seletor de imóvel separado,
        // mas como a vistoria já tem o imóvel, pode não ser necessário aqui.
        // api.get('/imoveis').then(res => setImoveis(res.data)).catch(() => setImoveis([]));
    }, [fetchVistorias]);

    const handleVistoriaSelectChange = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const id = event.target.value;
        setSelectedVistoriaId(id);

        if (!id) {
            setTipoVistoria('');
            setLaudoVistoria('');
            setDataVistoria('');
            setAmbientes([]);
            setFieldErrors(prev => ({ ...prev, selectedVistoriaId: 'Selecione uma vistoria.' }));
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.get(`/vistorias/${id}`);
            const vistoria: VistoriaExistente = response.data;

            setTipoVistoria(vistoria.tipoVistoria);
            setLaudoVistoria(vistoria.laudoVistoria);
            setDataVistoria(vistoria.dataVistoria); // Assumindo formato 'yyyy-mm-dd'

            const ambientesFormatados: AmbienteForm[] = (vistoria.ambientes || []).map(amb => ({
                id: amb.id,
                nome: amb.nome,
                descricao: amb.descricao,
                fotos: [], // Novas fotos, inicialmente vazio
                fotosExistentes: (amb.fotos || []).map(f => ({ ...f, isDeleted: false })), // Fotos já salvas, inicializa isDeleted como false
            }));
            setAmbientes(ambientesFormatados);
            setFieldErrors(prev => ({ ...prev, selectedVistoriaId: '' }));

        } catch (error: unknown) {
            console.error("Erro ao carregar detalhes da vistoria:", error);
            const apiError = error as ApiError;
            showToast(getErrorMessage(apiError) || "Erro ao carregar detalhes da vistoria.", "error");
            setFieldErrors(prev => ({ ...prev, selectedVistoriaId: 'Erro ao carregar vistoria.' }));
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adicionarAmbiente = () => {
        setAmbientes([...ambientes, { nome: '', descricao: '', fotos: [], fotosExistentes: [] }]);
    };

    const removerAmbiente = async (index: number) => {
        const ambienteARemover = ambientes[index];
        if (ambienteARemover.id) {
            // Se o ambiente já existe no banco, você pode querer chamar uma API para removê-lo
            // Ex: await api.delete(`/ambientesVistoria/${ambienteARemover.id}`);
            showToast("Funcionalidade de remover ambiente existente não implementada (excluir do DB).", "info");
        }
        const novaLista = [...ambientes];
        novaLista.splice(index, 1);
        setAmbientes(novaLista);
    };

    // EditarVistoriaForm.tsx

    const atualizarAmbiente = (index: number, campo: keyof AmbienteForm, valor: any) => {
        const novaLista = [...ambientes];
        if (campo === 'fotos') {
            novaLista[index]['fotos'] = [...novaLista[index]['fotos'], ...valor];
        } else {
            (novaLista[index] as any)[campo] = valor;
        }
        setAmbientes(novaLista);
    };

    // ALTERADO: A exclusão da foto ocorre APENAS no estado local
    const removerFotoExistente = (ambienteIndex: number, fotoIndex: number) => {
        const novaLista = [...ambientes];
        // Marca a foto como deletada, em vez de removê-la imediatamente do array
        if (novaLista[ambienteIndex].fotosExistentes[fotoIndex]) {
            novaLista[ambienteIndex].fotosExistentes[fotoIndex].isDeleted = true;
            setAmbientes([...novaLista]); // Cria uma nova referência para o React detectar a mudança
            showToast("Foto marcada para exclusão. Clique em 'Salvar Edição' para confirmar.", "info");
        }
    };

    const removerFotoNova = (ambienteIndex: number, fotoIndex: number) => {
        const novaLista = [...ambientes];
        novaLista[ambienteIndex].fotos.splice(fotoIndex, 1);
        setAmbientes(novaLista);
    };

    const validateForm = () => {
        let valid = true;
        const errors = { ...fieldErrors };

        if (!selectedVistoriaId) {
            errors.selectedVistoriaId = 'Selecione uma vistoria.';
            valid = false;
        } else errors.selectedVistoriaId = '';

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

        setFieldErrors(errors);
        return valid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const usuarioId = localStorage.getItem('usuario_Id');
        const token = localStorage.getItem('access_token');

        if (!usuarioId || !token) {
            showToast('Autenticação inválida. Refaça o login.', 'error');
            return;
        }

        try {
            setIsLoading(true);

            const fotosParaRemover: number[] = [];
            const ambientesParaEnviar = ambientes.map(a => {
                const fotosFiltradas = a.fotosExistentes.filter(f => {
                    if (f.isDeleted) {
                        fotosParaRemover.push(f.id); // Coleta IDs das fotos marcadas para exclusão
                        return false; // Exclui do array a ser enviado
                    }
                    return true; // Mantém no array a ser enviado
                });

                return {
                    id: a.id,
                    nome: a.nome,
                    descricao: a.descricao,
                    fotosExistentes: fotosFiltradas.map(f => ({ id: f.id, urlFotoVistoria: f.urlFotoVistoria })),
                };
            });

            // Endpoint para remover fotos (nova chamada antes da atualização principal)
            if (fotosParaRemover.length > 0) {
                // Você precisará de um endpoint no backend que aceite uma lista de IDs para exclusão
                // Ex: PUT /fotosVistoria/excluir ou POST /fotosVistoria/excluir (com lista de IDs no body)
                // Ou chamar DELETE para cada ID
                await Promise.all(fotosParaRemover.map(id => api.delete(`/fotosVistoria/${id}`)));
                showToast(`Removendo ${fotosParaRemover.length} foto(s) existente(s)...`, "info");
            }

            const dadosVistoria = {
                idVistoria: Number(selectedVistoriaId),
                tipoVistoria,
                laudoVistoria,
                dataVistoria,
                ambientes: ambientesParaEnviar, // Envia ambientes com fotos deletadas já filtradas
            };

            const formData = new FormData();
            formData.append('dados', new Blob([JSON.stringify(dadosVistoria)], { type: 'application/json' }));

            ambientes.forEach((ambiente, ambienteIndex) => {
                ambiente.fotos.forEach((file, fotoIndex) => {
                    formData.append('fotos', file, `amb_${ambienteIndex}_${fotoIndex}_${file.name}`);
                });
            });


            await api.put(`/vistorias/${selectedVistoriaId}/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': undefined,
                }
            });
            showToast('Vistoria atualizada com sucesso!', 'success');
            await fetchVistorias();
            setSelectedVistoriaId('');
            setTipoVistoria('');
            setLaudoVistoria('');
            setDataVistoria('');
            setAmbientes([]);
        } catch (err) {
            console.error('Erro ao enviar edição:', err);
            showToast('Erro ao atualizar vistoria com fotos.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cadastro-imovel-page"> {/* Reutiliza a classe de layout principal */}
            <h1>Editar Vistoria</h1>
            <form className="form-carousel" onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Selecionar Vistoria para Edição</legend>
                    <div className="form-group full-width">
                        <label>* Selecione a Vistoria</label>
                        <select
                            value={selectedVistoriaId}
                            onChange={handleVistoriaSelectChange}
                            className={fieldErrors.selectedVistoriaId ? 'input-error' : ''}
                            disabled={isLoading}
                        >
                            <option value="">Selecione...</option>
                            {vistorias.map((vistoria) => (
                                <option key={vistoria.idVistoria} value={vistoria.idVistoria}>
                                    {vistoria.tipoVistoria} - {vistoria.imovel?.descricaoImovel || 'Imóvel Desconhecido'} ({vistoria.dataVistoria})
                                </option>
                            ))}
                        </select>
                        {fieldErrors.selectedVistoriaId && <span className="field-error-message">{fieldErrors.selectedVistoriaId}</span>}
                    </div>
                </fieldset>

                {selectedVistoriaId && (
                    <>
                        <fieldset>
                            <legend>Informações da Vistoria</legend>
                            <div className="grid">
                                <div className="form-group">
                                    <label>* Tipo de Vistoria</label>
                                    <select
                                        value={tipoVistoria}
                                        onChange={(e) => setTipoVistoria(e.target.value)}
                                        className={fieldErrors.tipoVistoria ? 'input-error' : ''}
                                        disabled={isLoading}
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
                                        disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                                {fieldErrors.laudoVistoria && <span className="field-error-message">{fieldErrors.laudoVistoria}</span>}
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Ambientes Inspecionados</legend>
                            {ambientes.map((ambiente, index) => (
                                <div key={ambiente.id || `new-${index}`} className="form-group full-width" style={{ marginBottom: '20px' }}>
                                    <label>Nome do Ambiente #{index + 1}</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Quarto 1"
                                        value={ambiente.nome}
                                        onChange={(e) => atualizarAmbiente(index, 'nome', e.target.value)}
                                        disabled={isLoading}
                                    />

                                    <label style={{ marginTop: '8px' }}>Descrição</label>
                                    <textarea
                                        placeholder="Ex: Parede com rachadura..."
                                        rows={3}
                                        value={ambiente.descricao}
                                        onChange={(e) => atualizarAmbiente(index, 'descricao', e.target.value)}
                                        disabled={isLoading}
                                    />

                                    {/* Exibição de fotos existentes (apenas as que não foram marcadas para exclusão) */}
                                    {ambiente.fotosExistentes.filter(f => !f.isDeleted).length > 0 && (
                                        <>
                                            <label style={{ marginTop: '15px' }}>Fotos Existentes:</label>
                                            <div className="thumbnail-grid">
                                                {ambiente.fotosExistentes.filter(f => !f.isDeleted).map((foto, i) => (
                                                    <div key={foto.id} className="thumbnail-container">
                                                        <img
                                                            src={foto.urlFotoVistoria}
                                                            alt={`Foto existente ${i + 1}`}
                                                            className="thumbnail"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="remove-thumbnail-btn"
                                                            onClick={() => removerFotoExistente(index, i)} // Não chama API aqui
                                                            disabled={isLoading}
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Input para novas fotos */}
                                    <div className="form-group-file" style={{ marginTop: ambiente.fotosExistentes.filter(f => !f.isDeleted).length > 0 ? '15px' : '0' }}>
                                        <label className="file-input-label" htmlFor={`file-upload-${index}`}>
                                            Escolher Novas Fotos
                                        </label>
                                        <input
                                            id={`file-upload-${index}`}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => atualizarAmbiente(index, 'fotos', Array.from(e.target.files || []))}
                                            className="hidden-file-input"
                                            disabled={isLoading}
                                        />
                                        <span className="file-name-display">
                                            {ambiente.fotos.length > 0 ?
                                                `${ambiente.fotos.length} nova(s) foto(s) selecionada(s)` :
                                                'Nenhuma nova foto escolhida'
                                            }
                                        </span>
                                    </div>

                                    {/* Exibição de novas fotos selecionadas */}
                                    {ambiente.fotos.length > 0 && (
                                        <div className="thumbnail-grid">
                                            {ambiente.fotos.map((foto, i) => (
                                                <div key={i} className="thumbnail-container">
                                                    <img
                                                        src={URL.createObjectURL(foto)}
                                                        alt={`Nova foto ${i + 1}`}
                                                        className="thumbnail"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="remove-thumbnail-btn"
                                                        onClick={() => removerFotoNova(index, i)}
                                                        disabled={isLoading}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removerAmbiente(index)}
                                        className="btn-step btn-remove-ambiente" // Use a classe específica para remover
                                        disabled={isLoading}
                                    >
                                        Remover Ambiente
                                    </button>
                                </div>
                            ))}

                            <div className="navigation-buttons" style={{ justifyContent: 'flex-start' }}>
                                <button type="button" className="btn-step" onClick={adicionarAmbiente} disabled={isLoading}>
                                    + Adicionar Novo Ambiente
                                </button>
                            </div>
                        </fieldset>

                        <div className="navigation-buttons">
                            <button type="submit" className="btn-step btn-next-step" disabled={isLoading}>
                                {isLoading ? 'Salvando Edição...' : 'Salvar Edição da Vistoria'}
                            </button>
                            {/* Opcional: Adicionar botão de cancelar vistoria aqui se for uma funcionalidade da página */}
                            {/* <button type="button" className="btn-step btn-remove-ambiente" onClick={handleCancelarVistoria} disabled={isLoading}>
                                Cancelar Vistoria
                            </button> */}
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default EditarVistoriaForm;