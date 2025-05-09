import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AgendamentosPopUp from "./AgendamentoPopUp";
import PerfilPopup from "./PerfilPopup.tsx";
import { fetchAgendamentos, cancelarAgendamento, Agendamento } from "../services/agendamentoService.ts";

import "../styles/Navbar.css";
import logo from "../assets/logo.jpg";
import logoBemcoSVG from "../assets/Bemco.svg";
import SearchBar from "./SearchBar";
import { useAuth } from "../hooks/useAuth";

const Navbar: React.FC = () => {
    const [showAgendamentoPopup, setShowAgendamentoPopup] = useState(false);
    const [showPerfilPopup, setShowPerfilPopup] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout, hasRole } = useAuth();

    const isOnImoveisPage = location.pathname === "/imoveis";

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 600);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

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
            {isMobile ? (
                <>
                    <div className="left menu-button">
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
                                        {hasRole("funcionario") && !isOnImoveisPage && (
                                            <Link to="/imoveis">Imóveis</Link>
                                        )}
                                        <button
                                            onClick={async () => {
                                                await fetchUserAgendamentos();
                                                setShowAgendamentoPopup(true);
                                            }}
                                        >
                                            Agendamentos
                                        </button>
                                        <Link to="/financiamento">Simulador</Link>
                                        <button onClick={() => setShowPerfilPopup(true)}>Meu Perfil</button>
                                        <button onClick={handleLogout}>Logout</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="center" onClick={() => navigate("/home")}>
                        <img src={logoBemcoSVG} alt="Logo Bemco" className="logo-bemco-mobile" />
                    </div>

                    <div className="right">
                        <SearchBar />
                    </div>
                </>
            ) : (
                <>
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
                                            {hasRole("funcionario") && !isOnImoveisPage && (
                                                <Link to="/imoveis">Imóveis</Link>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    await fetchUserAgendamentos();
                                                    setShowAgendamentoPopup(true);
                                                }}
                                            >
                                                Agendamentos
                                            </button>
                                            <Link to="/financiamento">Simulador</Link>
                                            <button onClick={() => setShowPerfilPopup(true)}>Meu Perfil</button>
                                            <button onClick={handleLogout}>Logout</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

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
