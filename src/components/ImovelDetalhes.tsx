import { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Divider,
    Card
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import React from "react";
import Slider from "./Slider";
import { Imovel } from "../types/Imovel";
import { getHolidays } from "../types/holidays";
import CustomDatePicker from "./CustomDatePicker";

interface ImovelDetalhesProps {
    imovel: Imovel;
}

const ImovelDetalhes: React.FC<ImovelDetalhesProps> = ({ imovel }) => {
    const imageUrls = Array.isArray(imovel.fotosImovel)
        ? imovel.fotosImovel
            .map(f => f.urlFotoImovel)
            .filter(url => typeof url === "string" && url.includes("http"))
            .flatMap(url => url.split(','))
        : [];

    console.log("imageUrls:", imageUrls);


    const [startDate, setStartDate] = useState<Date | null>(null);
    const [periodo, setPeriodo] = useState<string>("Manhã");
    const [nomeVisitante, setNomeVisitante] = useState<string>("");
    const holidays = getHolidays(new Date().getFullYear());

    const handleAgendarVisita = async () => {
        const token = localStorage.getItem("token");
        const usuarioIdRaw = localStorage.getItem("usuarioId");
        const usuarioId = usuarioIdRaw ? parseInt(usuarioIdRaw, 10) : null;

        if (!token || !usuarioId || !startDate || !nomeVisitante.trim()) {
            alert("Preencha todos os campos corretamente e faça login.");
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
            const response = await fetch("http://localhost:8080/agendamentos/agendar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Erro: ${errorData.error || "Erro desconhecido."}`);
            } else {
                alert("Agendamento realizado com sucesso!");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro de conexão com o servidor.");
        }
    };

    return (
        <Box sx={{ width: "100%", backgroundColor: "#ededed" }}>
            <Box sx={{ width: "100%", maxHeight: "70vh", overflow: "hidden" }}>
                <Slider images={imageUrls} />
            </Box>

            <Box sx={{ maxWidth: "1400px", margin: "0 auto", padding: 3 }}>
                <Grid container spacing={{ xs: 2, md: 4 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid size={{ xs: 4, md: 8 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {imovel.tipoImovel === "Residencial" ? "Residência" : "Imóvel Comercial"}
                        </Typography>

                        <Typography variant="subtitle1" color="text.secondary" >
                            {imovel.descricaoImovel}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
                                <Typography variant="body1"><strong>Preço:</strong> R$ {imovel.precoImovel.toLocaleString()}</Typography>
                            </Grid>
                            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
                                <Typography variant="body1"><strong>Tamanho:</strong> {imovel.tamanhoImovel} m²</Typography>
                            </Grid>
                            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
                                <Typography variant="body1"><strong>Status:</strong> {imovel.statusImovel ? "Disponível" : "Indisponível"}</Typography>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Typography variant="body1"><strong>Endereço:</strong> {imovel.enderecoImovel?.rua}, {imovel.enderecoImovel?.numero} - {imovel.enderecoImovel?.bairro}, {imovel.enderecoImovel?.cidade}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 4, md: 4 }}>
                        <Card elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
                                Agendar Visita
                            </Typography>

                            <TextField
                                fullWidth
                                label="Nome do Visitante"
                                value={nomeVisitante}
                                onChange={(e) => setNomeVisitante(e.target.value)}
                                error={!nomeVisitante.trim()}
                                helperText={!nomeVisitante.trim() ? "Campo obrigatório." : ""}
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                        '& fieldset': {
                                            borderColor: '#1976d2',
                                            borderWidth: '2px',
                                            boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.2)',
                                            borderRadius: '4px',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#1565c0',
                                            borderWidth: '2px',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#0d47a1',
                                            borderWidth: '2px',
                                            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.3)',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderRadius: '4px',
                                        },
                                    },
                                    '& .MuiInputLabel-outlined': {
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            padding: '0 8px',
                                        }
                                    }
                                }}
                            />

                            <CustomDatePicker
                                selected={startDate || undefined}
                                onChange={(date) => setStartDate(date)}
                                holidays={holidays}
                                errorMessage={!startDate ? "Selecione uma data válida." : undefined}
                            />

                            <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
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
                            </Stack>

                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                onClick={handleAgendarVisita}
                                sx={{ mt: 3 }}
                            >
                                Agendar
                            </Button>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ImovelDetalhes;
