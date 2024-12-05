import React from "react";
import "../styles/RelatorioModal.css";
import { Button, Stack, MenuItem, Select, Typography } from "@mui/material";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";



interface RelatorioModalProps {
    isOpen: boolean;
    onClose: () => void;
}
interface RelatorioAgendamento{
    idImovel: number;
    nomeImovel: string;
    quantidadeAgendamentos: number;
}
interface RelatorioUsuario{
    idUsuario: number;
    nomeUsuario: string;
    quantidadeAcessos: number;
}
interface RelatorioVistoria{
    idImovel: number;
    nomeImovel: string;
    dataVistoria: string;
    detalhes: string;
}

const RelatorioModal: React.FC<RelatorioModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Função para gerar relatório de agendamentos
    const gerarRelatorioAgendamentos = async () => {
        try {
            const response = await axios.get(
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
            const linhas = dados.map((item: RelatorioAgendamento) => [
                item.idImovel,
                item.nomeImovel,
                item.quantidadeAgendamentos,
            ]);


            doc.autoTable({ startY: 20, head: [colunas], body: linhas });
            doc.save("relatorio-agendamentos-2024-11.pdf");
        } catch (error) {
            console.error("Erro ao gerar o relatório de agendamentos:", error);
        }
    };

    // Função para gerar relatório de usuários
    const gerarRelatorioUsuarios = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/relatorios/usuarios?mesAno=2024-05"
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o período solicitado.");
                return;
            }

            const doc = new jsPDF();
            doc.text("Relatório de Acessos de Usuários - 2024-11", 10, 10);

            const colunas = ["ID do Usuário", "Nome", "Quantidade de Acessos"];
            const linhas = dados.map((item: RelatorioUsuario) => [
                item.idUsuario,
                item.nomeUsuario,
                item.quantidadeAcessos,
            ]);

            doc.autoTable({ startY: 20, head: [colunas], body: linhas });
            const totalAcessos = dados.reduce((total: number, item: any) => total + item.quantidadeAcessos, 0);
            doc.text(`Total de Acessos: ${totalAcessos}`, 10, doc.previousAutoTable.finalY + 10);

            doc.save("relatorio-usuarios-2024-11.pdf");
        } catch (error) {
            console.error("Erro ao gerar o relatório de usuários:", error);
        }
    };

    // Função para gerar relatório de vistorias
    const gerarRelatorioVistorias = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/relatorios/vistorias?idImovel=1"
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o imóvel solicitado.");
                return;
            }

            const doc = new jsPDF();
            doc.text("Relatório de Vistorias - Imóvel ID 1", 10, 10);

            const colunas = ["ID do Imóvel", "Nome do Imóvel", "Data da Vistoria", "Detalhes"];
            const linhas = dados.map((item: RelatorioVistoria) => [
                item.idImovel,
                item.nomeImovel,
                item.dataVistoria,
                item.detalhes,
            ]);

            doc.autoTable({ startY: 20, head: [colunas], body: linhas });
            doc.save("relatorio-vistorias.pdf");
        } catch (error) {
            console.error("Erro ao gerar o relatório de vistorias:", error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="relatorio-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Gerar Relatório</h2>
                <p>Escolha o tipo de relatório para gerar:</p>

                <Stack direction="column" spacing={2}>
                    {/* Relatório de Agendamentos */}
                    <Typography>Relatório de Agendamentos</Typography>
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {Array.from({ length: 12 }, (_, i) => {
                            const month = `${2024}-${String(i + 1).padStart(2, "0")}`;
                            return (
                                <MenuItem key={month} value={month}>
                                    {month}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    <Button variant="contained" onClick={() => onGenerate("agendamentos", selectedMonth)}>
                        Gerar
                    </Button>

                    {/* Relatório de Vistorias */}
                    <Typography>Relatório de Vistorias</Typography>
                    <Select
                        value={selectedImovel}
                        onChange={(e) => setSelectedImovel(e.target.value)}
                    >
                        {/* Adicione os IDs dos imóveis dinamicamente */}
                        <MenuItem value="1">Imóvel 1</MenuItem>
                        <MenuItem value="2">Imóvel 2</MenuItem>
                    </Select>
                    <Button variant="contained" onClick={() => onGenerate("vistorias", selectedImovel)}>
                        Gerar
                    </Button>

                    {/* Relatório de Usuários */}
                    <Typography>Relatório de Usuários</Typography>
                    <Button variant="contained" onClick={() => onGenerate("usuarios", null)}>
                        Gerar
                    </Button>
                </Stack>
                <Button variant="outlined" color="success" onClick={onClose} style={{ marginTop: "20px" }}>
                    Fechar
                </Button>
            </div>
        </div>
    );
};

export default RelatorioModal;

