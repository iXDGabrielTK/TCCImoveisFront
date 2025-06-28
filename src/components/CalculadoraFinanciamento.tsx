import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    Stack,
    Divider,
    TextField,
    MenuItem,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useFinanciamento } from '../context/FinanciamentoContext';

interface ResultadoFinanciamento {
    valorMaxParcela?: number;
    valorFinanciamento?: number;
    poderDeCompra?: number;
    mensagem?: string;
}

const CalculadoraFinanciamento: React.FC = () => {
    const [rendaMensal, setRendaMensal] = useState("");
    const [entrada, setEntrada] = useState("");
    const [prazo, setPrazo] = useState(360); // novo estado para o prazo
    const [resultado, setResultado] = useState<ResultadoFinanciamento | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setSimulacao } = useFinanciamento();

    const prazosDisponiveis = [120, 180, 240, 300, 360]; // prazos válidos

    const handleCalcular = async () => {
        const renda = parseFloat(rendaMensal.replace(",", "."));
        const valorEntrada = parseFloat(entrada.replace(",", "."));

        if (!renda || isNaN(renda) || renda <= 0 || isNaN(valorEntrada) || valorEntrada < 0) {
            alert("Renda mensal deve ser maior que zero e entrada não pode ser negativa.");
            return;
        }


        setLoading(true);
        try {
            const response = await api.post<ResultadoFinanciamento>(
                "/simulacoes",
                {
                    rendaMensal: renda,
                    valorEntrada: valorEntrada,
                    prazo: prazo
                }
            );
            setResultado(response.data);
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "response" in error) {
                const err = error as { response: { status: number; data: { message: string } } };
                console.error("🔴 Erro resposta:", err.response);
                alert(`Erro ${err.response.status}: ${err.response.data.message}`);
            } else {
                console.error("🔴 Erro desconhecido:", error);
                alert("Erro desconhecido ao calcular.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: "700px", margin: "0 auto" }}>
            <Card sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                    Simule seu Financiamento
                </Typography>

                <Stack spacing={3}>
                    <NumericFormat
                        customInput={TextField}
                        label="Renda Mensal"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        value={rendaMensal}
                        onValueChange={(values: { value: string }) => setRendaMensal(values.value)}
                        fullWidth
                        autoComplete="off"
                    />

                    <NumericFormat
                        customInput={TextField}
                        label="Valor da Entrada (com FGTS)"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        value={entrada}
                        onValueChange={(values: { value: string }) => setEntrada(values.value)}
                        fullWidth
                        autoComplete="off"
                    />

                    <TextField
                        select
                        label="Prazo de Financiamento (meses)"
                        value={prazo}
                        onChange={(e) => setPrazo(Number(e.target.value))}
                        fullWidth
                        autoComplete="off"
                        variant="outlined"
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                    >
                        {prazosDisponiveis.map((opcao) => (
                            <MenuItem key={opcao} value={opcao}>
                                {opcao} meses
                            </MenuItem>
                        ))}
                    </TextField>


                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCalcular}
                        disabled={loading}
                    >
                        {loading ? "Calculando..." : "Calcular"}
                    </Button>

                    {resultado && resultado.poderDeCompra !== undefined && (
                        <Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Resultado:
                            </Typography>
                            <Typography>
                                <strong>Valor da parcela máxima:</strong> R$ {resultado.valorMaxParcela?.toLocaleString()}
                            </Typography>
                            <Typography>
                                <strong>Valor financiável:</strong> R$ {resultado.valorFinanciamento?.toLocaleString()}
                            </Typography>
                            <Typography>
                                <strong>Poder de compra:</strong> R$ {resultado.poderDeCompra?.toLocaleString()}
                            </Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="success"
                                sx={{ mt: 2, fontWeight: 'bold' }}
                                onClick={() => {
                                    setSimulacao({ entrada, rendaMensal, prazo })
                                    navigate(`/imoveis-filtrados?valorMaximo=${resultado.poderDeCompra}`, {
                                        state: { origem: "simulacao" }
                                    });
                                }}
                            >
                                Buscar imóveis compatíveis
                            </Button>
                        </Box>
                    )}
                </Stack>
            </Card>
        </Box>
    );
};

export default CalculadoraFinanciamento;
