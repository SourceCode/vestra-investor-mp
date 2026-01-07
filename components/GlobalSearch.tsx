import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, InputAdornment, Paper, Typography, Box } from '@mui/material';
import { Search, History, Business, Person, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const GlobalSearch: React.FC = () => {
    const navigate = useNavigate();
    const { list: properties } = useSelector((state: RootState) => state.properties);
    const { investors } = useSelector((state: RootState) => state.agent);
    const { user } = useSelector((state: RootState) => state.auth);
    const isAgent = user?.role === 'ADMIN';

    // Mock recent searches
    const [recentSearches] = useState(['Los Angeles', 'Multi Family', 'Fixer']);

    const options = [
        ...recentSearches.map(s => ({ label: s, type: 'Recent', id: s })),
        ...properties.map(p => ({ label: p.address, type: 'Property', id: p.id })),
        ...(isAgent ? investors.map(i => ({ label: `${i.firstName} ${i.lastName}`, type: 'Investor', id: i.id })) : [])
    ];

    const handleChange = (event: any, value: any) => {
        if (!value) return;
        
        if (value.type === 'Property') {
            navigate(`/property/${value.id}`);
        } else if (value.type === 'Investor') {
            navigate('/agent/investors'); // In real app would filter or go to detail
        } else if (value.type === 'Recent') {
            navigate('/browse'); // Would pass query params
        }
    };

    return (
        <div className="w-full max-w-lg">
            <Autocomplete
                freeSolo
                options={options}
                groupBy={(option) => option.type}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                onChange={handleChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search properties, investors, deals..."
                        variant="outlined"
                        size="small"
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search className="text-slate-400" />
                                </InputAdornment>
                            ),
                            className: "bg-slate-100 border-none rounded-lg"
                        }}
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                        }}
                    />
                )}
                renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                        <Box component="li" key={key} {...otherProps} className="hover:bg-slate-50 py-2 px-4 cursor-pointer">
                            <div className="flex items-center gap-3">
                                {option.type === 'Recent' && <History fontSize="small" className="text-slate-400" />}
                                {option.type === 'Property' && <Business fontSize="small" className="text-slate-400" />}
                                {option.type === 'Investor' && <Person fontSize="small" className="text-slate-400" />}
                                
                                <div>
                                    <Typography variant="body2" className="font-medium text-slate-900">{option.label}</Typography>
                                    <Typography variant="caption" className="text-slate-500 uppercase text-[10px] tracking-wider">{option.type}</Typography>
                                </div>
                            </div>
                        </Box>
                    );
                }}
            />
        </div>
    );
};

export default GlobalSearch;
