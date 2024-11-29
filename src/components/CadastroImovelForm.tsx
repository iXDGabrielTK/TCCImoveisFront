import React, { FormEvent, useState } from 'react';
import api from '../services/api';
import '../styles/CadastroImovel.css';

interface CadastroImovelFormProps {
    onClose: () => void;
}

const CadastroImovelForm: React.FC<CadastroImovelFormProps> = ({ onClose }) => {
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
    const [funcionarioLogin, setFuncionarioLogin] = useState('');

    const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEndereco((prevEndereco) => ({
            ...prevEndereco,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const data = {
            tipoImovel: tipo,
            descricaoImovel: descricao,
            statusImovel: status,
            tamanhoImovel: parseFloat(tamanho),
            precoImovel: parseFloat(preco),
            urlFoto: imagem,
            enderecoImovel: endereco,
            historicoManutencao,
            funcionario: { login: funcionarioLogin },
        };

        try {
            await api.post('/imoveis', data);
            onClose();
        } catch (error) {
            console.error('Erro ao cadastrar imóvel:', error);
        }
    };

    const nextStep = () => setStep((prevStep) => prevStep + 1);
    const prevStep = () => setStep((prevStep) => prevStep - 1);

    return (
        <form className="form-carousel" onSubmit={handleSubmit}>
            {step === 1 && (
                <div className="form-step">
                    <label>Tipo:
                        <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} />
                    </label>
                    <label>Descrição:
                        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                    </label>
                    <label>Status:
                        <select value={status ? "Desocupado" : "Ocupado"}
                                onChange={(e) => setStatus(e.target.value === "Desocupado")} required>
                            <option value="Desocupado">Desocupado</option>
                            <option value="Ocupado">Ocupado</option>
                        </select>
                    </label>
                    <label>Tamanho (m²):
                        <input type="number" value={tamanho} onChange={(e) => setTamanho(e.target.value)} />
                    </label>
                    <label>Preço:
                        <input type="number" value={preco} onChange={(e) => setPreco(e.target.value)} />
                    </label>
                    <label>URL da Imagem:
                        <input type="text" value={imagem} onChange={(e) => setImagem(e.target.value)} />
                    </label>
                    <label>Histórico de Manutenção:
                        <textarea value={historicoManutencao} onChange={(e) => setHistoricoManutencao(e.target.value)} />
                    </label>
                    <label>Funcionário Responsável (Login):
                        <input type="text" value={funcionarioLogin} onChange={(e) => setFuncionarioLogin(e.target.value)} />
                    </label>
                    <button type="button" className="btn-next-step" onClick={nextStep} name="nextStepButton" id="nextStepButton">
                        Próximo ➔
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="form-step">
                    <label>Rua:
                        <input type="text" name="rua" value={endereco.rua} onChange={handleEnderecoChange} />
                    </label>
                    <label>Número:
                        <input type="text" name="numero" value={endereco.numero} onChange={handleEnderecoChange} />
                    </label>
                    <label>Complemento:
                        <input type="text" name="complemento" value={endereco.complemento} onChange={handleEnderecoChange} />
                    </label>
                    <label>Bairro:
                        <input type="text" name="bairro" value={endereco.bairro} onChange={handleEnderecoChange} />
                    </label>
                    <label>Cidade:
                        <input type="text" name="cidade" value={endereco.cidade} onChange={handleEnderecoChange} />
                    </label>
                    <label>Estado:
                        <input type="text" name="estado" value={endereco.estado} onChange={handleEnderecoChange} />
                    </label>
                    <label>CEP:
                        <input type="text" name="cep" value={endereco.cep} onChange={handleEnderecoChange} />
                    </label>
                    <div className="navigation-buttons">
                        <button type="button" className="btn-prev-step" onClick={prevStep} name="prevStepButton" id="prevStepButton">
                            ⬅ Voltar
                        </button>
                        <button type="submit" className="btn-submit-form" name="submitButton" id="submitButton">
                        Cadastrar Imóvel
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
};

export default CadastroImovelForm;
