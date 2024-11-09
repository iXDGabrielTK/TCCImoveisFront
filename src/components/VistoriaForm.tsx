import React, {FormEvent, useState} from 'react';
import api from '../services/api';

const VistoriaForm: React.FC = () => {
    const [laudo, setLaudo] = useState('');
    const [dataVistoria, setDataVistoria] = useState('');
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
        setEndereco(prevEndereco => ({
            ...prevEndereco,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log(endereco);
        const data = {
            laudoVistoria : laudo,
            dataVistoria: dataVistoria,
            endereco: endereco
        };

        try {
            setIsPending(true);
            setIsError(false);
            setIsSuccess(false);

            await api.post('/vistorias', data);
            setIsSuccess(true);
        } catch (error) {
            console.error('Erro ao cadastrar vistoria:', error);
        } finally {
        setIsPending(false);
    }
    };
    return (
        <form className="vistoria-form" onSubmit={handleSubmit}>
                <h2>Registrar Vistoria</h2>
                <label>Laudo:
                    <input type="text" value={laudo} onChange={(e) => setLaudo(e.target.value)}/>
                </label>
                <label>Data:
                    <input type="date" value={dataVistoria} onChange={(e) => setDataVistoria(e.target.value)}/>
                </label>
                <label>Rua:
                    <input type="text" name="rua" value={endereco.rua} onChange={handleEnderecoChange}/>
                </label>
                <label>Numero:
                    <input type="text" name="numero" value={endereco.numero} onChange={handleEnderecoChange}/>
                </label>
                <label>Complemento:
                    <input type="text" name="complemento" value={endereco.complemento} onChange={handleEnderecoChange}/>
                </label>
                <button type="submit" disabled={isPending}>Registrar</button>

                {isError && <p style={{ color: 'red' }}>Erro ao registrar vistoria. Tente novamente.</p>}
                {isSuccess && <p style={{ color: 'green' }}>Vistoria registrada com sucesso!</p>}
        </form>
    );
};

export default VistoriaForm;