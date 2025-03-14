import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AgendamentosPopUp from "./AgendamentoPopUp";
import PerfilPopup from "./PerfilPopup.tsx";
import { logout, getToken } from "../services/auth";
import { fetchAgendamentos, cancelarAgendamento, Agendamento } from "../services/agendamentoService.ts";
import "../styles/Navbar.css";
import logo from "../assets/logo.jpg";
import SearchBar from "./SearchBar";

const Navbar: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isFuncionario, setIsFuncionario] = useState<boolean>(false);
    const [showAgendamentoPopup, setShowAgendamentoPopup] = useState(false);
    const [showPerfilPopup, setShowPerfilPopup] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = getToken();
        setIsLoggedIn(!!token);
        setIsFuncionario(localStorage.getItem("tipoUsuario") === "funcionario");
    }, []);

    const fetchUserAgendamentos = async () => {
        try {
            const usuarioId = localStorage.getItem("usuarioId");
            const data = await fetchAgendamentos(usuarioId ? Number(usuarioId) : 0);
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
                            {!isLoggedIn ? (
                                <>
                                    <Link to="/login">Login</Link>
                                    <Link to="/register">Cadastro</Link>
                                </>
                            ) : (
                                <>
                                    <button onClick={fetchUserAgendamentos}>Agendamentos</button>
                                    <button onClick={() => setShowPerfilPopup(true)}>Meu Perfil</button>
                                    {location.pathname === "/home" && isFuncionario && <Link to="/imoveis">Imóveis</Link>}
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
