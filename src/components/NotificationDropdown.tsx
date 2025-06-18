import React, { useState } from "react";
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    CircularProgress, Box, Chip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import { useMediaQuery, useTheme } from "@mui/material";

const tipoLabel = {
    Proposta: "Nova proposta recebida",
    Agendamento: "Agendamento solicitado",
    Corretor: "Solicitação de corretor",
    Imobiliaria: "Solicitação de imobiliária",
    Sistema: "Aviso do sistema"
};

const chipColor = {
    Proposta: "success",
    Agendamento: "info",
    Corretor: "primary",
    Imobiliaria: "warning",
    Sistema: "default"
};

export default function NotificationDropdown() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const { data, isLoading } = useNotifications();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const notificacoesNaoLidas = data?.filter((n) => !n.lida) || [];

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleClickNotificacao = (notificacao: any) => {
        handleClose();
        if (notificacao.link) navigate(notificacao.link);
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={notificacoesNaoLidas.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                container={document.body}
                disableScrollLock
                sx={{
                    '& .MuiPaper-root': {
                        width: isMobile ? '100vw' : 320,
                        maxHeight: 400,
                        overflowY: 'auto',
                        mt: 3,
                        boxShadow: 3,
                        backgroundColor: '#fff',
                        borderRadius: isMobile ? 0 : 2,
                        zIndex: 2000,
                        px: isMobile ? 2 : 0,
                    }
                }}

                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >

                {isLoading ? (
                    <MenuItem>
                        <CircularProgress size={20} sx={{ mr: 2 }} />
                        <Typography variant="body2">Carregando...</Typography>
                    </MenuItem>
                ) : data?.length === 0 ? (
                    <MenuItem>
                        <Typography variant="body2">Sem notificações</Typography>
                    </MenuItem>
                ) : (
                    data?.slice(0, 5).map((n) => (
                        <MenuItem
                            key={n.id}
                            onClick={() => handleClickNotificacao(n)}
                            sx={{
                                backgroundColor: !n.lida ? "#f0f4ff" : "inherit",
                                borderLeft: !n.lida ? "4px solid #1976d2" : "4px solid transparent",
                                "&:hover": { backgroundColor: "#e3f2fd" },
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                px: 2,
                                py: 1.5,
                                gap: 0.5
                            }}
                        >
                            <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    noWrap
                                    sx={{ mr: 1 }}
                                >
                                    {n.titulo || tipoLabel[n.tipo] || n.tipo}
                                </Typography>
                                <Chip
                                    label={n.tipo}
                                    size="small"
                                    variant="outlined"
                                    color={chipColor[n.tipo] as 'success' | 'info' | 'primary' | 'warning' | 'default'}
                                    sx={{ fontWeight: 500 }}
                                />
                            </Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                                sx={{ maxWidth: '100%' }}
                            >
                                {n.resumo || n.mensagem}
                            </Typography>
                        </MenuItem>
                    ))
                )}

                <MenuItem
                    onClick={() => {
                        handleClose();
                        navigate("/inbox");
                    }}
                    sx={{ justifyContent: "center", color: "primary.main" }}
                >
                    Ver todas
                </MenuItem>
            </Menu>
        </>
    );
}