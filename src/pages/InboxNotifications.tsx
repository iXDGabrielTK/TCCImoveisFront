import React, {useEffect, useState} from 'react';
import {
    Box, Typography, Paper, List, ListItemIcon, Stack,
    FormControl, InputLabel, Select, MenuItem, useMediaQuery, useTheme, ListItemText, ListItemButton, Skeleton,
    Tabs, Tab, Dialog, IconButton, Tooltip, Chip
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventNoteIcon from '@mui/icons-material/EventNote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ArchiveIcon from '@mui/icons-material/Archive';
import {
    aprovarSolicitacao,
    recusarSolicitacao,
    useNotificacoesPrivadas,
    useNotificacoesNaoLidas,
    useNotifications,
    useArquivarNotificacao,
} from '../hooks/useNotifications';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SolicitacaoCard from '../components/SolicitacaoCard';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import { Notificacao } from '../types/Notificacao';

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'Proposta': return <LocalOfferIcon color="primary" />;
        case 'Agendamento': return <EventNoteIcon color="secondary" />;
        case 'Sistema': return <InfoOutlinedIcon color="action" />;
        case 'Corretor': return <InfoOutlinedIcon color="info" />;
        case 'Imobiliaria': return <InfoOutlinedIcon color="warning" />;
        default: return <InfoOutlinedIcon />;
    }
};

const formatTimestamp = (timestampStr: string | undefined) => {
    if (!timestampStr || isNaN(Date.parse(timestampStr))) return 'Data inválida';
    const timestamp = new Date(timestampStr);
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHrs < 24 && timestamp.getDate() === now.getDate()) return `há ${diffHrs} horas`;
    if (diffDays === 1 && timestamp.getDate() === now.getDate() - 1) return 'ontem';
    return timestamp.toLocaleDateString('pt-BR') + ' às ' + timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const backgroundColorByType = {
    Proposta: '#eafaf1',
    Agendamento: '#e9f2fb',
    Corretor: '#fff7e6',
    Imobiliaria: '#fceef3',
    Sistema: '#f7f7f7'
};

const tipoLabel = {
    Proposta: 'Nova proposta recebida',
    Agendamento: 'Agendamento solicitado',
    Corretor: 'Solicitação de corretor',
    Imobiliaria: 'Solicitação de imobiliária',
    Sistema: 'Notificação do sistema'
};

const tabLabels = {
    Proposta: 'Propostas',
    Agendamento: 'Agendamentos',
    Corretor: 'Corretores',
    Imobiliaria: 'Imobiliárias',
    Sistema: 'Sistema'
}

const chipColor = {
    Proposta: 'success',
    Agendamento: 'info',
    Corretor: 'primary',
    Imobiliaria: 'warning',
    Sistema: 'default'
};

