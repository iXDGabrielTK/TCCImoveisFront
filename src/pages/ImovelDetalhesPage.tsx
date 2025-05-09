// ImovelDetalhesPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ImovelDetalhes from "../components/ImovelDetalhes";
import { Imovel } from "../types/Imovel";
import api from "../services/api";

const ImovelDetalhesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [imovel, setImovel] = useState<Imovel | null>(null);
    const [loading, setLoading] = useState(true);

    // 👇 Recebendo a origem da navegação anterior (ou default "padrao")
    const origem = location.state?.origem ?? "padrao";

    useEffect(() => {
        if (!id) return;

        const fetchImovelData = async () => {
            try {
                const response = await api.get<Imovel>(`/imoveis/${id}`);
                setImovel(response.data);
            } catch (error) {
                console.error("Erro ao buscar imóvel:", error);
                alert("Imóvel não encontrado.");
                navigate("/home");
            } finally {
                setLoading(false);
            }
        };

        fetchImovelData().catch(console.error);
    }, [id, navigate]);

    if (loading) return <p>Carregando...</p>;
    if (!imovel) return <p>Imóvel não encontrado.</p>;

    return (
        <div>
            {/* 👇 Passamos a origem para ImovelDetalhes */}
            <ImovelDetalhes imovel={imovel} origem={origem} />
        </div>
    );
};

export default ImovelDetalhesPage;
