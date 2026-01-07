import { Remove, TrendingDown, TrendingUp } from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';
import React from 'react';

interface KpiCardProps {
    change?: number;
    label: string;
    trend?: 'down' | 'neutral' | 'up';
    value: number | string;
}

const KpiCard: React.FC<KpiCardProps> = ({ change, label, trend, value }) => {
    const isUp = trend === 'up';
    const isDown = trend === 'down';
    const trendColor = isUp ? 'text-emerald-600' : isDown ? 'text-rose-600' : 'text-slate-400';
    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Remove;

    return (
        <Paper className="p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
            <Typography variant="body2" className="text-slate-500 font-medium">{label}</Typography>
            <div>
                <Typography variant="h4" className="font-bold text-slate-900 mb-1">{value}</Typography>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
                        <Icon fontSize="inherit" />
                        <span>{Math.abs(change)}% from last period</span>
                    </div>
                )}
            </div>
        </Paper>
    );
};

export default KpiCard;
