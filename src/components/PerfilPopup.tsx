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
                const userId = localStorage.getItem("usuarioId");
                if (!userId) {
                    throw new Error("ID do usuário não encontrado no localStorage.");
                }

                const response = await api.get(`/usuarios/${userId}`);
                setUser(response.data);
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
                    tipo: user.tipo_usuario || "visitante",
                    nome: user.nome,
                    telefone: user.telefone,
                    login: user.login,
                    senha: user.senha,
                };

                const response = await api.put(`/usuarios/${user.id}`, payload);
                console.log("Alterações salvas com sucesso:", response.data);
                onClose();
            }
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            alert("Erro ao salvar alterações. Por favor, tente novamente.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
            try {
                if (user) {
                    await api.delete(`/usuarios/${user.id}`);
                    alert("Conta excluída com sucesso.");
                    localStorage.removeItem("usuarioId"); // Remove o ID do usuário do localStorage
                    onClose(); // Fecha o popup
                    // Opcional: Redirecionar o usuário para a página de login
                }
            } catch (error) {
                console.error("Erro ao excluir conta:", error);
                alert("Erro ao excluir conta. Por favor, tente novamente.");
            }
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
                                placeholder={user.nome}
                                value={user.nome}
                                onChange={(e) => handleInputChange(e, "nome")}
                            />
                        </label>
                        <label>
                            Telefone:
                            <input
                                type="text"
                                placeholder={user.telefone}
                                value={user.telefone}
                                onChange={(e) => handleInputChange(e, "telefone")}
                            />
                        </label>
                        <label>
                            Login:
                            <input
                                type="text"
                                placeholder={user.login}
                                value={user.login}
                                onChange={(e) => handleInputChange(e, "login")}
                            />
                        </label>
                        <label>
                            Senha:
                            <input
                                type="password"
                                placeholder="Digite uma nova senha (opcional)"
                                value={user.senha}
                                onChange={(e) => handleInputChange(e, "senha")}
                            />
                        </label>
                        <button className="botao-submit" onClick={handleSave}>Salvar Alterações</button>
                        <button className="botao-excluir" onClick={handleDelete}>Excluir Conta</button>
                    </>
                ) : (
                    <p>Erro ao carregar dados do usuário.</p>
                )}
            </div>
        </div>
    );
};

export default PerfilPopup;
