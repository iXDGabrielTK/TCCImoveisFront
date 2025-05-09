import { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    Stack,
    Divider,
    TextField,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface ResultadoFinanciamento {
    valorMaxParcela?: number;
    valorFinanciamento?: number;
    poderDeCompra?: number;
    mensagem?: string;
}

const CalculadoraFinanciamento: React.FC = () => {
    const [rendaMensal, setRendaMensal] = useState("");
    const [entrada, setEntrada] = useState("");
    const [resultado, setResultado] = useState<ResultadoFinanciamento | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCalcular = async () => {
        const renda = parseFloat(rendaMensal.replace(",", "."));
        const valorEntrada = parseFloat(entrada.replace(",", "."));

        if (!renda || !valorEntrada || isNaN(renda) || isNaN(valorEntrada) || renda <= 0 || valorEntrada <= 0) {
            alert("Preencha corretamente os campos com valores maiores que zero.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post<ResultadoFinanciamento>(
                "/simulacoes",
                {
                    rendaMensal: renda,
                    valorEntrada: valorEntrada,
                }
            );
            setResultado(response.data);
        } catch (error: any) {
            if (error.response) {
                console.error("🔴 Erro resposta:", error.response);
                alert(`Erro ${error.response.status}: ${error.response.data.message}`);
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
                                sx={{ mt: 2 }}
                                onClick={() => {
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
