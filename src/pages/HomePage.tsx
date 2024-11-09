// src/pages/HomePage.tsx
import React from 'react';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
    const imoveis = [
      { id: 1, imageUrl: 'url_da_imagem', descricaoImovel: 'Descrição 1', precoImovel: 1000 },
    ];
  
    return (
      <div className="home-page">
        <div className="navbar">
          <div className="logo-text">Nome Empresa</div>
          <div className="logo-container">
            <div className="logo-image"></div>
          </div>
          <button className="menu-button">Menu</button>
        </div>
        <div className="imoveis-grid">
          {imoveis.map((imovel) => (
            <div key={imovel.id} className="imovel-card">
              <img src={imovel.imageUrl} alt={imovel.descricaoImovel} />
              <h2>{imovel.descricaoImovel}</h2>
              <p>Valor: R$ {imovel.precoImovel}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default HomePage;