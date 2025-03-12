import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid2";
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
        ? imovel.fotosImovel.flatMap((foto: string) =>
            foto.includes(",")
                ? foto.split(",").map((url: string) => url.trim())
                : [foto]
        )
        : [];

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [periodo, setPeriodo] = useState<string>("Manhã");
    const [nomeVisitante, setNomeVisitante] = useState<string>("");
    const holidays = getHolidays(new Date().getFullYear());

    const handleAgendarVisita = async () => {
        console.log("localStorage contents:", localStorage);

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado. Por favor, faça login.");
            console.error("Auth token missing in localStorage.");
            return;
        }

        console.log("Retrieved token:", token);

        const usuarioIdRaw = localStorage.getItem("usuarioId");
        const usuarioId = usuarioIdRaw ? parseInt(usuarioIdRaw, 10) : null;

        if (!usuarioId) {
            alert("ID do usuário não encontrado. Por favor, faça login novamente.");
            return;
        }

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
            usuarioId,
        };

        try {
            console.log("Data to send:", data);
            const response = await fetch("api/agendamentos/agendar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Erro ao agendar: ${errorData.error || "Erro desconhecido."}`);
            } else {
                alert("Agendamento realizado com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao conectar:", error);
            alert("Erro de conexão. Verifique sua rede e tente novamente.");
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "180vh",
                height: "200%",
                maxHeight: "100vh",
                position: "relative",
                backgroundColor: "#ededed",
                borderRadius: "30px",
                margin: "0 auto",
            }}
        >
            <Grid container spacing={2} sx={{ height: "100%", width: "100%" }}>
                <Grid
                    size={{ xs: 12, md: 8 }}
                    sx={{
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
                            height: "100%",
                            maxHeight: "auto",
                        }}
                    >
                        <Slider images={imageUrls} />
                    </Box>
                </Grid>
                <Grid
                    size={{ xs: 12, md: 4 }}
                    sx={{
                        padding: 2,
                        maxWidth: { xs: "100%", md: "40%" },
                        maxHeight: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        "@media (max-width: 768px)": {
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
                        <IconButton
                            onClick={onClose}
                            className="close-button"
                            aria-label="Fechar"
                            sx={{
                                position: "absolute",
                                top: 15,
                                right: 15,
                                background: "#ff4d4d",
                                color: "white",
                                "&:hover": {
                                    background: "#e60000",
                                    transform: "scale(1.1)",
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
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
                        <Stack spacing={1} alignItems="center">
                            {[
                                `Valor: R$ ${imovel.precoImovel}`,
                                `Tamanho: ${imovel.tamanhoImovel} m²`,
                                `Status: ${imovel.statusImovel ? "Disponível" : "Indisponível"}`,
                                `Rua: ${imovel.enderecoImovel?.rua || "Não informado"}`,
                                `Número: ${imovel.enderecoImovel?.numero || "Não informado"}`,
                                `Cidade: ${imovel.enderecoImovel?.cidade || "Não informado"}`,
                            ].map((info, index) => (
                                <Typography key={index} variant="h5" component="p" sx={{ color: "#003201" }}>
                                    {info}
                                </Typography>
                            ))}
                        </Stack>
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