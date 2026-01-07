import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { mockApi as api } from '../../mocks/api';

const steps = ['Entity Setup', 'Investment Criteria', 'Review'];

const InvestorOnboarding: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        entityName: '',
        entityType: 'INDIVIDUAL',
        locations: [] as string[],
        minBudget: 100000,
        maxBudget: 500000,
        propertyTypes: [] as string[],
    });

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            await handleSubmit();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        try {
            await api.investor.updateProfile(formData);
            navigate('/'); // Go to dashboard
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to save profile. Please try again.');
        }
    };

    const handleLocationChange = (event: any) => {
        const {
            target: { value },
        } = event;
        setFormData({
            ...formData,
            locations: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handlePropTypeChange = (type: string) => {
        const newTypes = formData.propertyTypes.includes(type)
            ? formData.propertyTypes.filter((t) => t !== type)
            : [...formData.propertyTypes, type];
        setFormData({ ...formData, propertyTypes: newTypes });
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom>
                                Investment Entity
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                How will you be purchasing properties?
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Legal Entity Name"
                                placeholder="e.g. Smith Holdings LLC or John Smith"
                                value={formData.entityName}
                                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Entity Type</InputLabel>
                                <Select
                                    value={formData.entityType}
                                    label="Entity Type"
                                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                                >
                                    <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                                    <MenuItem value="LLC">LLC</MenuItem>
                                    <MenuItem value="CORP">Corporation</MenuItem>
                                    <MenuItem value="TRUST">Trust</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom>
                                Investment Criteria
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Target Markets</InputLabel>
                                <Select
                                    multiple
                                    value={formData.locations}
                                    label="Target Markets"
                                    onChange={handleLocationChange}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                    <MenuItem value="Austin, TX">Austin, TX</MenuItem>
                                    <MenuItem value="Dallas, TX">Dallas, TX</MenuItem>
                                    <MenuItem value="Nashville, TN">Nashville, TN</MenuItem>
                                    <MenuItem value="Phoenix, AZ">Phoenix, AZ</MenuItem>
                                    <MenuItem value="Tampa, FL">Tampa, FL</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography gutterBottom>Budget Range</Typography>
                            <Slider
                                value={[formData.minBudget, formData.maxBudget]}
                                onChange={(_, newValue) =>
                                    setFormData({
                                        ...formData,
                                        minBudget: (newValue as number[])[0],
                                        maxBudget: (newValue as number[])[1],
                                    })
                                }
                                valueLabelDisplay="auto"
                                min={50000}
                                max={2000000}
                                step={10000}
                            />
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="caption">${formData.minBudget.toLocaleString()}</Typography>
                                <Typography variant="caption">${formData.maxBudget.toLocaleString()}</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Property Types</FormLabel>
                                <Grid container>
                                    {['Single Family', 'Multi Family', 'Commercial', 'Land'].map((type) => (
                                        <Grid size={{ xs: 6 }} key={type}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.propertyTypes.includes(type)}
                                                        onChange={() => handlePropTypeChange(type)}
                                                    />
                                                }
                                                label={type}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Your Profile
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2">Entity</Typography>
                                    <Typography variant="body2">
                                        {formData.entityName} ({formData.entityType})
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2">Markets</Typography>
                                    <Typography variant="body2">{formData.locations.join(', ') || 'None selected'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2">Budget</Typography>
                                    <Typography variant="body2">
                                        ${formData.minBudget.toLocaleString()} - ${formData.maxBudget.toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2">Types</Typography>
                                    <Typography variant="body2">{formData.propertyTypes.join(', ') || 'None selected'}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        <Box mt={2}>
                            <FormControlLabel
                                control={<Checkbox defaultChecked />}
                                label="I certify that I am an accredited investor or have sophisticated knowledge of real estate investing."
                            />
                        </Box>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    Investor Onboarding
                </Typography>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <React.Fragment>
                    {getStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        {activeStep !== 0 && (
                            <Button onClick={handleBack} sx={{ mr: 1 }}>
                                Back
                            </Button>
                        )}
                        <Button variant="contained" onClick={handleNext}>
                            {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                        </Button>
                    </Box>
                </React.Fragment>
            </Paper>
        </Container>
    );
};

export default InvestorOnboarding;
