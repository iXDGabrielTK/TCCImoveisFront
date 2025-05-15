import React from 'react';
import '../styles/LoadingText.css';

const LoadingText: React.FC = () => {
    return (
        <span className="loading-text">
      Carregando
      <span className="dots-bounce">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </span>
    </span>
    );
};

export default LoadingText;
