import React from "react";
import {Outlet, useNavigate} from "react-router-dom";
import ImoveisGrid from "../components/ImoveisGrid";
import { Imovel } from "../types/Imovel";
import "../styles/HomePage.css";

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleOpenDetalhes = (imovel: Imovel) => {
        navigate(`/imovel/${imovel.idImovel}`);
    };

    const estaNaHome = location.pathname === '/home';


    return (
        <div className="home-page">
            {estaNaHome && <ImoveisGrid onImovelClick={handleOpenDetalhes} modo={"todos"} />}
            <Outlet />
        </div>
    );
};

export default HomePage;