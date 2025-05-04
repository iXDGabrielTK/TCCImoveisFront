import React, { FormEvent, useState } from 'react';
import api from '../services/api';
import '../styles/shared.css';
import { ApiError, getErrorMessage, isValidDate } from '../utils/errorHandling';
import { useToast } from '../context/ToastContext';

interface VistoriaFormProps {
    onClose: () => void;
}

const VistoriaForm: React.FC<VistoriaFormProps> = ({ onClose }) => {
    const { showToast } = useToast();
    const [laudo, setLaudo] = useState('');
    const [tipo, setTipo] = useState('');
    const [dataVistoria, setDataVistoria] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        laudo: '',
        tipo: '',
        dataVistoria: '',
        rua: '',
        numero: '',
        bairro: ''
    });

    // Validation functions
    const validateLaudo = (value: string) => {
        if (!value.trim()) {
            setFieldErrors(prev => ({ ...prev, laudo: 'Laudo é obrigatório' }));
            return false;
        } else if (value.trim().length < 10) {
            setFieldErrors(prev => ({ ...prev, laudo: 'Laudo deve ter pelo menos 10 caracteres' }));
            return false;
        } else {
            setFieldErrors(prev => ({ ...prev, laudo: '' }));
            return true;
        }
    };

    const validateTipo = (value: string) => {
        if (!value.trim()) {
            setFieldErrors(prev => ({ ...prev, tipo: 'Tipo é obrigatório' }));
            return false;
        } else if (!['Inicial', 'Periódica', 'Final'].includes(value.trim())) {
            setFieldErrors(prev => ({ ...prev, tipo: 'Tipo deve ser Inicial, Periódica ou Final' }));
            return false;
        } else {
            setFieldErrors(prev => ({ ...prev, tipo: '' }));
            return true;
        }
    };

    const validateData = (value: string) => {
        if (!value.trim()) {
            setFieldErrors(prev => ({ ...prev, dataVistoria: 'Data é obrigatória' }));
            return false;
        } else if (!isValidDate(value)) {
            setFieldErrors(prev => ({ ...prev, dataVistoria: 'Data inválida' }));
            return false;
        } else {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                setFieldErrors(prev => ({ ...prev, dataVistoria: 'A data não pode ser no passado' }));
                return false;
            } else {
                setFieldErrors(prev => ({ ...prev, dataVistoria: '' }));
                return true;
            }
        }
    };

    const validateEndereco = (field: string, value: string) => {
        if (!value.trim()) {
            setFieldErrors(prev => ({ 
                ...prev, 
                [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório` 
            }));
            return false;
        } else {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
            return true;
        }
    };


    const validateAllFields = () => {
        const isValidLaudo = validateLaudo(laudo);
        const isValidTipo = validateTipo(tipo);
        const isValidData = validateData(dataVistoria);
        const isValidRua = validateEndereco('rua', rua);
        const isValidNumero = validateEndereco('numero', numero);
        const isValidBairro = validateEndereco('bairro', bairro);

        return isValidLaudo && isValidTipo && isValidData && 
               isValidRua && isValidNumero && isValidBairro;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validate all fields before submission
        if (!validateAllFields()) {
            showToast('Por favor, corrija os erros no formulário antes de enviar.', 'error');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Token de autenticação não encontrado. Faça login novamente.', 'error');
            return;
        }

        const usuarioId = localStorage.getItem('usuarioId');

        const data = {
            laudoVistoria: laudo,
            tipoVistoria: tipo,
            dataVistoria,
            usuarioId,
            rua,
            numero,
            bairro,
        };

        try {
            setIsPending(true);

            await api.post('/vistorias', data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            showToast('Vistoria registrada com sucesso!', 'success');
            setTimeout(() => {
                onClose();
            }, 2000); // Fecha o formulário após 2 segundos
        } catch (error: unknown) {
            console.error('Erro ao cadastrar vistoria:', error);
            const apiError = error as ApiError;
            showToast(getErrorMessage(apiError), 'error');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form className="form-step" onSubmit={handleSubmit}>
            <label className="input-required">
                Laudo:
                <input 
                    type="text" 
                    value={laudo} 
                    onChange={(e) => {
                        setLaudo(e.target.value);
                        validateLaudo(e.target.value);
                    }}
                    className={fieldErrors.laudo ? "input-error" : ""}
                />
                {fieldErrors.laudo && <span className="field-error-message">{fieldErrors.laudo}</span>}
            </label>
            <label className="input-required">
                Tipo (Inicial, Periódica ou Final):
                <input 
                    type="text" 
                    value={tipo} 
                    onChange={(e) => {
                        setTipo(e.target.value);
                        validateTipo(e.target.value);
                    }}
                    className={fieldErrors.tipo ? "input-error" : ""}
                />
                {fieldErrors.tipo && <span className="field-error-message">{fieldErrors.tipo}</span>}
            </label>
            <label className="input-required">
                Data:
                <input 
                    type="date" 
                    value={dataVistoria} 
                    onChange={(e) => {
                        setDataVistoria(e.target.value);
                        validateData(e.target.value);
                    }}
                    className={fieldErrors.dataVistoria ? "input-error" : ""}
                />
                {fieldErrors.dataVistoria && <span className="field-error-message">{fieldErrors.dataVistoria}</span>}
            </label>
            <label className="input-required">
                Rua:
                <input 
                    type="text" 
                    value={rua} 
                    onChange={(e) => {
                        setRua(e.target.value);
                        validateEndereco('rua', e.target.value);
                    }}
                    className={fieldErrors.rua ? "input-error" : ""}
                />
                {fieldErrors.rua && <span className="field-error-message">{fieldErrors.rua}</span>}
            </label>
            <label className="input-required">
                Número:
                <input 
                    type="text" 
                    value={numero} 
                    onChange={(e) => {
                        setNumero(e.target.value);
                        validateEndereco('numero', e.target.value);
                    }}
                    className={fieldErrors.numero ? "input-error" : ""}
                />
                {fieldErrors.numero && <span className="field-error-message">{fieldErrors.numero}</span>}
            </label>
            <label className="input-required">
                Bairro:
                <input 
                    type="text" 
                    value={bairro} 
                    onChange={(e) => {
                        setBairro(e.target.value);
                        validateEndereco('bairro', e.target.value);
                    }}
                    className={fieldErrors.bairro ? "input-error" : ""}
                />
                {fieldErrors.bairro && <span className="field-error-message">{fieldErrors.bairro}</span>}
            </label>
            <button type="submit" className="btn-submit-form" disabled={isPending}>
                {isPending ? "Registrando..." : "Registrar"}
            </button>
        </form>
    );
};

export default VistoriaForm;
