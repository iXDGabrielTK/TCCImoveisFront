import React, { FormEvent, useState } from 'react';
import axios from 'axios'; // Para fazer a requisição à API
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

    const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEndereco((prevEndereco) => ({
            ...prevEndereco,
            [name]: value,
        }));
    };

    // Função para buscar o endereço na API ViaCEP
    const buscarCep = async () => {
        const cep = endereco.cep.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cep.length === 8) { // Verifica se o CEP tem 8 dígitos
            try {
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
                } else {
                    alert('CEP não encontrado. Verifique e tente novamente.');
                }
            } catch (error) {
                console.error('Erro ao buscar o CEP:', error);
                alert('Erro ao buscar o CEP. Tente novamente mais tarde.');
            }
        } else {
            alert('Digite um CEP válido com 8 dígitos.');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const fotosArray = imagem
            .split(',')
            .map((url) => url.trim())
            .filter((url) => url.startsWith('http'));

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
            await api.post('/imoveis', data);
            alert('Imóvel cadastrado com sucesso!');
            onClose();
        } catch (error) {
            console.error('Erro ao cadastrar imóvel:', error);
            alert('Erro ao cadastrar imóvel. Verifique os dados e tente novamente.');
        }
    };

    const nextStep = () => setStep((prevStep) => prevStep + 1);
    const prevStep = () => setStep((prevStep) => prevStep - 1);

    return (
        <form className="form-carousel" onSubmit={handleSubmit}>
            {step === 1 && (
                <div className="form-step">
                    <label>
                        Tipo:
                        <input
                            type="text"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Descrição:
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            required
                        />
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
                    <label>
                        Tamanho (m²):
                        <input
                            type="number"
                            value={tamanho}
                            onChange={(e) => setTamanho(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Preço:
                        <input
                            type="number"
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        URLs das Imagens (separadas por vírgula):
                        <input
                            type="text"
                            value={imagem}
                            onChange={(e) => setImagem(e.target.value)}
                            required
                        />
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
                    <label>
                        CEP:
                        <input
                            type="text"
                            name="cep"
                            value={endereco.cep}
                            onChange={handleEnderecoChange}
                            onBlur={buscarCep}
                            required
                        />
                    </label>
                    <label>
                        Estado:
                        <input
                            type="text"
                            name="estado"
                            value={endereco.estado}
                            onChange={handleEnderecoChange}
                            required
                        />
                    </label>
                    <label>
                        Cidade:
                        <input
                            type="text"
                            name="cidade"
                            value={endereco.cidade}
                            onChange={handleEnderecoChange}
                            required
                        />
                    </label>
                    <label>
                        Rua:
                        <input
                            type="text"
                            name="rua"
                            value={endereco.rua}
                            onChange={handleEnderecoChange}
                            required
                        />
                    </label>
                    <label>
                        Bairro:
                        <input
                            type="text"
                            name="bairro"
                            value={endereco.bairro}
                            onChange={handleEnderecoChange}
                            required
                        />
                    </label>
                    <label>
                        Número:
                        <input
                            type="text"
                            name="numero"
                            value={endereco.numero}
                            onChange={handleEnderecoChange}
                            required
                        />
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
                        >
                            Cadastrar Imóvel
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
};

export default CadastroImovelForm;
