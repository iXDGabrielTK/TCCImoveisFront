import React from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface RelatorioUsuario {
    idUsuario: number;
    nomeUsuario: string;
    quantidadeAcessos: number;
}

const RelatorioUsuarios: React.FC = () => {
    // Função para gerar o relatório
    const gerarRelatorio = async () => {
        try {
            // Faz a requisição para a API
            const response = await api.get<RelatorioUsuario[]>(
                "/relatorios/usuarios?mesAno=2024-11"
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o período solicitado.");
                return;
            }

            const doc = new jsPDF();

            doc.setFontSize(16);
            doc.text("Relatório de Acessos de Usuários - 2024-11", 10, 10);

            const colunas = ["ID do Usuário", "Nome", "Quantidade de Acessos"];
            const linhas = dados.map((item) => [
                item.idUsuario.toString(),
                item.nomeUsuario,
                item.quantidadeAcessos.toString(),
            ]);

            doc.autoTable({
                startY: 20,
                head: [colunas],
                body: linhas,
            });

            const totalAcessos = dados.reduce(
                (total, item) => total + item.quantidadeAcessos,
                0
            );
            doc.text(
                `Total de Acessos: ${totalAcessos}`,
                10,
                doc.previousAutoTable.finalY + 10
            );

            // Salva o PDF
            doc.save("relatorio-usuarios-2024-11.pdf");
        } catch (error) {
            console.error("Erro ao gerar o relatório:", error);
            alert("Erro ao gerar o relatório. Verifique o console para mais detalhes.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Gerar Relatório de Usuários</h1>
            <button
                onClick={gerarRelatorio}
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Gerar Relatório
            </button>
        </div>
    );
};

export default RelatorioUsuarios;
