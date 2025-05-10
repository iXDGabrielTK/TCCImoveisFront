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
import {
    Close as CloseIcon,
    Person as PersonIcon,
    Save as SaveIcon,
    Delete as DeleteIcon
} from "@mui/icons-material";
import axios from "axios";

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
    const [userOriginal, setUserOriginal] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creci, setCreci] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = localStorage.getItem("usuario_Id");
                if (!userId) {
                    setError("ID do usuário não encontrado. Faça login novamente.");
                    return;
                }
                const response = await api.get(`/usuarios/${userId}`);
                setUser(response.data);
                setUserOriginal(response.data);
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
                setError("Erro ao carregar dados do usuário.");
            } finally {
                setLoading(false);
            }
        };
        void fetchUser();
    }, []);

    const houveAlteracao =
        (user && userOriginal &&
            (
                user.nome !== userOriginal.nome ||
                user.email !== userOriginal.email ||
                user.telefone !== userOriginal.telefone ||
                (user.senha && user.senha.trim().length > 0)
            )) ||
        creci.trim() !== "";

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: keyof UserProfile
    ) => {
        const value = e.target.value;
        setUser((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const handleSave = async () => {
        try {
            if (!user || !userOriginal) return;
            setLoading(true);
            setError(null);

            const userId = user.id;
            const creciTrimmed = creci.trim();
            const usuarioFoiModificado =
                user.nome !== userOriginal.nome ||
                user.email !== userOriginal.email ||
                user.telefone !== userOriginal.telefone ||
                (user.senha && user.senha.trim().length > 0);

            // Atualizar usuário
            if (usuarioFoiModificado) {
                const payload: {
                    tipo: string;
                    nome: string;
                    telefone: string;
                    email: string;
                    senha?: string;
                } = {
                    tipo: user.tipo_usuario || "visitante",
                    nome: user.nome,
                    telefone: user.telefone,
                    email: user.email,
                };

                if (user.senha && user.senha.trim().length > 0) {
                    payload.senha = user.senha;
                }

                await api.put(`/usuarios/${userId}`, payload);
            }

            // Candidatura para corretor
            if (creciTrimmed) {
                let jaEhCorretor = false;
                try {
                    const { data: corretor } = await api.get(`/corretores/usuario/${userId}`);
                    jaEhCorretor = !!corretor;
                } catch (err: unknown) {
                    if (axios.isAxiosError(err) && err.response?.status !== 404) {
                        console.error("Erro ao verificar se já é corretor:", err);
                        setError("Erro ao verificar se já é corretor.");
                        return;
                    }
                }

                if (!jaEhCorretor) {
                    await api.post("/corretores/candidatura", {
                        usuarioId: userId.toString(),
                        creci: creciTrimmed
                    });
                }
            }

            onClose();
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            setError("Erro ao salvar alterações.");
        } finally {
            setLoading(false);
        }
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
            setError("Erro ao excluir conta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight="bold">Meu Perfil</Typography>
                        <IconButton onClick={onClose}><CloseIcon /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : user ? (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }} display="flex" justifyContent="center" mb={2}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                                    <PersonIcon sx={{ fontSize: 40 }} />
                                </Avatar>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Nome" value={user.nome} onChange={(e) => handleInputChange(e, "nome")} />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Telefone" value={user.telefone} onChange={(e) => handleInputChange(e, "telefone")} />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Email" value={user.email} onChange={(e) => handleInputChange(e, "email")} />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth type="password" label="Nova Senha (opcional)" value={user.senha} onChange={(e) => handleInputChange(e, "senha")} />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="CRECI (somente se quiser ser corretor)" value={creci} onChange={(e) => setCreci(e.target.value)} />
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="error">Erro ao carregar dados do usuário.</Alert>
                    )}
                </DialogContent>
                {user && !loading && (
                    <DialogActions sx={{ px: 3, pb: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="outlined" color="error" onClick={() => setOpenDeleteDialog(true)} startIcon={<DeleteIcon />}>Excluir Conta</Button>
                        <Button variant="contained" color="primary" onClick={handleSave} startIcon={<SaveIcon />} disabled={!houveAlteracao || loading}>
                            Salvar Alterações
                        </Button>
                    </DialogActions>
                )}
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold" color="error">Confirmar Exclusão</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography>Tem certeza de que deseja excluir sua conta?</Typography>
                    <Typography variant="body2" color="text.secondary">Essa ação é irreversível.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>Excluir</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PerfilPopup;