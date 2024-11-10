// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import ImoveisPage from './pages/ImoveisPage';
import LoginForm from './components/LoginForm';
import CadastroImovelForm from './components/CadastroImovelForm';
import VistoriaForm from './components/VistoriaForm';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route path="imoveis" element={<ImoveisPage />} />
                    <Route path="registerImoveis" element={<CadastroImovelForm onClose={() => {}} />} />
                    <Route path="vistoria" element={<VistoriaForm />} />
                    <Route path="home" element={<HomePage />} />
                </Route>
                <Route path="login" element={<LoginForm />} />
                <Route path="register" element={<Register />} />
            </Routes>
        </Router>
    );
};

export default App;
