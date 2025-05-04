import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ImovelDetalhes from "../components/ImovelDetalhes";
import { Imovel } from "../types/Imovel";

const ImovelDetalhesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [imovel, setImovel] = useState<Imovel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImovel = async () => {
        try {
            const response = await fetch(`http://localhost:8080/imoveis/${id}`);
            console.log("Status da resposta:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Resposta de erro:", errorText);
                throw new Error("Imóvel não encontrado");
            }

            const data = await response.json();
            console.log("Dados do imóvel:", data);
            setImovel(data);
        } catch (err) {
            console.error("Erro no fetch:", err);
            alert("Imóvel não encontrado");
            navigate("/home");
        } finally {
            setLoading(false);
        }
    };


        fetchImovel();
    }, [id, navigate]);

    if (loading) return <p>Carregando...</p>;
    if (!imovel) return <p>Imóvel não encontrado.</p>;

    return <ImovelDetalhes imovel={imovel} />;
};

export default ImovelDetalhesPage;
