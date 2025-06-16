import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import ImoveisPage from './pages/ImoveisPage';
import LoginForm from './components/LoginForm';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import RelatorioUsuarios from './components/RelatorioUsuarios';
import RelatorioAgendamentos from './components/RelatorioAgendamento';
import RelatorioVistorias from './components/RelatorioVistoria';
import ImovelDetalhesPage from './pages/ImovelDetalhesPage';
import CalculadoraFinanciamento from "./components/CalculadoraFinanciamento.tsx";
import ImobiliariaPage from "./pages/ImobiliariaPage.tsx";
import ImoveisFiltradosPage from './pages/ImoveisFiltradosValorPage';
import ToastProvider from './context/ToastProvider';
import { AuthProvider } from './context/AuthContext';
import { ImoveisProvider } from './context/ImoveisContext.tsx';
import CadastroImovelForm from './components/CadastroImovelForm';
import CadastroVistoriaForm from './components/CadastroVistoriaForm';
import EditarVistoriaForm from './components/EditarVistoriaForm';
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
    return (
        <ToastProvider>
            <Router>
                <ImoveisProvider>
                    <AuthProvider>
                        <Routes>
                            <Route path="/" element={<MainLayout />}>
                                <Route
                                    path="/imoveis-filtrados"
                                    element={
                                        <PrivateRoute>
                                            <ImoveisFiltradosPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="financiamento"
                                    element={
                                        <PrivateRoute>
                                            <CalculadoraFinanciamento />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="imoveis"
                                    element={
                                        <PrivateRoute requiredRole="funcionario">
                                            <ImoveisPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="imobiliarias"
                                    element={
                                        <PrivateRoute>
                                            <ImobiliariaPage />
                                        </PrivateRoute>
                                    }
                                />

                                <Route
                                    path="/cadastro-imovel"
                                    element={
                                        <PrivateRoute>
                                            <CadastroImovelForm/>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/cadastro-vistoria"
                                    element={
                                    <PrivateRoute>
                                        <CadastroVistoriaForm />
                                    </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/editar-vistoria"
                                    element={
                                        <PrivateRoute>
                                            <EditarVistoriaForm />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="imovel/:id"
                                    element={
                                        <PrivateRoute>
                                            <ImovelDetalhesPage />
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
                                    path="home"
                                    element={
                                        <PrivateRoute>
                                            <HomePage />
                                        </PrivateRoute>
                                    }
                                />
                            </Route>
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<Register />} />
                        </Routes>
                    </AuthProvider>
                </ImoveisProvider>
            </Router>
        </ToastProvider>
    );
};

export default App;
