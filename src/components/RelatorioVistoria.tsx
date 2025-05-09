import React from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface RelatorioVistoria {
    idImovel: number;
    nomeImovel: string;
    dataVistoria: string;
    detalhes: string;
}

const RelatorioVistorias: React.FC = () => {
    const gerarRelatorio = async () => {
        try {
            const response = await api.get<RelatorioVistoria[]>(
                "/relatorios/vistorias?idImovel=1"
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o imóvel solicitado.");
                return;
            }

            const doc = new jsPDF();
            doc.text("Relatório de Vistorias - Imóvel ID 1", 10, 10);

            const colunas = ["ID do Imóvel", "Nome do Imóvel", "Data da Vistoria", "Detalhes"];
            const linhas = dados.map((item) => [
                item.idImovel.toString(),
                item.nomeImovel,
                item.dataVistoria,
                item.detalhes,
            ]);

            doc.autoTable({ startY: 20, head: [colunas], body: linhas });
            doc.save("relatorio-vistorias.pdf");
        } catch (error) {
            console.error("Erro ao gerar o relatório:", error);
        }
    };

    return (
        <button onClick={gerarRelatorio}>Gerar Relatório de Vistorias</button>
    );
};

export default RelatorioVistorias;
