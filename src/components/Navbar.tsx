import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CancelamentoPopup from "./CancelamentoPupupProps.tsx";
import { logout, getToken } from "../services/auth";
import "../styles/Navbar.css";

const Navbar: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const checkLoginStatus = () => {
        const token = getToken();
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

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
                                    Cancelar Agendamentos
                                </button>
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {showPopup && (
                <CancelamentoPopup onClose={() => setShowPopup(false)} />
            )}
        </nav>
    );
};

export default Navbar;
