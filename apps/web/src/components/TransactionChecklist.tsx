import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { CircularProgress, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store';
import { Property } from '../types';
import { trpc } from '../utils/trpc';
import { useToast } from '../contexts/ToastContext';
import { TransactionStepStatus } from '../types';

interface TransactionChecklistProps {
    property: Property;
}

const TransactionChecklist: React.FC<TransactionChecklistProps> = ({ property }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAgent = user?.role === 'ADMIN';
    const { showToast } = useToast();
    const utils = trpc.useContext();

    const { data: steps = [], isLoading } = trpc.transaction.byDeal.useQuery({ dealId: property.id });

    const updateStep = trpc.transaction.updateStep.useMutation({
        onSuccess: () => {
            utils.transaction.byDeal.invalidate({ dealId: property.id });
            showToast('Checklist updated', 'success');
        },
        onError: (err) => {
            showToast(`Error: ${err.message}`, 'error');
        }
    });

    const handleStepClick = (stepId: string, currentStatus: string) => {
        if (!isAgent) return;
        const newStatus = currentStatus === TransactionStepStatus.COMPLETE
            ? TransactionStepStatus.PENDING
            : TransactionStepStatus.COMPLETE;

        updateStep.mutate({ id: stepId, status: newStatus });
    };

    if (isLoading) return <CircularProgress size={20} />;

    return (
        <Paper className="p-6 rounded-xl border border-slate-200">
            <Typography variant="h6" className="font-bold mb-4">Transaction Timeline</Typography>
            <Stepper orientation="vertical">
                {steps.map((step) => (
                    <Step key={step.id} active={true} expanded={true}>
                        <StepLabel
                            icon={step.status === TransactionStepStatus.COMPLETE ? <CheckCircle className="text-emerald-500" /> : <RadioButtonUnchecked className="text-slate-300" />}
                            className="cursor-pointer"
                            onClick={() => handleStepClick(step.id, step.status)}
                        >
                            <div className="flex items-center gap-3">
                                <Typography variant="subtitle2" className={step.status === TransactionStepStatus.COMPLETE ? 'line-through text-slate-400' : 'font-semibold'}>
                                    {step.label}
                                </Typography>
                                {step.status === TransactionStepStatus.COMPLETE && step.completedAt && (
                                    <span className="text-xs text-slate-400">
                                        {new Date(step.completedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
            {!isAgent && (
                <Typography variant="caption" className="text-slate-400 mt-4 block">
                    * Milestones are updated by your agent/coordinator.
                </Typography>
            )}
        </Paper>
    );
};

export default TransactionChecklist;
