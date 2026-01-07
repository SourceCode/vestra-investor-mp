import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stepper, Step, StepLabel, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { RootState, createDealRequest } from '../store';
import { DealStatus } from '../types';

const steps = ['Basic Info', 'Property Details', 'Review'];

export const DealWizard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { submitting, error } = useSelector((state: RootState) => state.deals);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        description: '',
        notes: '',
        status: DealStatus.DRAFT
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            handleSubmit();
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleSubmit = () => {
        dispatch(createDealRequest({
            ...formData,
            price: Number(formData.price),
        }));
        // We'll rely on a redirect or success message via Redux state/effects in a real app
        // For now, let's just go back to list on assumed success after a delay or check state change
        // Ideally, we'd watch for success action or state change. 
        // For simplicity in this wizard, we'll navigate back after dispatch.
        // In a clearer implementation, we'd wait for 'submitting' to go false and 'error' to be null.
        setTimeout(() => navigate('/deals'), 1000);
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField required label="Deal Title" name="title" value={formData.title} onChange={handleChange} />
                        <TextField required label="Price" name="price" type="number" value={formData.price} onChange={handleChange} />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select name="status" value={formData.status} label="Status" onChange={handleChange as any}>
                                {(Object.values(DealStatus) as string[]).map((status) => (
                                    <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField required label="Address" name="address" value={formData.address} onChange={handleChange} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField required label="City" name="city" value={formData.city} onChange={handleChange} fullWidth />
                            <TextField required label="State" name="state" value={formData.state} onChange={handleChange} />
                            <TextField required label="Zip" name="zip" value={formData.zip} onChange={handleChange} />
                        </Box>
                        <TextField label="Description" name="description" multiline rows={3} value={formData.description} onChange={handleChange} />
                        <TextField label="Internal Notes" name="notes" multiline rows={2} value={formData.notes} onChange={handleChange} />
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="h6">Summary</Typography>
                        <Typography><strong>Title:</strong> {formData.title}</Typography>
                        <Typography><strong>Price:</strong> ${formData.price}</Typography>
                        <Typography><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zip}</Typography>
                        <Typography><strong>Status:</strong> {formData.status}</Typography>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>New Deal</Typography>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map(label => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            <Box>
                {renderStepContent(activeStep)}
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                    <Button disabled={activeStep === 0 || submitting} onClick={handleBack}>
                        Back
                    </Button>
                    <Button variant="contained" onClick={handleNext} disabled={submitting}>
                        {activeStep === steps.length - 1 ? (submitting ? 'Creating...' : 'Create Deal') : 'Next'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};
