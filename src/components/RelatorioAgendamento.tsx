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
            console.log("Gerando novo relatório...");
            doc.text("pinto cu lixo", 10, 10);


            const colunas = ["ID do Imóvel", "Nome do Imóvel", "Quantidade de Agendamentos"];
            const linhas = dados.map((item) => [
                { content: item.idImovel.toString(), styles: { halign: "right" } },
                { content: item.nomeImovel, styles: { halign: "left" } },
                { content: item.quantidadeAgendamentos.toString(), styles: { halign: "right" } },
            ]);

            const table = doc.autoTable({
                startY: 20,
                head: [colunas],
                body: linhas,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            });

            const totalAgendamentos = dados.reduce((acc, item) => acc + item.quantidadeAgendamentos, 0);
            const finalY = (table as any).finalY;
            doc.text(`Total de Agendamentos no mês 2024-12: ${totalAgendamentos}`, 10, finalY + 10);

            doc.save("relatorio-agendamentos-2024-12.pdf");
        } catch (error) {
            console.error("Erro ao gerar o relatório:", error);
        }
    };

    return (
        <button onClick={gerarRelatorio}>Gerar Relatório de Agendamentos</button>
    );
};

export default RelatorioAgendamentos;
