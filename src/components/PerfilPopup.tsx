import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    CircularProgress,
    IconButton,
    Box,
    Avatar,
    Alert
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Close as CloseIcon, Person as PersonIcon, Save as SaveIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface UserProfile {
    id: number;
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    tipo_usuario: string;
}

interface PerfilPopupProps {
    onClose: () => void;
}

const PerfilPopup: React.FC<PerfilPopupProps> = ({ onClose }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = localStorage.getItem("usuario_Id");
                if (!userId) {
                    console.error("ID do usuário não encontrado no localStorage.");
                    setError("ID do usuário não encontrado. Por favor, faça login novamente.");
                    return;
                }

                const response = await api.get(`/usuarios/${userId}`);
                setUser(response.data);
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
                setError("Erro ao carregar dados do usuário. Por favor, tente novamente.");
            } finally {
                setLoading(false);
            }
        };

        void fetchUser();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserProfile) => {
        const value = e.target.value;
        setUser((prev) => (prev ? { ...prev, [field]: value } : null));
        // Reset success message when a user makes changes
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);
            if (user) {
                const payload = {
                    tipo: user.tipo_usuario || "visitante",
                    nome: user.nome,
                    telefone: user.telefone,
                    email: user.email,
                    senha: user.senha,
                };

                const response = await api.put(`/usuarios/${user.id}`, payload);
                console.log("Alterações salvas com sucesso:", response.data);
                setSaveSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            setError("Erro ao salvar alterações. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
    };

    const handleDeleteCancel = () => {
        setOpenDeleteDialog(false);
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            if (user) {
                await api.delete(`/usuarios/${user.id}`);
                localStorage.removeItem("usuario_Id");
                setOpenDeleteDialog(false);
                onClose();
            }
        } catch (error) {
            console.error("Erro ao excluir conta:", error);
            setError("Erro ao excluir conta. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Main Profile Dialog */}
            <Dialog 
                open={true} 
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    bgcolor: '#f8f9fa',
                    borderBottom: '1px solid #e0e0e0',
                    py: 2
                }}>
                    <Typography variant="h5" component="div" fontWeight="bold">
                        Meu Perfil
                    </Typography>
                    <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, mt: 1 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    ) : user ? (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }} display="flex" justifyContent="center" mb={2}>
                                <Avatar 
                                    sx={{ 
                                        width: 80, 
                                        height: 80, 
                                        bgcolor: 'primary.main',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <PersonIcon sx={{ fontSize: 40 }} />
                                </Avatar>
                            </Grid>

                            {saveSuccess && (
                                <Grid size={{ xs: 12 }}>
                                    <Alert severity="success">Alterações salvas com sucesso!</Alert>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Nome"
                                    variant="outlined"
                                    value={user.nome}
                                    onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, "nome")}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Telefone"
                                    variant="outlined"
                                    value={user.telefone}
                                    onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, "telefone")}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    variant="outlined"
                                    value={user.email}
                                    onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, "email")}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Nova Senha (opcional)"
                                    type="password"
                                    variant="outlined"
                                    value={user.senha}
                                    onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, "senha")}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="error">Erro ao carregar dados do usuário.</Alert>
                    )}
                </DialogContent>

                {user && !loading && (
                    <DialogActions sx={{ 
                        p: 3, 
                        pt: 0,
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={handleDeleteClick}
                            startIcon={<DeleteIcon />}
                            sx={{ 
                                borderRadius: 2,
                                px: 3
                            }}
                        >
                            Excluir Conta
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleSave}
                            startIcon={<SaveIcon />}
                            disabled={loading}
                            sx={{ 
                                borderRadius: 2,
                                px: 3
                            }}
                        >
                            Salvar Alterações
                        </Button>
                    </DialogActions>
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        maxWidth: '400px'
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" component="div" fontWeight="bold" color="error">
                        Confirmar Exclusão
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Typography variant="body1" id="alert-dialog-description" sx={{ mb: 1 }}>
                        Tem certeza de que deseja excluir sua conta?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Esta ação não pode ser desfeita e todos os seus dados serão removidos permanentemente.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={handleDeleteCancel} 
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        color="error" 
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        autoFocus
                        sx={{ borderRadius: 2 }}
                    >
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PerfilPopup;
