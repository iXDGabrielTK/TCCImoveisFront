
import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-section">
                <h4>Contato</h4>
                <p>Email: contato@exemplo.com</p>
                <p>Telefone: (11) 1234-5678</p>
            </div>
            <div className="footer-section">
                <h4>Sobre Nós</h4>
                <p>Somos uma empresa dedicada a ajudar você a encontrar o imóvel dos seus sonhos!</p>
            </div>
            <div className="footer-section">
                <h4>Siga-nos</h4>
                <div className="social-icons">
                    <a href="#">Instagram</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
