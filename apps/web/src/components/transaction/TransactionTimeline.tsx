import { Business, CheckCircle, Computer, Person } from '@mui/icons-material';
import { Chip, Step, StepContent, StepLabel, Stepper, Typography, CircularProgress } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { Property, TransactionRole, TransactionStep, TransactionStepStatus } from '../../types';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../contexts/ToastContext';

interface TransactionTimelineProps {
    property: Property;
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ property }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAgent = user?.role === 'ADMIN'; // Or check against assignedAgentId
    const { showToast } = useToast();
    const utils = trpc.useContext();

    const { data: steps = [], isLoading } = trpc.transaction.byDeal.useQuery({ dealId: property.id });

    const updateStep = trpc.transaction.updateStep.useMutation({
        onSuccess: () => {
            utils.transaction.byDeal.invalidate({ dealId: property.id });
            showToast('Step updated successfully', 'success');
        },
        onError: (err) => {
            showToast(`Failed to update step: ${err.message}`, 'error');
        }
    });

    const handleStepClick = (step: TransactionStep) => {
        if (!isAgent && step.assignedTo !== 'INVESTOR') return;
        if (!isAgent && step.status === TransactionStepStatus.COMPLETE) return;

        // Toggle logic (Simple)
        const newStatus = step.status === TransactionStepStatus.COMPLETE
            ? TransactionStepStatus.PENDING
            : TransactionStepStatus.COMPLETE;

        updateStep.mutate({ id: step.id, status: newStatus });
    };

    const getOwnerIcon = (role: string) => {
        switch (role) {
            case 'AGENT': return <Business fontSize="inherit" />;
            case 'INVESTOR': return <Person fontSize="inherit" />;
            case 'SYSTEM': return <Computer fontSize="inherit" />;
            default: return null;
        }
    };

    const getOwnerLabel = (role: TransactionStep['assignedTo']) => {
        switch (role) {
            case 'AGENT': return 'Agent';
            case 'INVESTOR': return 'You';
            case 'SELLER': return 'Seller';
            case 'SYSTEM': return 'Automated';
            default: return role;
        }
    };

    return (
        <div className="py-2">
            <Typography variant="h6" className="font-bold mb-6 text-slate-900">Closing Timeline</Typography>
            <Stepper orientation="vertical" connector={<div className="ml-2.5 w-0.5 h-full bg-slate-200" />}>
                {steps.map((step, index) => (
                    <Step key={step.id} active={true} expanded={true}>
                        <StepLabel
                            icon={
                                step.status === 'COMPLETE'
                                    ? <CheckCircle className="text-emerald-500" />
                                    : <div className={`w-5 h-5 rounded-full border-2 ${step.status === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`} />
                            }
                            className={'cursor-pointer group py-0'}
                            onClick={() => handleStepClick(step)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <Typography variant="subtitle2" className={step.status === 'COMPLETE' ? 'line-through text-slate-400' : 'font-semibold text-slate-800'}>
                                        {step.label}
                                    </Typography>
                                </div>
                                <div className="flex items-center gap-2">
                                    {step.status === 'COMPLETE' && step.completedAt && (
                                        <span className="text-[10px] text-slate-400 hidden sm:block">
                                            {new Date(step.completedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                    <Chip
                                        size="small"
                                        label={getOwnerLabel(step.assignedTo)}
                                        icon={getOwnerIcon(step.assignedTo) as any}
                                        className={`h-5 text-[10px] font-medium ${step.assignedTo === 'INVESTOR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
                                    />
                                </div>
                            </div>
                        </StepLabel>
                        <StepContent className="border-l-2 border-slate-200 ml-2.5 pl-6 pb-6">
                            {/* Optional notes or context can go here */}
                            {step.status === 'IN_PROGRESS' && (
                                <Typography variant="caption" className="text-blue-600 font-medium block mt-1">
                                    In Progress
                                </Typography>
                            )}
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </div>
    );
};

export default TransactionTimeline;
