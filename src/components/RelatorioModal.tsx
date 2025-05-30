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
import '../styles/shared.css';
import api from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useToast } from "../context/ToastContext";

interface RelatorioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (tiporelatorio: string) => void;
}

interface Imovel {
    idImovel: number;
    descricaoImovel: string;
}

interface VistoriaRelatorio {
    idVistoria: number;
    idImovel: number;
    descricaoImovel: string;
    dataVistoria: string;
    laudoVistoria: string;
}

interface AgendamentoRelatorio {
    idImovel: number;
    descricaoImovel: string;
    quantidadeAgendamentos: number;
}

interface UsuarioRelatorio {
    idUsuario: number;
    nomeUsuario: string;
    quantidadeAcessos: number;
}

const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // mês começa do 0
    return `${year}-${month}`;
};

const RelatorioModal: React.FC<RelatorioModalProps> = ({ isOpen, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthYear());
    const [imoveis, setImoveis] = useState<Imovel[]>([]);
    const [selectedImovel, setSelectedImovel] = useState<number | null>(null);
    const { showToast } = useToast();

    const fetchImoveis = useCallback(async () => {
        try {
            const response = await api.get("/imoveis", {
                params: {
                    page: 0,
                    size: 1000,
                    sort: "idImovel,asc"
                }
            });
            if (Array.isArray(response.data.content)) {
                setImoveis(response.data.content);
            } else {
                console.warn("Resposta inesperada de /imoveis:", response.data);
                showToast("Resposta inesperada de /imoveis:", "error");
                setImoveis([]);
            }
        } catch (error) {
            console.error("Erro ao buscar imóveis:", error);
            showToast("Erro ao buscar imóveis.", "error");
        }
    }, [showToast]);

    useEffect(() => {
        if (isOpen) {
            void fetchImoveis();
        }
    }, [isOpen, fetchImoveis]);

    const gerarRelatorioVistorias = async () => {
        if (!selectedImovel) {
            showToast("Selecione um imóvel.", "error");
            return;
        }

        try {
            const response = await api.get(
                `/relatorios/vistorias`,
                {
                    params: { idImovel: selectedImovel },
                }
            );
            const dados = response.data;

            if (dados.length === 0) {
                showToast("Nenhum dado encontrado para o imóvel selecionado.", "error");
                return;
            }

            const doc = new jsPDF();
            doc.text(`Relatório de Vistorias - Imóvel ${selectedImovel}`, 10, 10);

            const colunas = [
                { content: "ID da Vistoria", styles: { halign: "right" } },
                { content: "ID do Imóvel", styles: { halign: "right" } },
                { content: "Nome do Imóvel", styles: { halign: "left" } },
                { content: "Data da Vistoria", styles: { halign: "left" } },
                { content: "Detalhes", styles: { halign: "left" } },
            ];
            const linhas = dados.map((item: VistoriaRelatorio) => [
                { content: item.idVistoria ?? "N/A", styles: { halign: "right" } },
                { content: item.idImovel ?? "N/A", styles: { halign: "right" } },
                { content: item.descricaoImovel ?? "N/A", styles: { halign: "left" } },
                { content: item.dataVistoria ?? "N/A", styles: { halign: "left" } },
                { content: item.laudoVistoria ?? "N/A", styles: { halign: "left" } },
            ]);

            doc.autoTable({ startY: 20, head: [colunas], body: linhas });
            doc.save(`relatorio-vistorias-imovel-${selectedImovel}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar o relatório de vistorias:", error);
            showToast("Erro ao gerar o relatório de vistorias. Tente novamente.", "error");
        }
    };

    const gerarRelatorioAgendamentos = async () => {
        try {
            const response = await api.get(
                `/relatorios/agendamentos?mesAno=${selectedMonth}`
            );
            const dados = response.data;

            if (dados.length === 0) {
                showToast("Nenhum dado encontrado para o período solicitado.", "error");
                return;
            }

            const totalAgendamentos = dados.reduce(
                (total: number, item: AgendamentoRelatorio) => total + item.quantidadeAgendamentos,
                0
            );

            const doc = new jsPDF();
            doc.text(`Relatório de Agendamentos - ${selectedMonth}`, 10, 10);

            const colunas = [
                { content: "ID do Imóvel", styles: { halign: "right" } },
                { content: "Nome do Imóvel", styles: { halign: "left" } },
                { content: "Quantidade de Agendamentos", styles: { halign: "right" } },
            ];
            const linhas = dados.map((item: AgendamentoRelatorio) => [
                { content: item.idImovel ?? "N/A", styles: { halign: "right" } },
                { content: item.descricaoImovel ?? "N/A", styles: { halign: "left" } },
                { content: item.quantidadeAgendamentos ?? 0, styles: { halign: "right" } },
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
            showToast("Erro ao gerar o relatório de agendamentos. Tente novamente.", "error");
        }
    };

    const gerarRelatorioUsuarios = async () => {
        try {
            const response = await api.get(
                `/relatorios/usuarios?mesAno=${selectedMonth}`
            );
            const dados = response.data;

            if (dados.length === 0) {
                showToast("Nenhum dado encontrado para o período solicitado.", "error");
                return;
            }

            const totalAcessos = dados.reduce(
                (total: number, item: UsuarioRelatorio) => total + item.quantidadeAcessos,
                0
            );

            const doc = new jsPDF();
            doc.text(`Relatório de Usuários - ${selectedMonth}`, 10, 10);

            const colunas = [
                { content: "ID do Usuário", styles: { halign: "right" } },
                { content: "Nome do Usuário", styles: { halign: "left" } },
                { content: "Quantidade de Acessos", styles: { halign: "right" } },
            ];
            const linhas = dados.map((item: UsuarioRelatorio) => [
                { content: item.idUsuario ?? "N/A", styles: { halign: "right" } },
                { content: item.nomeUsuario ?? "N/A", styles: { halign: "left" } },
                { content: item.quantidadeAcessos ?? 0, styles: { halign: "right" } },
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
            showToast("Erro ao gerar o relatório de usuários. Tente novamente.", "error");
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
                            className={"select-month"}
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            fullWidth
                        />
                        <Button
                            className={"button-meu-group"}
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
                            className={"select-month"}
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            fullWidth
                        />
                        <Button
                            className={"button-meu-group"}
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
