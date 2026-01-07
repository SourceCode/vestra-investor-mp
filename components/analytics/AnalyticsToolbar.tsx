import React from 'react';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { TimeRange } from '../../types';

interface AnalyticsToolbarProps {
    title: string;
    timeRange: TimeRange;
    onChangeRange: (range: TimeRange) => void;
}

const AnalyticsToolbar: React.FC<AnalyticsToolbarProps> = ({ title, timeRange, onChangeRange }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
            <div>
                <Typography variant="h4" className="font-bold text-slate-900">{title}</Typography>
                <Typography className="text-slate-500">Performance metrics and insights.</Typography>
            </div>
            <ToggleButtonGroup 
                value={timeRange} 
                exclusive 
                onChange={(e, val) => val && onChangeRange(val)}
                size="small"
                className="bg-white"
            >
                <ToggleButton value="7d">7 Days</ToggleButton>
                <ToggleButton value="30d">30 Days</ToggleButton>
                <ToggleButton value="90d">90 Days</ToggleButton>
                <ToggleButton value="all">All Time</ToggleButton>
            </ToggleButtonGroup>
        </div>
    );
};

export default AnalyticsToolbar;
