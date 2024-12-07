import React, { FormEvent, useState } from 'react';
import api from '../services/api';

interface VistoriaFormProps {
    onClose: () => void;
}

const VistoriaForm: React.FC<VistoriaFormProps> = ({ onClose }) => {
    const [laudo, setLaudo] = useState('');
    const [dataVistoria, setDataVistoria] = useState('');
    const [imovelId, setImovelId] = useState(''); // Novo estado para ID do Imóvel
    const [endereco, setEndereco] = useState({
        rua: '',
        numero: '',
        complemento: '',
    });
    const [isPending, setIsPending] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEndereco((prevEndereco) => ({
            ...prevEndereco,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Certifique-se de que o token está sendo recuperado
        if (!token) {
            alert('Token de autenticação não encontrado. Faça login novamente.');
            return;
        }

        const data = {
            laudoVistoria: laudo,
            dataVistoria, // Ex.: "2024-12-07"
            endereco: {
                rua: endereco.rua,
                numero: endereco.numero,
                complemento: endereco.complemento,
            },
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
            onClose(); // Fecha o modal após sucesso
        } catch (error) {
            console.error('Erro ao cadastrar vistoria:', error);
            setIsError(true);
        } finally {
            setIsPending(false);
        }
    };




    return (
        <form className="form-step" onSubmit={handleSubmit}>
            <h2>Registrar Vistoria</h2>
            <label>
                ID do Imóvel:
                <input
                    type="text"
                    value={imovelId}
                    onChange={(e) => setImovelId(e.target.value)}
                    placeholder="Digite o ID do imóvel"
                    required
                />
            </label>
            <label>
                Laudo:
                <input type="text" value={laudo} onChange={(e) => setLaudo(e.target.value)} />
            </label>
            <label>
                Data:
                <input type="date" value={dataVistoria} onChange={(e) => setDataVistoria(e.target.value)} />
            </label>
            <label>
                Rua:
                <input type="text" name="rua" value={endereco.rua} onChange={handleEnderecoChange} />
            </label>
            <label>
                Número:
                <input type="text" name="numero" value={endereco.numero} onChange={handleEnderecoChange} />
            </label>
            <label>
                Complemento:
                <input type="text" name="complemento" value={endereco.complemento} onChange={handleEnderecoChange} />
            </label>
            <button type="submit" className="btn-submit-form" disabled={isPending}>Registrar</button>

            {isError && <p style={{ color: 'red' }}>Erro ao registrar vistoria. Tente novamente.</p>}
            {isSuccess && <p style={{ color: 'green' }}>Vistoria registrada com sucesso!</p>}
        </form>
    );
};

export default VistoriaForm;
