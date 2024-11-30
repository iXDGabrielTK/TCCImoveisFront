// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import ImoveisPage from './pages/ImoveisPage';
import LoginForm from './components/LoginForm';
import CadastroImovelForm from './components/CadastroImovelForm';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from "./components/PrivateRoute.tsx";
import AgendamentoPopUp from "./components/AgendamentoPopUp.tsx";
const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route path="imoveis" element={<ImoveisPage />} />
                    <Route path="agenda" element={<AgendamentoPopUp />} />
                    <Route path="registerImoveis" element={<CadastroImovelForm onClose={() => {}} />} />

                    <Route
                        path="/home"
                        element={
                            <PrivateRoute>
                                <HomePage />
                            </PrivateRoute>
                        }
                    />
                </Route>
                <Route path="login" element={<LoginForm />} />
                <Route path="register" element={<Register />} />
            </Routes>
        </Router>
    );
};

export default App;
