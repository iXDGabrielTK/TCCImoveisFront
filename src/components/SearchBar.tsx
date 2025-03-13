import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { styled } from '@mui/material/styles';

const SearchContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    marginRight: '0.2%',
});

const SearchIconButton = styled(IconButton)({
    backgroundColor: '#fff',
    borderRadius: '50%',
    padding: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        backgroundColor: '#e0e0e0',
    },
});

const AnimatedInput = styled(InputBase)<{ open: boolean }>(({ theme, open }) => ({
    position: 'absolute',
    right: 0,
    width: open ? '200px' : '0px',
    opacity: open ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity'], {
        duration: theme.transitions.duration.short,
        easing: theme.transitions.easing.easeInOut,
    }),
    borderBottom: open ? `1px solid ${theme.palette.divider}` : 'none',
    padding: '4px 8px',
    borderRadius: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontSize: '1rem',
    '&::placeholder': {
        color: '#aaa',
    },
}));

const debounce = (func: (term: string) => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (term: string) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(term);
        }, delay);
    };
};

const SearchBar = () => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useRef(debounce((term: string) => {
        console.log('Searching for:', term);
        // Add your search logic here
    }, 500)).current;

    useEffect(() => {
        if (searchTerm) {
            debouncedSearch(searchTerm);
        }
    }, [searchTerm, debouncedSearch]);

    const handleClear = () => {
        setSearchTerm('');
    };

    const handleToggle = () => {
        setOpen((prev) => !prev);
        if (open) {
            setSearchTerm('');
        }
    };

    return (
        <SearchContainer>
            <SearchIconButton onClick={handleToggle}>
                <SearchIcon />
            </SearchIconButton>
            <AnimatedInput
                open={open}
                placeholder="Pesquisando..."
                inputProps={{ 'aria-label': 'pesquisar' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {open && searchTerm && (
                <IconButton onClick={handleClear} style={{ position: 'absolute', right: '210px' }}>
                    <ClearIcon />
                </IconButton>
            )}
        </SearchContainer>
    );
};

export default SearchBar;