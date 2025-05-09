// ImoveisFiltradosValorPage.tsx
import { useSearchParams, useLocation } from "react-router-dom";
import ImoveisGrid from "../components/ImoveisGrid";
import React from "react";

const ImoveisFiltradosValorPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const valorParam = searchParams.get("valorMaximo");
    const valorMaximo = valorParam ? parseFloat(valorParam) : undefined;

    // 👇 Pegamos a origem do state da navegação
    const origem = location.state?.origem ?? "padrao";

    if (!valorMaximo || isNaN(valorMaximo)) {
        return <p style={{ textAlign: "center", padding: 20 }}>Valor inválido para filtragem.</p>;
    }

    return (
        <div style={{ padding: 24 }}>
            <h2>Imóveis compatíveis com seu poder de compra</h2>
            {/* 👇 Passamos a origem para o componente de grid */}
            <ImoveisGrid modo="filtrados" valorMaximo={valorMaximo} origem={origem} />
        </div>
    );
};

export default ImoveisFiltradosValorPage;
