// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import ImoveisPage from "./pages/ImoveisPage.tsx";
{ /*import CadastroImovelForm from "./components/CadastroImovelForm.tsx";*/}
import LoginForm from "./components/LoginForm.tsx";
import CadastroImovelForm from "./components/CadastroImovelForm.tsx";
import VistoriaForm from "./components/VistoriaForm.tsx";
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} /> {/* Rota de Registro */}
          <Route path="/imoveis" element={<ImoveisPage />} />
          <Route path="/registerImoveis" element={<CadastroImovelForm onClose={function(): void {
                  throw new Error('Função não implementada.');
              } }/>} />
          <Route path="/vistoria" element={<VistoriaForm/>} />
          <Route path="/home" element={<HomePage />} />

      </Routes>
    </Router>
  );
};

export default App;
