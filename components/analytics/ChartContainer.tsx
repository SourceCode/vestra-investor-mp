import React from 'react';
import { Paper, Typography } from '@mui/material';

interface ChartContainerProps {
    title: string;
    children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => {
    return (
        <Paper className="p-6 rounded-xl border border-slate-200 h-96 flex flex-col">
            <Typography variant="h6" className="font-bold text-slate-800 mb-6">{title}</Typography>
            <div className="flex-grow w-full min-h-0">
                {children}
            </div>
        </Paper>
    );
};

export default ChartContainer;
