import { Chip } from '@mui/material';
import React from 'react';

import { DealStatus } from '../types';

interface DealStatusChipProps {
    size?: 'medium' | 'small';
    status: DealStatus;
}

const DealStatusChip: React.FC<DealStatusChipProps> = ({ size = 'small', status }) => {
    let color: 'default' | 'error' | 'info' | 'primary' | 'secondary' | 'success' | 'warning' = 'default';
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
