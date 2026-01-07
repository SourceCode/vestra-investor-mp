import { CheckCircleOutline } from '@mui/icons-material';
import { Alert, Box, Button, Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { Property } from '../../types';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../contexts/ToastContext';
import DocumentManager from './DocumentManager';
import ContractSection from './ContractSection';
import ServicePanel from './ServicePanel';
import TransactionTimeline from './TransactionTimeline';

interface TransactionWorkspaceProps {
    property: Property;
}

const TransactionWorkspace: React.FC<TransactionWorkspaceProps> = ({ property }) => {
    const isClosed = property.status === 'CLOSED';
    const { user } = useSelector((state: RootState) => state.auth);
    const isAgent = user?.role === 'ADMIN';
    const { showToast } = useToast();
    const utils = trpc.useContext();

    const { data: steps = [] } = trpc.transaction.byDeal.useQuery({ dealId: property.id });
    // In a real app we'd also check contracts here, but for now we rely on the button action triggering backend validation

    // Check if checks are complete (simple frontend check for disabling)
    const allStepsComplete = steps.length > 0 && steps.every(s => s.status === 'COMPLETE');

    const closeDeal = trpc.transaction.closeDeal.useMutation({
        onSuccess: () => {
            utils.transaction.byDeal.invalidate({ dealId: property.id });
            // Invalidate property details to reflect CLOSED status
            // utils.marketplace.getListing.invalidate({ id: property.id }); 
            showToast('Deal closed successfully!', 'success');
            // Force reload/redirect could go here
            window.location.reload();
        },
        onError: (err) => {
            showToast(`Failed to close deal: ${err.message}`, 'error');
        }
    });

    const handleCloseDeal = () => {
        if (!confirm('Are you sure you want to close this deal? This action cannot be undone.')) return;
        closeDeal.mutate({ dealId: property.id });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                {isClosed && (
                    <Alert
                        icon={<CheckCircleOutline fontSize="inherit" />}
                        severity="success"
                        className="flex-grow mr-4 rounded-xl border border-green-200 bg-green-50"
                    >
                        <Typography variant="subtitle1" className="font-bold text-green-900">
                            Transaction Closed Successfully!
                        </Typography>
                        This deal is complete. All documents are finalized and stored below.
                    </Alert>
                )}

                {!isClosed && isAgent && (
                    <div className="ml-auto">
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={!allStepsComplete || closeDeal.isPending}
                            onClick={handleCloseDeal}
                        >
                            {closeDeal.isPending ? 'Closing...' : 'Finalize Closing'}
                        </Button>
                    </div>
                )}
            </div>

            <Grid container spacing={6}>
                {/* Left Column: Timeline */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper className="p-6 rounded-xl border border-slate-200 sticky top-24">
                        <TransactionTimeline property={property} />
                    </Paper>
                </Grid>

                {/* Right Column: Docs & Services */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <div className="space-y-8">
                        <ContractSection property={property} />
                        <DocumentManager property={property} />
                        <ServicePanel property={property} />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default TransactionWorkspace;
