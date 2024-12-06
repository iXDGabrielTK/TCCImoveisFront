import React, { useState } from "react";
import "../styles/RelatorioModal.css";
import { Button, Stack, MenuItem, Select, Typography, TextField } from "@mui/material";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface RelatorioModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RelatorioModal: React.FC<RelatorioModalProps> = ({ isOpen, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState<string>("2024-01");
    const [selectedImovel, setSelectedImovel] = useState<string>("1");

    if (!isOpen) return null;

    // Função para gerar relatório de agendamentos
    const gerarRelatorioAgendamentos = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/relatorios/agendamentos?mesAno=${selectedMonth}`
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o período solicitado.");
                return;
            }

            // Calcular o total de agendamentos
            const totalAgendamentos = dados.reduce(
                (total: number, item: any) => total + item.quantidadeAgendamentos,
                0
            );

            const doc = new jsPDF();
            doc.text(`Relatório de Agendamentos - ${selectedMonth}`, 10, 10);

            const colunas = ["ID do Imóvel", "Nome do Imóvel", "Quantidade de Agendamentos"];
            const linhas = dados.map((item: any) => [
                item.idImovel,
                item.descricaoImovel,
                item.quantidadeAgendamentos,
            ]);

            doc.autoTable({ startY: 20, head: [colunas], body: linhas });

            // Adicionar o total de agendamentos no final do relatório
            doc.text(
                `Total de Agendamentos no mês ${selectedMonth}: ${totalAgendamentos}`,
                10,
                doc.previousAutoTable.finalY + 10
            );

            doc.save(`relatorio-agendamentos-${selectedMonth}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar o relatório de agendamentos:", error);
        }
    };

    // Função para gerar relatório de vistorias
    const gerarRelatorioVistorias = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/relatorios/vistorias?idImovel=${selectedImovel}`
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o imóvel solicitado.");
                return;
            }

            const doc = new jsPDF();
            doc.text(`Relatório de Vistorias - Imóvel ID ${selectedImovel}`, 10, 10);

            const colunas = ["ID da Vistoria", "ID do Imóvel", "Nome do Imóvel", "Data da Vistoria", "Detalhes"];
            const linhas = dados.map((item: any) => [
                item.idVistoria,
                item.idImovel,
                item.descricaoImovel,
                item.dataVistoria,
                item.laudoVistoria,
            ]);

            doc.autoTable({ startY: 20, head: [colunas], body: linhas });
            doc.save(`relatorio-vistorias-imovel-${selectedImovel}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar o relatório de vistorias:", error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="relatorio-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Gerar Relatório</h2>

                <Stack direction="column" spacing={4}>
                    {/* Relatório de Agendamentos */}
                    <div>
                        <Typography variant="h6">Relatório de Agendamentos</Typography>
                        <Typography variant="body2">Selecione o mês e o ano:</Typography>
                        <TextField
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={gerarRelatorioAgendamentos}
                            style={{ marginTop: "10px" }}
                        >
                            Gerar Relatório de Agendamentos
                        </Button>
                    </div>

                    {/* Relatório de Vistorias */}
                    <div>
                        <Typography variant="h6">Relatório de Vistorias</Typography>
                        <Typography variant="body2">Selecione o ID do Imóvel:</Typography>
                        <Select
                            value={selectedImovel}
                            onChange={(e) => setSelectedImovel(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="1">Imóvel 1</MenuItem>
                            <MenuItem value="2">Imóvel 2</MenuItem>
                            {/* Adicione dinamicamente os IDs dos imóveis conforme necessário */}
                        </Select>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={gerarRelatorioVistorias}
                            style={{ marginTop: "10px" }}
                        >
                            Gerar Relatório de Vistorias
                        </Button>
                    </div>
                </Stack>

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onClose}
                    style={{ marginTop: "20px" }}
                >
                    Fechar
                </Button>
            </div>
        </div>
    );
};

export default RelatorioModal;
