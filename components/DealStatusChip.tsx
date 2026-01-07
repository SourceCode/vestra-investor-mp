import React from 'react';
import { Chip } from '@mui/material';
import { DealStatus } from '../types';

interface DealStatusChipProps {
    status: DealStatus;
    size?: 'small' | 'medium';
}

const DealStatusChip: React.FC<DealStatusChipProps> = ({ status, size = 'small' }) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let label = status.replace('_', ' ');

    switch (status) {
        case 'PUBLISHED':
            color = 'secondary';
            label = 'Active';
            break;
        case 'INTERESTED':
            color = 'info';
            break;
        case 'OFFER_SUBMITTED':
            color = 'warning';
            label = 'Offer Pending';
            break;
        case 'OFFER_ACCEPTED':
            color = 'success';
            label = 'Offer Accepted';
            break;
        case 'UNDER_CONTRACT':
            color = 'primary';
            break;
        case 'CLOSED':
            color = 'default';
            break;
        case 'CANCELLED':
            color = 'error';
            break;
    }

    return (
        <Chip 
            label={label} 
            color={color} 
            size={size} 
            className="font-bold shadow-sm"
        />
    );
};

export default DealStatusChip;
