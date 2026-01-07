import React from 'react';
import { Grid, Paper, Typography, Box, Alert } from '@mui/material';
import TransactionTimeline from './TransactionTimeline';
import DocumentManager from './DocumentManager';
import ServicePanel from './ServicePanel';
import { Property } from '../../types';
import { CheckCircleOutline } from '@mui/icons-material';

interface TransactionWorkspaceProps {
    property: Property;
}

const TransactionWorkspace: React.FC<TransactionWorkspaceProps> = ({ property }) => {
    const isClosed = property.status === 'CLOSED';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isClosed && (
                <Alert 
                    icon={<CheckCircleOutline fontSize="inherit" />} 
                    severity="success" 
                    className="mb-6 rounded-xl border border-green-200 bg-green-50"
                >
                    <Typography variant="subtitle1" className="font-bold text-green-900">
                        Transaction Closed Successfully!
                    </Typography>
                    This deal is complete. All documents are finalized and stored below.
                </Alert>
            )}

            <Grid container spacing={6}>
                {/* Left Column: Timeline */}
                <Grid item xs={12} md={4}>
                    <Paper className="p-6 rounded-xl border border-slate-200 sticky top-24">
                        <TransactionTimeline property={property} />
                    </Paper>
                </Grid>

                {/* Right Column: Docs & Services */}
                <Grid item xs={12} md={8}>
                    <div className="space-y-8">
                        <DocumentManager property={property} />
                        <ServicePanel property={property} />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default TransactionWorkspace;
