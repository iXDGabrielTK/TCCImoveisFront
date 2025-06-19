import React from 'react';
import {
    Box, Typography, Button, Card, CardContent,
    Stack, Avatar, Chip, useMediaQuery, useTheme
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

interface SolicitacaoCardProps {
    tipo: 'Corretor' | 'Imobiliaria';
    resumo: string;
    nome?: string; // agora opcional
    email?: string; // agora opcional
    razaoSocial?: string; // novo campo para imobiliária
    creciSolicitado?: string;
    cnpj?: string;
    imagemUrl?: string;
    telefone?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    onAprovar: () => void;
    onReprovar: () => void;
}

const SolicitacaoCard: React.FC<SolicitacaoCardProps> = ({
    tipo,
    nome,
    email,
    razaoSocial,
    creciSolicitado,
    cnpj,
    imagemUrl,
    resumo,
    telefone,
    endereco,
    cidade,
    estado,
    onAprovar,
    onReprovar
}) => {
    const gerarIniciais = (nome: string) => {
        if (!nome) return '?';
        return nome
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card
            sx={{
                width: '100%',
                maxWidth: 500,
                px: 2,
                py: 3,
                borderRadius: 3,
                boxShadow: 3,
                mx: 'auto',
                overflow: 'visible',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
                border: '1px solid #e0e7ef'
            }}
        >
            <CardContent>
                <Stack direction="column" spacing={3} alignItems="center">
                    <Avatar
                        src={imagemUrl}
                        sx={{
                            width: 96,
                            height: 96,
                            fontSize: 34,
                            bgcolor: '#14453e',
                            border: '3px solid #eee',
                            boxShadow: 3
                        }}
                    >
                        {!imagemUrl && gerarIniciais(tipo === 'Imobiliaria' ? (razaoSocial || 'Imobiliária') : (nome || ''))}
                    </Avatar>

                    <Box textAlign="center" px={1}>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#14453e' }}>
                            {tipo === 'Imobiliaria'
                                ? (razaoSocial || 'Imobiliária')
                                : (nome || 'Nome não informado')}
                        </Typography>
                        {email && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {email}
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                            {resumo}
                        </Typography>

                        {tipo === 'Corretor' && (
                            <Chip
                                icon={<VerifiedUserIcon fontSize="small" />}
                                label={`CRECI: ${creciSolicitado || 'N/A'}`}
                                color="info"
                                variant="outlined"
                                sx={{ fontWeight: 500, mt: 1 }}
                            />
                        )}

                        {tipo === 'Imobiliaria' && (
                            <Stack direction="column" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                <Chip
                                    icon={<VerifiedUserIcon fontSize="small" />}
                                    label={`CNPJ: ${cnpj || 'N/A'}`}
                                    color="warning"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                />
                                {telefone && (
                                    <Chip
                                        label={`Telefone: ${telefone}`}
                                        color="primary"
                                        variant="outlined"
                                        sx={{ fontWeight: 500 }}
                                    />
                                )}
                                {endereco && (
                                    <Chip
                                        label={`Endereço: ${endereco}`}
                                        color="default"
                                        variant="outlined"
                                        sx={{ fontWeight: 500 }}
                                    />
                                )}
                                {(cidade || estado) && (
                                    <Chip
                                        label={`Cidade/UF: ${cidade || ''}${cidade && estado ? ' - ' : ''}${estado || ''}`}
                                        color="default"
                                        variant="outlined"
                                        sx={{ fontWeight: 500 }}
                                    />
                                )}
                            </Stack>
                        )}
                    </Box>

                    <Stack
                        direction={isMobile ? 'column' : 'row'}
                        spacing={2}
                        sx={{ width: '100%', justifyContent: 'center', mt: 2 }}
                    >
                        <Button
                            fullWidth={isMobile}
                            variant="contained"
                            color="success"
                            onClick={onAprovar}
                            sx={{ fontWeight: 600, letterSpacing: 1 }}
                        >
                            Aprovar
                        </Button>
                        <Button
                            fullWidth={isMobile}
                            variant="outlined"
                            color="error"
                            onClick={onReprovar}
                            sx={{ fontWeight: 600, letterSpacing: 1 }}
                        >
                            Reprovar
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default SolicitacaoCard;
