import React, { useState } from 'react';
import { Container, Stepper, Step, StepLabel, Button, Typography, Paper, TextField, Slider, Chip, Box, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateProfileRequest } from '../../store';

const steps = ['Basic Info', 'Investing Criteria', 'Proof of Funds', 'Disclosures'];

const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeStep, setActiveStep] = useState(0);
    const [criteria, setCriteria] = useState({ budget: [100000, 1000000] });

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            dispatch(updateProfileRequest({ status: 'PENDING' })); // Just dummy update
            navigate('/browse');
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <Container maxWidth="md">
                <div className="mb-10 text-center">
                    <Typography variant="h4" className="font-bold text-slate-900">Welcome to Vestra</Typography>
                    <Typography className="text-slate-500">Let's set up your investor profile.</Typography>
                </div>

                <Stepper activeStep={activeStep} alternativeLabel className="mb-10">
                    {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <Paper className="p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                    {activeStep === 0 && (
                        <div className="space-y-6">
                            <Typography variant="h6" className="font-bold">Tell us about yourself</Typography>
                            <TextField label="Company Name (Optional)" fullWidth />
                            <TextField label="Phone Number" fullWidth />
                            <TextField label="How many deals have you done?" fullWidth select SelectProps={{ native: true }}>
                                <option>0-2 deals</option>
                                <option>3-10 deals</option>
                                <option>10+ deals</option>
                            </TextField>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="space-y-8">
                            <Typography variant="h6" className="font-bold">What are you looking for?</Typography>
                            <div>
                                <Typography gutterBottom>Budget Range</Typography>
                                <Slider 
                                    value={criteria.budget} 
                                    onChange={(e, v) => setCriteria({...criteria, budget: v as number[]})}
                                    min={50000} max={5000000} step={50000} valueLabelDisplay="auto"
                                />
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>${criteria.budget[0].toLocaleString()}</span>
                                    <span>${criteria.budget[1].toLocaleString()}</span>
                                </div>
                            </div>
                            <div>
                                <Typography gutterBottom className="mb-2">Strategies</Typography>
                                <div className="flex gap-2">
                                    {['Fix & Flip', 'Buy & Hold', 'BRRRR', 'Wholesale'].map(s => (
                                        <Chip key={s} label={s} onClick={()=>{}} variant="outlined" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="space-y-6 text-center py-8">
                             <Typography variant="h6" className="font-bold">Proof of Funds</Typography>
                             <Typography className="text-slate-500 max-w-md mx-auto">
                                 Upload a recent bank statement or pre-approval letter to get verified status and unlock full property details.
                             </Typography>
                             <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                                 <Typography className="font-bold text-slate-700">Click to upload or drag files here</Typography>
                             </div>
                             <FormControlLabel control={<Checkbox />} label="I will upload this later" />
                        </div>
                    )}

                    {activeStep === 3 && (
                        <div className="space-y-4">
                            <Typography variant="h6" className="font-bold">Disclosures</Typography>
                            <Box className="h-40 overflow-y-auto bg-slate-50 p-4 border border-slate-200 rounded text-sm text-slate-600">
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                <p className="mt-2">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
                            </Box>
                            <FormControlLabel control={<Checkbox />} label="I agree to the Terms of Service and Confidentiality Agreement" />
                        </div>
                    )}

                    <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
                        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
                        <Button variant="contained" onClick={handleNext}>
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                </Paper>
            </Container>
        </div>
    );
};

export default OnboardingWizard;
