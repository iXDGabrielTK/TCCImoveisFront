import React from "react";
import { useNavigate } from "react-router-dom";
import ImoveisGrid from "../components/ImoveisGrid";
import { Imovel } from "../types/Imovel";
import "../styles/HomePage.css";

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleOpenDetalhes = (imovel: Imovel) => {
        navigate(`/imovel/${imovel.idImovel}`);
    };

    return (
        <div className="home-page">
            <ImoveisGrid onImovelClick={handleOpenDetalhes} modo={"todos"} />
        </div>
    );
};

export default HomePage;