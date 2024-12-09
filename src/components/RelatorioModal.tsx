import React, { useState, useEffect } from "react";
import {
    Button,
    Stack,
    MenuItem,
    Select,
    Typography,
    TextField,
    FormControl,
    InputLabel,
} from "@mui/material";
import "../styles/RelatorioModal.css";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface RelatorioModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Imovel {
    idImovel: number;
    descricaoImovel: string;
}

const RelatorioModal: React.FC<RelatorioModalProps> = ({ isOpen, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState<string>("2024-01");
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [selectedImovel, setSelectedImovel] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchImoveis();
        }
    }, [isOpen]);

    const fetchImoveis = async () => {
        try {
            const response = await axios.get("http://localhost:8080/imoveis");
            setImoveis(response.data);
        } catch (error) {
            console.error("Erro ao buscar imóveis:", error);
        }
    };

    const gerarRelatorioVistorias = async () => {
        if (!selectedImovel) {
            alert("Selecione um imóvel.");
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/relatorios/vistorias`,
                {
                    params: { idImovel: selectedImovel },
                }
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o imóvel selecionado.");
                return;
            }

            const doc = new jsPDF();
            doc.text(`Relatório de Vistorias - Imóvel ${selectedImovel}`, 10, 10);

            const colunas = [
                "ID da Vistoria",
                "ID do Imóvel",
                "Nome do Imóvel",
                "Data da Vistoria",
                "Detalhes",
            ];
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

    const gerarRelatorioUsuarios = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/relatorios/usuarios?mesAno=${selectedMonth}`
            );
            const dados = response.data;

            if (dados.length === 0) {
                alert("Nenhum dado encontrado para o período solicitado.");
                return;
            }

            const totalAcessos = dados.reduce(
                (total: number, item: any) => total + item.quantidadeAcessos,
                0
            );

            const doc = new jsPDF();
            doc.text(`Relatório de Usuários - ${selectedMonth}`, 10, 10);

            const colunas = ["ID do Usuário", "Nome do Usuário", "Quantidade de Acessos"];
            const linhas = dados.map((item: any) => [
                item.idUsuario,
                item.nomeUsuario,
                item.quantidadeAcessos,
            ]);

            doc.autoTable({ startY: 20, head: [colunas], body: linhas });

            doc.text(
                `Total de Acessos no mês ${selectedMonth}: ${totalAcessos}`,
                10,
                doc.previousAutoTable.finalY + 10
            );

            doc.save(`relatorio-usuarios-${selectedMonth}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar o relatório de usuários:", error);
        }
    };

    if (!isOpen) return null;

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
                        <Typography variant="body2">Selecione um imóvel:</Typography>
                        <FormControl fullWidth>
                            <InputLabel id="imovel-select-label">Imóvel</InputLabel>
                            <Select
                                labelId="imovel-select-label"
                                value={selectedImovel || ""}
                                onChange={(e) => setSelectedImovel(Number(e.target.value))}
                            >
                                {imoveis.map((imovel) => (
                                    <MenuItem key={imovel.idImovel} value={imovel.idImovel}>
                                        {imovel.descricaoImovel}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={gerarRelatorioVistorias}
                            style={{ marginTop: "10px" }}
                        >
                            Gerar Relatório de Vistorias
                        </Button>
                    </div>

                    {/* Relatório de Usuários */}
                    <div>
                        <Typography variant="h6">Relatório de Usuários</Typography>
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
                            onClick={gerarRelatorioUsuarios}
                            style={{ marginTop: "10px" }}
                        >
                            Gerar Relatório de Usuários
                        </Button>
                    </div>
                </Stack>

                <Button
                    variant="outlined"
                    color="success"
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
