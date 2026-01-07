import { Search } from '@mui/icons-material';
import { IconButton, InputBase, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search...', initialValue = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, onSearch]);

    return (
        <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
            elevation={0}
            variant="outlined"
            onSubmit={(e) => { e.preventDefault(); onSearch(searchTerm); }}
        >
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={placeholder}
                inputProps={{ 'aria-label': 'search properties' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={() => onSearch(searchTerm)}>
                <Search />
            </IconButton>
        </Paper>
    );
};

export default SearchBar;
