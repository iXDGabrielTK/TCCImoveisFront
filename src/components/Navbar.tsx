import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Importar useLocation
import AgendamentosPopUp from "./AgendamentoPopUp";
import PerfilPopup from "./PerfilPopup.tsx"; // Importação do componente PerfilPopup
import { logout, getToken } from "../services/auth";
import { fetchAgendamentos, cancelarAgendamento, Agendamento } from "../services/agendamentoService.ts";
import "../styles/Navbar.css";

const Navbar: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isFuncionario, setIsFuncionario] = useState<boolean>(false);
    const [showAgendamentoPopup, setShowAgendamentoPopup] = useState(false);
    const [showPerfilPopup, setShowPerfilPopup] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const navigate = useNavigate();
    const location = useLocation(); // Obter a localização atual

    const checkLoginStatus = () => {
        const token = getToken();
        setIsLoggedIn(!!token);

        // Verifica o tipo do usuário
        const tipoUsuario = localStorage.getItem("tipoUsuario");
        setIsFuncionario(tipoUsuario === "funcionario");
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const fetchUserAgendamentos = async () => {
        try {
            const usuarioId = 1; // Substitua pelo ID real do usuário logado
            const data = await fetchAgendamentos(usuarioId);
            setAgendamentos(data);
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
        }
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        navigate("/login");
    };

    const handleCancel = async (id: number) => {
        try {
            await cancelarAgendamento(id); // Cancela no back-end
            setAgendamentos((prev) =>
                prev.map((agendamento) =>
                    agendamento.id === id ? { ...agendamento, cancelado: true } : agendamento
                )
            );
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
        }
    };

    const openAgendamentoPopup = () => {
        fetchUserAgendamentos(); // Busca os agendamentos ao abrir o pop-up
        setShowAgendamentoPopup(true);
    };

    const openPerfilPopup = () => {
        setShowPerfilPopup(true); // Abre o pop-up de perfil
    };

    const redirectToHome = () => {
        navigate("/home"); // Redireciona para a página inicial
    };


    return (
        <nav className="navbar">
            <span className="company-name" onClick={redirectToHome} style={{ cursor: "pointer" }}>
                Bemco
            </span>
            <div className="logo-image"></div>
            <div className="menu-button">
                <div className="dropdown">
                    <button className="dropbtn">☰</button>
                    <div className="dropdown-content">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login">Login</Link>
                                <Link to="/register">Cadastro</Link>
                            </>
                        ) : (
                            <>
                                <button onClick={openAgendamentoPopup}>Agendamentos</button>
                                <button onClick={openPerfilPopup}>Meu Perfil</button>
                                {location.pathname === "/home" && isFuncionario && ( // Exibir apenas na página /home e para funcionários
                                    <Link to="/imoveis">Imóveis</Link>
                                )}
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {showAgendamentoPopup && (
                <AgendamentosPopUp
                    agendamentos={agendamentos}
                    onClose={() => setShowAgendamentoPopup(false)}
                    onCancel={handleCancel}
                />
            )}
            {showPerfilPopup && (
                <PerfilPopup onClose={() => setShowPerfilPopup(false)} />
            )}
        </nav>
    );
};

export default Navbar;
