import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface RelatorioAgendamento {
    idImovel: number;
    nomeImovel: string;
    quantidadeAgendamentos: number;
}

const RelatorioAgendamentos: React.FC = () => {
    const gerarRelatorio = async () => {
        try {
            const response = await axios.get<RelatorioAgendamento[]>(
                "http://localhost:8080/relatorios/agendamentos?mesAno=2024-11"
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o período solicitado.");
                return;
            }

            const doc = new jsPDF();
            doc.text("Relatório de Agendamentos - 2024-11", 10, 10);

            const colunas = ["ID do Imóvel", "Nome do Imóvel", "Quantidade de Agendamentos"];
            const linhas = dados.map((item) => [
                item.idImovel,
                item.nomeImovel,
                item.quantidadeAgendamentos,
            ]);

            doc.autoTable({ startY: 20, head: [colunas], body: linhas });
            doc.save("relatorio-agendamentos-2024-11.pdf");
        } catch (error) {
            console.error("Erro ao gerar o relatório:", error);
        }
    };

    return (
        <button onClick={gerarRelatorio}>Gerar Relatório de Agendamentos</button>
    );
};

export default RelatorioAgendamentos;
