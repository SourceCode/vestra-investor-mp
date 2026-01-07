import React from 'react';
import { Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
    title = "Unable to load data", 
    message = "There was a problem loading this section. Please try again.", 
    onRetry 
}) => {
    return (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <Typography variant="subtitle1" className="font-bold text-slate-900 mb-1">{title}</Typography>
            <Typography variant="body2" className="text-slate-500 mb-4">{message}</Typography>
            {onRetry && (
                <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Refresh />} 
                    onClick={onRetry}
                >
                    Retry
                </Button>
            )}
        </div>
    );
};

export default ErrorState;
