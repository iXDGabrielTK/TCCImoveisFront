import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/EditarImovel.css';

interface Imovel {
    idImovel: string;
    tipoImovel: string;
    descricaoImovel: string;
    statusImovel: boolean;
    tamanhoImovel: number;
    precoImovel: number;
}

interface EditarImovelModalProps {
    isOpen: boolean; // Controla a visibilidade do modal
    onClose: () => void; // Fecha o modal
}

const EditarImovelModal: React.FC<EditarImovelModalProps> = ({ isOpen, onClose }) => {
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
    const [formData, setFormData] = useState<Partial<Imovel>>({});

    useEffect(() => {
        if (isOpen) {
            axios
                .get('/imoveis')
                .then((response) => {
                    if (Array.isArray(response.data)) {
                        setImoveis(response.data);
                    } else {
                        console.error('A resposta não é um array:', response.data);
                        setImoveis([]);
                    }
                })
                .catch((error) => {
                    console.error('Erro ao carregar imóveis:', error);
                    setImoveis([]);
                });
        }
    }, [isOpen]);

    const handleImovelChange = (id: string) => {
        const imovel = imoveis.find((i) => i.idImovel === id);
        setSelectedImovel(imovel || null);
        setFormData(imovel || {});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (selectedImovel) {
            axios
                .put(`/imoveis/${selectedImovel.idImovel}`, formData)
                .then(() => {
                    alert('Imóvel atualizado com sucesso!');
                    onClose();
                })
                .catch((error) => console.error('Erro ao salvar imóvel:', error));
        }
    };

    if (!isOpen) return null; // Retorna null quando o modal não está aberto

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Editar Imóvel</h2>
                <button className="close-button" onClick={onClose}>
                    Fechar
                </button>
                <label>Selecione o imóvel:</label>
                <select onChange={(e) => handleImovelChange(e.target.value)}>
                    <option value="">Selecione...</option>
                    {Array.isArray(imoveis) &&
                        imoveis.map((imovel) => (
                            <option key={imovel.idImovel} value={imovel.idImovel}>
                                {imovel.descricaoImovel} - {imovel.tipoImovel}
                            </option>
                        ))}
                </select>
                {selectedImovel && (
                    <>
                        <label>Tipo do Imóvel:</label>
                        <input
                            type="text"
                            name="tipoImovel"
                            value={formData.tipoImovel || ''}
                            onChange={handleInputChange}
                        />
                        <label>Descrição:</label>
                        <input
                            type="text"
                            name="descricaoImovel"
                            value={formData.descricaoImovel || ''}
                            onChange={handleInputChange}
                        />
                        <label>Status:</label>
                        <select
                            name="statusImovel"
                            value={formData.statusImovel ? 'Ativo' : 'Inativo'}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    statusImovel: e.target.value === 'Ativo',
                                }))
                            }
                        >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                        <label>Tamanho:</label>
                        <input
                            type="number"
                            name="tamanhoImovel"
                            value={formData.tamanhoImovel || ''}
                            onChange={handleInputChange}
                        />
                        <label>Preço:</label>
                        <input
                            type="number"
                            name="precoImovel"
                            value={formData.precoImovel || ''}
                            onChange={handleInputChange}
                        />
                        <div className="modal-actions">
                            <button className="save-button" onClick={handleSave}>
                                Salvar
                            </button>
                            <button className="cancel-button" onClick={onClose}>
                                Cancelar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditarImovelModal;
