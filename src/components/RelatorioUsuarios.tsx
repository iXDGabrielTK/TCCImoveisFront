import React from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Define o tipo dos dados retornados pela API
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
            const response = await axios.get<RelatorioUsuario[]>(
                "http://localhost:8080/relatorios/usuarios?mesAno=2024-11"
            );
            const dados = response.data;

            // Verifica se há dados para o período solicitado
            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o período solicitado.");
                return;
            }

            // Cria o PDF
            const doc = new jsPDF();

            // Adiciona o título
            doc.setFontSize(16);
            doc.text("Relatório de Acessos de Usuários - 2024-11", 10, 10);

            // Configura a tabela
            const colunas = ["ID do Usuário", "Nome", "Quantidade de Acessos"];
            const linhas = dados.map((item) => [
                item.idUsuario,
                item.nomeUsuario,
                item.quantidadeAcessos,
            ]);

            doc.autoTable({
                startY: 20,
                head: [colunas],
                body: linhas,
            });

            // Adiciona o total de acessos
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
