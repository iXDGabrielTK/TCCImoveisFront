import { useState, useEffect } from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useImoveisContext } from '../context/ImoveisContext';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.05),
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.black, 0.08),
    },
    margin: '1rem auto',
    width: '90%',
    maxWidth: 600,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.grey[700],
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1.2, 1, 1.2, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        paddingRight: theme.spacing(5),
        fontSize: '1rem',
    },
}));


const SearchBar = () => {
    const { setTermoBusca } = useImoveisContext();
    const [termoLocal, setTermoLocal] = useState('');

    useEffect(() => {
        const delay = setTimeout(() => {
            setTermoBusca(termoLocal.trim());
        }, 300);
        return () => clearTimeout(delay);
    }, [setTermoBusca, termoLocal]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const elementoAtivo = document.activeElement;
            const tagAtual = elementoAtivo?.tagName.toLowerCase();

            if (e.key === '/' && tagAtual !== 'input' && tagAtual !== 'textarea') {
                e.preventDefault();
                document.getElementById('campo-busca')?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Search>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                placeholder="Buscar imóvel..."
                value={termoLocal}
                onChange={(e) => setTermoLocal(e.target.value)}
                inputProps={{ 'aria-label': 'search', id: 'campo-busca' }}
                endAdornment={
                    termoLocal && (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setTermoLocal('')}
                                edge="end"
                                size="small"
                                sx={{
                                    color: 'grey.600',
                                    p: 2.5,
                                    ml: 0.5,
                                    borderRadius: '20%',
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.04)',
                                    },
                                }}
                            >
                                <CloseIcon fontSize="medium" />
                            </IconButton>
                        </InputAdornment>
                    )
                }
            />
        </Search>
    );
};

export default SearchBar;