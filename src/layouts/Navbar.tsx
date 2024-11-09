// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <span className="company-name">Nome Empresa</span>
                <div className="logo"></div>
                <div className="menu-button">
                    <div className="dropdown">
                        <button className="dropbtn">☰</button>
                        <div className="dropdown-content">
                            <Link to="/login">Login</Link>
                            <Link to="/register">Cadastro</Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
