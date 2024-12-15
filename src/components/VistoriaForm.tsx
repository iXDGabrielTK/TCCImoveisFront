import React, { FormEvent, useState } from 'react';
import api from '../services/api';

interface VistoriaFormProps {
    onClose: () => void;
}

const VistoriaForm: React.FC<VistoriaFormProps> = ({ onClose }) => {
    const [laudo, setLaudo] = useState('');
    const [tipo, setTipo] = useState('');
    const [dataVistoria, setDataVistoria] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Token de autenticação não encontrado. Faça login novamente.');
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
            setIsError(false);
            setIsSuccess(false);

            await api.post('/vistorias', data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            setIsSuccess(true);
            onClose();
        } catch (error) {
            console.error('Erro ao cadastrar vistoria:', error);
            setIsError(true);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form className="form-step" onSubmit={handleSubmit}>
            <label>
                Laudo:
                <input type="text" value={laudo} onChange={(e) => setLaudo(e.target.value)}/>
            </label>
            <label>
                Tipo:
                <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)}/>
            </label>
            <label>
                Data:
                <input type="date" value={dataVistoria} onChange={(e) => setDataVistoria(e.target.value)}/>
            </label>
            <label>
                Rua:
                <input type="text" value={rua} onChange={(e) => setRua(e.target.value)}/>
            </label>
            <label>
                Número:
                <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)}/>
            </label>
            <label>
                Bairro:
                <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)}/>
            </label>
            <button type="submit" className="btn-submit-form" disabled={isPending}>Registrar</button>

            {isError && <p style={{color: 'red'}}>Erro ao registrar vistoria. Tente novamente.</p>}
            {isSuccess && <p style={{color: 'green'}}>Vistoria registrada com sucesso!</p>}
        </form>
    );
};

export default VistoriaForm;
