import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/PerfilPopup.css";

interface UserProfile {
    id: number;
    nome: string;
    login: string;
    senha: string;
    telefone: string;
    tipo_usuario: string;
}

interface PerfilPopupProps {
    onClose: () => void;
}

const PerfilPopup: React.FC<PerfilPopupProps> = ({ onClose }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                // Obtém o ID do usuário do localStorage
                const userId = localStorage.getItem("usuarioId");
                if (!userId) {
                    throw new Error("ID do usuário não encontrado no localStorage.");
                }

                // Faz a requisição ao back-end para buscar os dados do usuário pelo ID
                const response = await api.get(`/usuarios/${userId}`);
                setUser(response.data); // Define os dados do usuário no estado
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
                alert("Erro ao carregar dados do usuário. Por favor, tente novamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserProfile) => {
        const value = e.target.value;
        setUser((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const handleSave = async () => {
        try {
            if (user) {
                const payload = {
                    tipo: user.tipo_usuario || "visitante", // Adicione o tipo ao payload
                    nome: user.nome,
                    telefone: user.telefone,
                    login: user.login,
                    senha: user.senha, // Apenas envie a senha se ela foi alterada
                };

                console.log("Payload enviado:", payload);

                const response = await api.put(`/usuarios/${user.id}`, payload);
                console.log("Alterações salvas com sucesso:", response.data);
                onClose();
            }
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            alert("Erro ao salvar alterações. Por favor, tente novamente.");
        }
    };

    return (
        <div className="perfil-popup">
            <div className="perfil-popup-content">
                <button onClick={onClose} className="close-button">Fechar</button>
                {loading ? (
                    <p>Carregando...</p>
                ) : user ? (
                    <>
                        <h2>Meu Perfil</h2>
                        <label>
                            Nome:
                            <input
                                type="text"
                                placeholder={user.nome} // Placeholder com valor inicial
                                value={user.nome} // Mostra o valor atual
                                onChange={(e) => handleInputChange(e, "nome")} // Atualiza o estado ao digitar
                            />
                        </label>
                        <label>
                            Telefone:
                            <input
                                type="text"
                                placeholder={user.telefone} // Placeholder com valor inicial
                                value={user.telefone} // Mostra o valor atual
                                onChange={(e) => handleInputChange(e, "telefone")} // Atualiza o estado ao digitar
                            />
                        </label>
                        <label>
                            Login:
                            <input
                                type="text"
                                placeholder={user.login} // Placeholder com valor inicial
                                value={user.login} // Mostra o valor atual
                                onChange={(e) => handleInputChange(e, "login")} // Atualiza o estado ao digitar
                            />
                        </label>
                        <label>
                            Senha:
                            <input
                                type="password"
                                placeholder="Digite uma nova senha (opcional)"
                                value={user.senha} // Senha será alterada apenas se o campo for preenchido
                                onChange={(e) => handleInputChange(e, "senha")} // Atualiza o estado ao digitar
                            />
                        </label>
                        <button className='botao-submit' onClick={handleSave}>Salvar Alterações</button>
                    </>
                ) : (
                    <p>Erro ao carregar dados do usuário.</p>
                )}
            </div>
        </div>
    );
};

export default PerfilPopup;
