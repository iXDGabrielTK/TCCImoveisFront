import { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import api from '../services/api'; // ajuste o caminho se necessário

interface Props {
    idImovel: number;
}

const FavoritoButton = ({ idImovel }: Props) => {
    const [favoritado, setFavoritado] = useState<boolean>(false);
    const [carregando, setCarregando] = useState<boolean>(true);

    useEffect(() => {
        api.get('/favoritos')
            .then((res) => {
                const idsFavoritados = res.data.map((f: { idImovel: number }) => f.idImovel);
                setFavoritado(idsFavoritados.includes(idImovel));
            })
            .catch((err) => {
                console.error('Erro ao buscar favoritos:', err);
            })
            .finally(() => {
                setCarregando(false);
            });
    }, [idImovel]);

    const alternarFavorito = () => {
        setCarregando(true);
        if (favoritado) {
            api.delete(`/favoritos/${idImovel}`)
                .then(() => setFavoritado(false))
                .catch((err) => console.error('Erro ao desfavoritar:', err))
                .finally(() => setCarregando(false));
        } else {
            api.post(`/favoritos/${idImovel}`)
                .then(() => setFavoritado(true))
                .catch((err) => console.error('Erro ao favoritar:', err))
                .finally(() => setCarregando(false));
        }
    };

    return (
        <IconButton
            onClick={(e) => {
                e.stopPropagation();
                alternarFavorito();
            }}
            disabled={carregando}
            sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.5)',
                boxShadow: 1,
                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.8)',
                },
            }}
        >
            {favoritado ? <FavoriteIcon color="error" fontSize="medium" /> : <FavoriteBorderIcon fontSize="medium" />}
        </IconButton>
    );
};

export default FavoritoButton;
