// src/layouts/Navbar.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, getToken } from '../services/auth';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
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
        navigate('/login');
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
                            <button onClick={handleLogout}>Logout</button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
