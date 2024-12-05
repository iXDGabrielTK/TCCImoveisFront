import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Grid v2
import React from "react";
import Slider from "./Slider";
import { Imovel } from "../types/Imovel";
import "../styles/ImovelDetalhes.css";
import { getHolidays } from "../types/holidays";
import CustomDatePicker from "./CustomDatePicker";

interface ImovelDetalhesProps {
    imovel: Imovel;
    onClose: () => void;
}

const ImovelDetalhes: React.FC<ImovelDetalhesProps> = ({ imovel, onClose }) => {
    const imageUrls = Array.isArray(imovel.fotosImovel)
        ? imovel.fotosImovel
        : (imovel.fotosImovel || "")
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [periodo, setPeriodo] = useState<string>("Manhã");
    const [nomeVisitante, setNomeVisitante] = useState<string>("");
    const holidays = getHolidays(new Date().getFullYear());

    const handleAgendarVisita = async () => {
        const usuarioIdRaw = localStorage.getItem("usuario_Id");
        const usuario_Id = usuarioIdRaw ? parseInt(usuarioIdRaw, 10) : null;

        if (!startDate || !nomeVisitante.trim()) {
            alert("Por favor, selecione uma data e insira seu nome.");
            return;
        }

        const formattedDate = startDate.toISOString().split("T")[0];

        const data = {
            nomeVisitante,
            imovelId: imovel.idImovel,
            dataAgendamento: formattedDate,
            horarioMarcado: periodo === "Tarde",
            usuario_Id,
        };

        try {
            const response = await fetch(
                "http://localhost:8080/agendamentos/agendar",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );

            if (response.ok) {
                alert("Agendamento realizado com sucesso!");
                setStartDate(null);
                setNomeVisitante("");
                setPeriodo("Manhã");
            } else {
                const errorMessage = await response.text();
                alert(`Erro ao agendar: ${errorMessage}`);
            }
        } catch (error) {
            alert(`Erro de conexão: ${error}`);
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "1700px",
                height: "200%",
                position: "relative",
                backgroundColor: "#ededed",
                borderRadius: "30px",
                margin: "0 auto",
            }}
        >
            <Grid container spacing={2} sx={{ height: "100%" }}>
                <Grid
                    component="div"
                    sx={{
                        flex: "2", // Aumenta a proporção do slider
                        padding: 2,
                        "@media (max-width: 768px)": {
                            flexDirection: "column",
                            maxWidth: "100%",
                        },
                    }}
                >
                    <Box
                        sx={{
                            position: "relative",
                            backgroundColor: "#d9d9d9",
                            borderRadius: "20px",
                            height: "auto",
                            maxHeight: "600px", // Limita a altura máxima do slider
                        }}
                    >
                        <Slider images={imageUrls} />
                    </Box>
                </Grid>
                <Grid
                    component="div"
                    sx={{
                        flex: "1", // Reduz a proporção da seção de informações
                        padding: 2,
                        maxWidth: "40%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center", // Centraliza verticalmente o conteúdo
                        "@media (max-width: 768px)": {
                            maxWidth: "100%",
                            padding: 1,
                        },
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 2,
                            borderRadius: "20px",
                        }}
                    >
                        <button onClick={onClose} className="close-button">
                            Fechar
                        </button>
                        <Typography variant="h3" component="h1" sx={{ fontWeight: "bold" }}>
                            {imovel.tipoImovel ? "Residencial" : "Comercial"}
                        </Typography>
                        <Typography variant="h6" component="h2" sx={{ marginTop: 1 }}>
                            {imovel.descricaoImovel}
                        </Typography>
                        <Box
                            sx={{
                                marginTop: 2,
                                marginBottom: 2,
                                height: "2px",
                                backgroundColor: "#000",
                            }}
                        />
                        <Typography
                            variant="h5"
                            component="p"
                            sx={{ color: "#003201", textAlign: "center" }}
                        >
                            Valor: R$ {imovel.precoImovel}
                            <br />
                            Tamanho: {imovel.tamanhoImovel} m²
                            <br />
                            Status: {imovel.statusImovel ? "Disponível" : "Indisponível"}
                            <br />
                            Rua: {imovel.enderecoImovel?.rua || "Não informado"}
                            <br />
                            Número: {imovel.enderecoImovel?.numero || "Não informado"}
                            <br />
                            Cidade: {imovel.enderecoImovel?.cidade || "Não informado"}
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                marginTop: 4,
                                padding: 2,
                                border: "1px solid #ddd",
                                borderRadius: 2,
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{ fontWeight: "bold", textAlign: "center", marginBottom: 2 }}
                            >
                                Agendar Visita
                            </Typography>
                            <TextField
                                error={!nomeVisitante.trim()}
                                helperText={!nomeVisitante.trim() ? "O nome é obrigatório." : ""}
                                fullWidth
                                label="Nome do Visitante"
                                variant="outlined"
                                value={nomeVisitante}
                                onChange={(e) => setNomeVisitante(e.target.value)}
                            />
                            <CustomDatePicker
                                selected={startDate || undefined}
                                onChange={(date) => setStartDate(date)}
                                holidays={holidays}
                                errorMessage={!startDate ? "Selecione uma data válida." : undefined}
                            />
                            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                                <Button
                                    variant={periodo === "Manhã" ? "contained" : "outlined"}
                                    onClick={() => setPeriodo("Manhã")}
                                >
                                    Manhã
                                </Button>
                                <Button
                                    variant={periodo === "Tarde" ? "contained" : "outlined"}
                                    onClick={() => setPeriodo("Tarde")}
                                >
                                    Tarde
                                </Button>
                            </Box>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                onClick={handleAgendarVisita}
                            >
                                Agendar uma Visita
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ImovelDetalhes;
