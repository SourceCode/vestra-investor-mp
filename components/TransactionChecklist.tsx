import React from 'react';
import { Stepper, Step, StepLabel, StepContent, Typography, Button, Paper, Chip } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, updateStepRequest } from '../store';
import { Property } from '../types';

interface TransactionChecklistProps {
    property: Property;
}

const TransactionChecklist: React.FC<TransactionChecklistProps> = ({ property }) => {
    const dispatch = useDispatch();
    const { steps } = useSelector((state: RootState) => state.transaction);
    const { user } = useSelector((state: RootState) => state.auth);
    const isAgent = user?.role === 'ADMIN';

    const handleStepClick = (stepId: string) => {
        if (!isAgent) return;
        dispatch(updateStepRequest({ propertyId: property.id, stepId }));
    };

    return (
        <Paper className="p-6 rounded-xl border border-slate-200">
            <Typography variant="h6" className="font-bold mb-4">Transaction Timeline</Typography>
            <Stepper orientation="vertical">
                {steps.map((step, index) => (
                    <Step key={step.id} active={true} expanded={true}>
                        <StepLabel 
                            icon={step.status === 'COMPLETE' ? <CheckCircle className="text-emerald-500"/> : <RadioButtonUnchecked className="text-slate-300"/>}
                            className="cursor-pointer"
                            onClick={() => handleStepClick(step.id)}
                        >
                            <div className="flex items-center gap-3">
                                <Typography variant="subtitle2" className={step.status === 'COMPLETE' ? 'line-through text-slate-400' : 'font-semibold'}>
                                    {step.label}
                                </Typography>
                                {step.status === 'COMPLETE' && step.completedAt && (
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
                    * Milestones are updated by your transaction coordinator.
                </Typography>
            )}
        </Paper>
    );
};

export default TransactionChecklist;