const InboxNotifications: React.FC = () => {
    const { data: privadas = [], isLoading: loadingPrivadas } = useNotificacoesPrivadas();
    const { data: naoLidas = [], isLoading: loadingNaoLidas } = useNotificacoesNaoLidas();
    const { data: todas = [], isLoading: loadingTodas } = useNotifications();

    const [filterStatus, setFilterStatus] = useState('Todos');
    const [orderBy, setOrderBy] = useState('Mais recentes');
    const [currentTab, setCurrentTab] = useState('Todos');
    const [selectedNotification, setSelectedNotification] = useState<Notificacao | null>(null);
    const [readNotifications, setReadNotifications] = useState<number[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const queryClient = useQueryClient();

    const { mutate: arquivar } = useArquivarNotificacao();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    const canOpenCard = (notificacao: Notificacao | null): boolean => {
        if (!notificacao) return false;
        return (
            (notificacao.tipo === 'Corretor' || notificacao.tipo === 'Imobiliaria') &&
            !notificacao.respondida &&
            !notificacao.arquivada &&
            !notificacao.lida
        );
    };

    const mutation = useMutation({
        mutationFn: ({ id, tipo, aprovada }: { id: number; tipo: 'corretor' | 'imobiliaria'; aprovada: boolean }) =>
            aprovada ? aprovarSolicitacao(tipo, id) : recusarSolicitacao(tipo, id),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
            setReadNotifications(prev => [...prev, variables.id]);
        }
    });

    // useMemo para filtrar e ordenar notificações
    const notificacoesBase = filterStatus === "Não lidas"
        ? naoLidas
        : filterStatus === "Todos"
            ? todas
            : privadas;

    const filtered = React.useMemo(() => notificacoesBase.filter(n => {
        const isArquivada = n.arquivada ?? false;

        const status =
            filterStatus === "Todos" ||
            (filterStatus === "Não lidas" && !n.lida && !readNotifications.includes(n.id)) ||
            (filterStatus === "Lidas" && (n.lida || readNotifications.includes(n.id)));

        const categoria = currentTab === "Todos" || n.tipo === currentTab;

        return !isArquivada && status && categoria;
    }), [notificacoesBase, filterStatus, readNotifications, currentTab]);

    const sorted = React.useMemo(() => [...filtered].sort((a, b) => {
        const ta = new Date(a.dataCriacao).getTime();
        const tb = new Date(b.dataCriacao).getTime();
        return orderBy === "Mais recentes" ? tb - ta : ta - tb;
    }), [filtered, orderBy]);

    const isLoading = loadingPrivadas || loadingNaoLidas || loadingTodas;

    useEffect(() => {
        if (!canOpenCard(selectedNotification)) {
            setSelectedNotification(null);
        }
    }, [selectedNotification]);

    return (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 2, minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2, width: '100%', maxWidth: 900, mx: 'auto' }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Notificações</Typography>

                <Box display="flex" justifyContent="center">
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        variant={isMobile ? 'scrollable' : 'standard'}
                        scrollButtons={isMobile ? 'auto' : false}
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Todos" value="Todos" />
                        {Object.keys(tabLabels).map((key) => (
                            <Tab key={key} label={tabLabels[key as keyof typeof tabLabels]} value={key} />
                        ))}
                    </Tabs>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        <FormControl fullWidth size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                label="Status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="Todos">Todos</MenuItem>
                                <MenuItem value="Não lidas">Não lidas</MenuItem>
                                <MenuItem value="Lidas">Lidas</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Ordenar por</InputLabel>
                            <Select
                                label="Ordenar por"
                                value={orderBy}
                                onChange={(e) => setOrderBy(e.target.value)}
                            >
                                <MenuItem value="Mais recentes">Mais recentes</MenuItem>
                                <MenuItem value="Mais antigas">Mais antigas</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                <List disablePadding>
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <Box key={i} sx={{ p: 2, mb: 1, borderRadius: 2, boxShadow: 1, bgcolor: '#fff' }}>
                                <Skeleton variant="text" width="40%" />
                                <Skeleton variant="text" width="80%" />
                            </Box>
                        ))
                    ) : sorted.length === 0 ? (
                        <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 6 }}>
                            Nenhuma notificação encontrada.
                        </Typography>
                    ) : (
                        sorted.map((n, index) => {
                            const isRespondida = n.respondida ?? false;
                            const isArquivada = n.arquivada ?? false;
                            const isLida = n.lida ?? false;
                            const podeAbrirCard = (n.tipo === 'Corretor' || n.tipo === 'Imobiliaria') && !isRespondida && !isArquivada && !isLida;

                            return (
                                <Fade in={true} timeout={300 + index * 60} key={n.id}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            justifyContent: 'space-between',
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            gap: 1,
                                            width: '100%',
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={() => {
                                                if (!podeAbrirCard) return;
                                                setSelectedNotification(n);
                                            }}
                                            sx={{
                                                cursor: podeAbrirCard ? 'pointer' : 'default',
                                                bgcolor: isRespondida
                                                    ? '#eeeeee'
                                                    : n.lida
                                                        ? '#f0f0f0'
                                                        : backgroundColorByType[n.tipo] || '#fff',
                                                borderLeft: !n.lida && !isRespondida ? '4px solid #1976d2' : undefined,
                                                opacity: isRespondida ? 0.7 : 1,
                                                borderRadius: 2,
                                                mb: 1,
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                                                    transform: 'translateY(-1px)',
                                                    transition: '0.2s'
                                                }
                                            }}
                                            aria-label={`Abrir detalhes da notificação ${n.titulo}`}
                                        >
                                            <ListItemIcon>{getNotificationIcon(n.tipo)}</ListItemIcon>
                                            <ListItemText
                                                sx={{ flexGrow: 1, maxWidth: '100%' }}
                                                primary={
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                        <Typography fontWeight={600}>{tipoLabel[n.tipo] || n.tipo}</Typography>
                                                        <Typography variant="body1" color="text.secondary">{n.resumo}</Typography>

                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            flexWrap="wrap"
                                                            alignItems="center"
                                                            sx={{ mt: 1 }}
                                                        >
                                                            <Chip
                                                                label={n.tipo.toUpperCase()}
                                                                size="small"
                                                                color={chipColor[n.tipo] as 'success' | 'info' | 'primary' | 'warning' | 'default'}
                                                                variant="outlined"
                                                            />
                                                            {!n.lida && !readNotifications.includes(n.id) && !isRespondida && (
                                                                <Chip label="Nova" color="primary" size="small" />
                                                            )}
                                                            {isRespondida && (
                                                                <Chip label="Respondida" color="default" size="small" />
                                                            )}
                                                            {!isRespondida && n.lida && (
                                                                <Chip label="Lida" color="default" size="small" variant="outlined" />
                                                            )}
                                                            {isArquivada && (
                                                                <Chip label="Arquivada" color="default" size="small" variant="outlined" />
                                                            )}
                                                            <Tooltip title="Arquivar notificação">
                                                                <span>
                                                                    <IconButton
                                                                        aria-label="Arquivar notificação"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            arquivar(n.id, {
                                                                                onSuccess: () => {
                                                                                    setSnackbarMsg('Notificação arquivada com sucesso!');
                                                                                    setSnackbarOpen(true);
                                                                                }
                                                                            });
                                                                        }}
                                                                    >
                                                                        <ArchiveIcon fontSize="small" />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatTimestamp(n.dataCriacao)}
                                                            </Typography>
                                                            {!n.lida && !readNotifications.includes(n.id) && !isRespondida && (
                                                                <FiberManualRecordIcon sx={{ fontSize: 10, color: 'blue' }} />
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    </Box>
                                </Fade>
                            );
                        })
                    )}
                </List>
            </Paper>
            <Dialog
                open={canOpenCard(selectedNotification)}
                onClose={() => setSelectedNotification(null)}
                slots={{ transition: Slide }}
                slotProps={{ transition: { direction: 'up' } }}
                keepMounted
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton onClick={() => setSelectedNotification(null)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {selectedNotification &&
                        canOpenCard(selectedNotification) && (
                            <SolicitacaoCard
                                tipo={selectedNotification.tipo as 'Corretor' | 'Imobiliaria'}
                                resumo={selectedNotification.resumo}
                                nome={selectedNotification.tipo === 'Corretor' ? selectedNotification.nomeUsuario : undefined}
                                email={selectedNotification.tipo === 'Corretor' ? selectedNotification.emailUsuario : undefined}
                                razaoSocial={selectedNotification.tipo === 'Imobiliaria' && 'nomeImobiliaria' in selectedNotification ? (selectedNotification as { nomeImobiliaria?: string }).nomeImobiliaria : undefined}
                                creciSolicitado={selectedNotification.creciSolicitado}
                                cnpj={selectedNotification.cnpj}
                                imagemUrl={selectedNotification.imagemUrl}
                                onAprovar={async () => {
                                    const tipo = selectedNotification.tipo.toLowerCase() as 'corretor' | 'imobiliaria';
                                    mutation.mutate({ id: selectedNotification.id, tipo, aprovada: true });
                                    setSelectedNotification(null);
                                }}
                                onReprovar={async () => {
                                    const tipo = selectedNotification.tipo.toLowerCase() as 'corretor' | 'imobiliaria';
                                    mutation.mutate({ id: selectedNotification.id, tipo, aprovada: false });
                                    setSelectedNotification(null);
                                }}
                            />
                        )}
                </Box>
            </Dialog>
            {/* Snackbar para feedback visual ao arquivar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMsg}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};

export default InboxNotifications;
