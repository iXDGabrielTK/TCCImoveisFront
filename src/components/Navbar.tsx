import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AgendamentosPopUp from "./AgendamentoPopUp";
import PerfilPopup from "./PerfilPopup.tsx";
import { fetchAgendamentos, cancelarAgendamento, Agendamento } from "../services/agendamentoService.ts";
import "../styles/Navbar.css";
import logo from "../assets/logo.jpg";
import SearchBar from "./SearchBar";
import { useAuth } from "../hooks/useAuth";

const Navbar: React.FC = () => {
    const [showAgendamentoPopup, setShowAgendamentoPopup] = useState(false);
    const [showPerfilPopup, setShowPerfilPopup] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout, hasRole } = useAuth();

    const fetchUserAgendamentos = async () => {
        try {
            if (user?.id) {
                const data = await fetchAgendamentos(Number(user.id));
                setAgendamentos(data);
            }
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
        }
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="navbar">
            <div className="left">
                <span className="company-name" onClick={() => navigate("/home")}>
                    Bemco
                </span>
            </div>

            <div className="logo-container">
                <img src={logo} alt="logo" className="logo-image" />
            </div>

            <div className="right">
                <SearchBar />
                <div className="menu-button">
                    <div className="dropdown">
                        <button className="dropbtn">☰</button>
                        <div className="dropdown-content">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login">Login</Link>
                                    <Link to="/register">Cadastro</Link>
                                </>
                            ) : (
                                <>
                                    <button onClick={async () => {
                                        await fetchUserAgendamentos();
                                        setShowAgendamentoPopup(true);
                                    }}>Agendamentos</button>
                                    <button onClick={() => setShowPerfilPopup(true)}>Meu Perfil</button>
                                    {location.pathname === "/home" && hasRole('funcionario') && <Link to="/imoveis">Imóveis</Link>}
                                    <button onClick={handleLogout}>Logout</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showAgendamentoPopup && (
                <AgendamentosPopUp
                    agendamentos={agendamentos}
                    onClose={() => setShowAgendamentoPopup(false)}
                    onCancel={(id) => cancelarAgendamento(id)}
                />
            )}

            {showPerfilPopup && <PerfilPopup onClose={() => setShowPerfilPopup(false)} />}
        </nav>
    );
};

export default Navbar;
