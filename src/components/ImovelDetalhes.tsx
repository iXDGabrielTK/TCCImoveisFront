import { useState, useEffect, useMemo } from "react";
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
import api from "../services/api";
import axios from "axios";
import CriarProposta from "./CriarProposta";
import MapaEndereco from "./MapaEndereco.tsx";

interface ImovelDetalhesProps {
    imovel: Imovel;
    origem?: "simulacao" | "padrao";
}

const ImovelDetalhes: React.FC<ImovelDetalhesProps> = ({ imovel, origem = "padrao" }) => {
    const imageUrls = useMemo(() => {
        // noinspection SuspiciousTypeOfGuard
        return Array.isArray(imovel.fotosImovel)
            ? imovel.fotosImovel
                .map(f => (typeof f === "string" ? f : f.urlFotoImovel))
                .filter(url => url && url.includes("http"))
                .flatMap(url => url.split(','))
            : [];
    }, [imovel.fotosImovel]);

    useEffect(() => {
        console.log("imageUrls:", imageUrls);
        console.log("imovel completo:", imovel);
    }, [imageUrls, imovel]);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [periodo, setPeriodo] = useState<string>("Manhã");
    const [nomeVisitante, setNomeVisitante] = useState<string>("");
    const holidays = getHolidays(new Date().getFullYear());

    const handleAgendarVisita = async () => {
        const token = localStorage.getItem("access_token");
        const usuarioIdRaw = localStorage.getItem("usuario_Id");
        const usuarioId = usuarioIdRaw ? parseInt(usuarioIdRaw, 10) : null;

        console.log({ token, usuarioId, startDate, nomeVisitante });

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
            await api.post("/agendamentos/agendar", data);
            alert("Agendamento realizado com sucesso!");
        } catch (error: unknown) {
            let errorMessage = "Erro desconhecido.";

            if (axios.isAxiosError(error) && error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 400) {
                    errorMessage = "Já existe um agendamento para esse imóvel nessa data.";
                } else if (status === 401) {
                    errorMessage = "Você precisa estar logado para agendar.";
                } else if (status === 403) {
                    errorMessage = "Você não tem permissão para agendar este imóvel.";
                } else if (status === 500) {
                    errorMessage = "Erro interno no servidor.";
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                }
            } else {
                console.error("Erro não tratado:", error);
            }

            alert(`Erro: ${errorMessage}`);
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
                        </Grid>
                        <Grid container {...{ columns: { xs: 4, sm: 8, md: 12 } }} sx={{ mt: 2 }}>
                            <Grid size={{ xs: 4, md: 12 }} sx={{ mt: 3 }}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Endereço:</strong>{" "}
                                    {[
                                        imovel.enderecoImovel?.rua && ` ${imovel.enderecoImovel.rua}`,
                                        imovel.enderecoImovel?.numero && `nº ${imovel.enderecoImovel.numero}`,
                                        imovel.enderecoImovel?.bairro,
                                        imovel.enderecoImovel?.cidade,
                                        imovel.enderecoImovel?.estado?.toUpperCase()
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </Typography>

                                <MapaEndereco
                                    enderecoCompleto={[
                                        imovel.enderecoImovel?.rua,
                                        imovel.enderecoImovel?.numero,
                                        imovel.enderecoImovel?.bairro,
                                        imovel.enderecoImovel?.cidade,
                                        imovel.enderecoImovel?.estado
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 4, md: 4 }}>
                        {origem === "simulacao" ? (
                            <CriarProposta
                                imovelId={imovel.idImovel}
                                precoImovel={imovel.precoImovel}
                            />
                        ) : (
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
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ImovelDetalhes;