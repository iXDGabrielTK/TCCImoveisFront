// src/layouts/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <span className="company-name">Bemco</span>
            <div className="logo-image"></div>
            <div className="menu-button">
                <div className="dropdown">
                    <button className="dropbtn">☰</button>
                    <div className="dropdown-content">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Cadastro</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
