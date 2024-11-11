
import React from 'react';
import '../styles/HomePage.css';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
    const imoveis = [
      { id: 1, imageUrl: 'url_da_imagem', descricaoImovel: 'Descrição 1', precoImovel: 1000 },
    ];

    return (
      <div className="home-page">
          <div className="imoveis-grid">
              {imoveis.map((imovel) => (
                  <div key={imovel.id} className="imovel-card">
                      <img src={imovel.imageUrl} alt={imovel.descricaoImovel} />
                      <h2>{imovel.descricaoImovel}</h2>
                      <p>Valor: R$ {imovel.precoImovel}</p>
                  </div>
              ))}
          </div>
          <Footer /> {/* Adiciona o Footer */}
      </div>
  );
};
  
  export default HomePage; 