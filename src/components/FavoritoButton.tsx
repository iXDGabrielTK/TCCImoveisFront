import { IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useFavoritos } from '../hooks/useFavoritos';

interface Props {
    idImovel: number;
    onToggle?: () => void;
}

const FavoritoButton: React.FC<Props> = ({ idImovel, onToggle }) => {
    const { isFavoritado, favoritar, desfavoritar } = useFavoritos();
    const favorito = isFavoritado(idImovel);

    const toggleFavorito = async () => {
        try {
            if (favorito) {
                await desfavoritar(idImovel);
            } else {
                await favoritar(idImovel);
            }

            if (onToggle) onToggle();
        } catch (error) {
            console.error("Erro ao alternar favorito", error);
        }
    };

    return (
        <IconButton onClick={toggleFavorito} color="primary">
            {favorito ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
    );
};

export default FavoritoButton;
