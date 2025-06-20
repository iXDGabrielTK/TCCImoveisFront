import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AgendamentosPopUp from "./AgendamentoPopUp";
import PerfilPopup from "./PerfilPopup.tsx";
import { fetchAgendamentos, cancelarAgendamento, Agendamento } from "../services/agendamentoService.ts";
import { Collapse } from "@mui/material";
import "../styles/Navbar.css";
import logo from "../assets/logo.jpg";
import logoBemcoSVG from "../assets/Bemco.svg";
import SearchBar from "./SearchBar";
import { useAuth } from "../hooks/useAuth";
import NotificationDropdown from './NotificationDropdown';
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

const Navbar: React.FC = () => {
    const [showAgendamentoPopup, setShowAgendamentoPopup] = useState(false);
    const [showPerfilPopup, setShowPerfilPopup] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout, hasRole } = useAuth();

    const isOnImoveisPage = location.pathname === "/imoveis";
    const isOnDetalheImovel = location.pathname.startsWith('/imovel/');

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = document.activeElement?.tagName.toLowerCase();

            if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
                e.preventDefault();
                setShowSearchBar(true);
                setTimeout(() => {
                    document.getElementById('campo-busca')?.focus();
                }, 50); // pequena espera para garantir que o campo foi montado
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
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
                                            <Link to="/inbox">Inbox</Link>
                                            <Link to="/imobiliarias">Imobiliária</Link>
                                            <Link to="/financiamento">Financiamento</Link>
                                            <button onClick={() => setShowPerfilPopup(true)}>Meu Perfil</button>
                                            <button onClick={handleLogout}>Logout</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="center logo-wrapper">
                            <img
                                src={logoBemcoSVG}
                                alt="Logo Bemco"
                                className="logo-bemco-mobile"
                                aria-hidden="true"
                            />
                            <button className="logo-button" onClick={() => navigate("/home")} aria-label="Ir para página inicial" />
                        </div>

                        <div className="right">
                            <NotificationDropdown />
                            {!isOnDetalheImovel && (
                                <IconButton
                                    color="primary"
                                    onClick={() => setShowSearchBar(!showSearchBar)}
                                    aria-label="Abrir busca"
                                    sx={{
                                        color: 'white',
                                        p: 1,
                                        borderRadius: '8px',
                                        transition: 'background-color 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)', // toque leve e elegante
                                        },
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            )}
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
                            {!isOnDetalheImovel && (
                                <IconButton
                                    color="primary"
                                    onClick={() => setShowSearchBar(!showSearchBar)}
                                    aria-label="Abrir busca"
                                    sx={{
                                        color: 'white',
                                        p: 1,
                                        borderRadius: '40%',
                                        transition: 'background-color 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)', // toque leve e elegante
                                        },
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            )}

                            <NotificationDropdown />
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
                                                <Link to="/inbox">Inbox</Link>
                                                <Link to="/imobiliarias">Imobiliária</Link>
                                                <Link to="/financiamento">Financiamento</Link>
                                                <Link to="/home/favoritos">Favoritos</Link>
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
            <Collapse in={showSearchBar && !isOnDetalheImovel} timeout={300} unmountOnExit>
                <SearchBar />
            </Collapse>
        </>
    );
};

export default Navbar;
