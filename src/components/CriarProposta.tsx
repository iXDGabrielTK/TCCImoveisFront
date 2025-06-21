import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    Stack,
    MenuItem,
    Divider,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import api from "../services/api";

interface CriarPropostaProps {
    imovelId: number;
    precoImovel: number;
}

const CriarProposta: React.FC<CriarPropostaProps> = ({ imovelId, precoImovel }) => {
    const [entrada, setEntrada] = useState("");
    const [rendaMensal, setRendaMensal] = useState("");
    const [parcelas, setParcelas] = useState(240);
    const [observacoes, setObservacoes] = useState("");

    const handleEnviarProposta = async () => {
        const usuarioIdRaw = localStorage.getItem("usuario_Id");
        const usuarioId = usuarioIdRaw ? parseInt(usuarioIdRaw, 10) : null;

        if (!usuarioId) {
            alert("Você precisa estar logado para enviar uma proposta.");
            return;
        }

        const entradaValor = parseFloat(entrada.replace(/\./g, "").replace(",", "."));
        const rendaValor = parseFloat(rendaMensal.replace(/\./g, "").replace(",", "."));

        if (isNaN(entradaValor) || isNaN(rendaValor)) {
            alert("Preencha corretamente os valores de entrada e renda mensal.");
            return;
        }

        try {
            await api.post("/propostas", {
                imovelId,
                usuarioId,
                entrada: entradaValor,
                rendaMensal: rendaValor,
                numeroParcelas: parcelas,
                valorImovel: precoImovel,
                observacoes,
            });

            alert("Proposta enviada com sucesso!");
        } catch (error) {
            console.error("Erro ao enviar proposta:", error);
            alert("Erro ao enviar proposta. Verifique os dados e tente novamente.");
        }
    };

    return (
        <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
            <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Enviar Proposta de Financiamento
                </Typography>

                <Stack spacing={2}>
                    <TextField
                        label="Valor do Imóvel"
                        value={`R$ ${precoImovel.toLocaleString()}`}
                        fullWidth
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                    />

                    <NumericFormat
                        customInput={TextField}
                        label="Entrada"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        value={entrada}
                        onValueChange={(values: { value: string }) => setEntrada(values.value)}
                        fullWidth
                    />

                    <NumericFormat
                        customInput={TextField}
                        label="Renda Mensal"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        value={rendaMensal}
                        onValueChange={(values: { value: string }) => setRendaMensal(values.value)}
                        fullWidth
                    />

                    <TextField
                        label="Número de Parcelas"
                        select
                        value={parcelas}
                        onChange={(e) => setParcelas(parseInt(e.target.value, 10))}
                        fullWidth
                    >
                        {[120, 180, 240, 300, 360].map((opcao) => (
                            <MenuItem key={opcao} value={opcao}>
                                {opcao}x
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Observações"
                        multiline
                        rows={2} // menor altura do campo
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        fullWidth
                    />

                    <Divider sx={{ my: 1 }} />

                    <Button variant="contained" color="primary" onClick={handleEnviarProposta} sx={{ fontWeight: 'bold' }}>
                        Enviar Proposta
                    </Button>
                </Stack>
            </Card>
        </Box>
    );
};

export default CriarProposta;
