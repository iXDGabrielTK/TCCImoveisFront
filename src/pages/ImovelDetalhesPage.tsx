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
        if (!id) return;

        const fetchImovelData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/imoveis/${id}`);
                if (!response.ok) {
                    console.error("Erro ao buscar imóvel");
                    alert("Imóvel não encontrado.");
                    navigate("/home");
                    return;
                }

                const data: Imovel = await response.json();
                setImovel(data);
            } catch (error) {
                console.error("Erro ao buscar imóvel:", error);
                alert("Imóvel não encontrado.");
                navigate("/home");
            } finally {
                setLoading(false);
            }
        };

        // Evita aviso de Promise ignorada
        fetchImovelData().catch(console.error);
    }, [id, navigate]);

    if (loading) return <p>Carregando...</p>;
    if (!imovel) return <p>Imóvel não encontrado.</p>;

    return (
        <div>
            <ImovelDetalhes imovel={imovel} />
        </div>
    );
};

export default ImovelDetalhesPage;
