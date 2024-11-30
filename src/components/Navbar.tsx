import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CancelamentoPopup from "./AgendamentoPopUp.tsx";
import { logout, getToken } from "../services/auth";
import { fetchAgendamentos, cancelarAgendamento } from "../services/agendamentoService";
import "../styles/Navbar.css";

interface Agendamento {
    id: number;
    descricao: string;
    ativo: boolean;
    cancelado: boolean;
}

const Navbar: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            const usuarioId = 1;
            fetchAgendamentos(usuarioId)
                .then((data) => setAgendamentos(data))
                .catch((err) => console.error(err));
        }
    }, [isLoggedIn]);

    const checkLoginStatus = () => {
        const token = getToken();
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const handleCancel = (id: number) => {
        cancelarAgendamento(id)
            .then(() => {
                setAgendamentos((prev) =>
                    prev.map((agendamento) =>
                        agendamento.id === id ? { ...agendamento, cancelado: true } : agendamento
                    )
                );
            })
            .catch((err) => console.error(err));
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <span className="company-name">Bemco</span>
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
                                <button onClick={() => setShowPopup(true)}>
                                    Agendamentos
                                </button>
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {showPopup && (
                <CancelamentoPopup
                    agendamentos={agendamentos || []} // Garante que seja um array
                    onClose={() => setShowPopup(false)}
                    onCancel={handleCancel}
                />
            )}
        </nav>
    );
};

export default Navbar;
