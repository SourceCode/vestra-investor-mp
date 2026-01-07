import { Popover, Typography } from '@mui/material';
import React from 'react';

interface ColorPickerProps {
    color: string;
    label: string;
    onChange: (color: string) => void;
}

const colors = [
    '#0f172a', '#1e293b', '#334155', // Slates
    '#14b8a6', '#0d9488', '#0f766e', // Teals
    '#2563eb', '#1d4ed8', '#1e40af', // Blues
    '#7c3aed', '#6d28d9', '#5b21b6', // Violets
    '#db2777', '#be185d', '#9d174d', // Pinks
    '#e11d48', '#be123c', '#9f1239', // Roses
    '#d97706', '#b45309', '#92400e', // Ambers
    '#059669', '#047857', '#065f46', // Emeralds
];

const ColorPicker: React.FC<ColorPickerProps> = ({ color, label, onChange }) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <div>
            <Typography variant="caption" className="text-slate-500 mb-1 block font-semibold">{label}</Typography>
            <button 
                onClick={handleClick}
                className="w-full h-10 rounded-lg border border-slate-200 flex items-center px-3 gap-3 bg-white hover:bg-slate-50 transition-colors"
            >
                <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                <span className="text-sm font-mono text-slate-600 uppercase">{color}</span>
            </button>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                <div className="p-3 grid grid-cols-6 gap-2 w-64">
                    {colors.map(c => (
                        <div 
                            key={c}
                            className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform border border-black/10 ${color === c ? 'ring-2 ring-offset-1 ring-slate-900' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => { onChange(c); handleClose(); }}
                        />
                    ))}
                </div>
            </Popover>
        </div>
    );
};

export default ColorPicker;
