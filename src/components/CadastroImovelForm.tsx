import React, { useState } from 'react';
import api from '../services/api';

const CadastroImovelForm = () => {
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [imagem, setImagem] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/imoveis', {
                descricaoImovel: descricao,
                precoImovel: preco,
                imageUrl: imagem,
            });
            alert('Imóvel cadastrado com sucesso!');
        } catch (error) {
            console.error('Erro ao cadastrar imóvel:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Descrição:
                <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </label>
            <label>
                Preço:
                <input type="number" value={preco} onChange={(e) => setPreco(e.target.value)} />
            </label>
            <label>
                URL da Imagem:
                <input type="text" value={imagem} onChange={(e) => setImagem(e.target.value)} />
            </label>
            <button type="submit">Cadastrar Imóvel</button>
        </form>
    );
};

export default CadastroImovelForm;
