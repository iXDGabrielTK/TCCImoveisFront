import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import ImoveisPage from './pages/ImoveisPage';
import LoginForm from './components/LoginForm';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import RelatorioPage from './pages/RelatorioPage';
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
import EditarImovelForm from './components/EditarImovelForm';
import 'leaflet/dist/leaflet.css';
import InboxNotifications from "./pages/InboxNotifications.tsx";
import FavoritosPage from "./pages/FavoritosPage.tsx";

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
                                        <PrivateRoute requiredRole={["funcionario", "corretor"]} >
                                            <ImoveisPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="inbox"
                                    element={
                                        <PrivateRoute>
                                            <InboxNotifications />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="imobiliarias"
                                    element={
                                        <PrivateRoute requiredRole={"corretor"}>
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
                                    path="/editar-imovel"
                                    element={
                                        <PrivateRoute>
                                            <EditarImovelForm />
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
                                    path="relatorios"
                                    element={
                                        <PrivateRoute requiredRole={"funcionario"}>
                                            <RelatorioPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route path="home" element={<PrivateRoute><HomePage /></PrivateRoute>}>
                                    <Route path="favoritos" element={
                                        <PrivateRoute>
                                            <FavoritosPage />
                                        </PrivateRoute>}
                                    />
                                </Route>
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
