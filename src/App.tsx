import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import ImoveisPage from './pages/ImoveisPage';
import LoginForm from './components/LoginForm';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from "./components/PrivateRoute.tsx";
import RelatorioUsuarios from "./components/RelatorioUsuarios";
import RelatorioAgendamentos from "./components/RelatorioAgendamento.tsx";
import RelatorioVistorias from "./components/RelatorioVistoria.tsx";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route
                        path="imoveis"
                        element={
                            <PrivateRoute requiredRole="funcionario">
                                <ImoveisPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="relatorio-usuarios"
                        element={
                            <PrivateRoute>
                                <RelatorioUsuarios />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="relatorio-agendamentos"
                        element={
                            <PrivateRoute>
                                <RelatorioAgendamentos />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="relatorio-vistorias"
                        element={
                            <PrivateRoute>
                                <RelatorioVistorias />
                            </PrivateRoute>
                        }
                    />
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
