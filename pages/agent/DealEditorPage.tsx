import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Typography, TextField, Grid, Button, MenuItem, Tabs, Tab, Box, Divider, InputAdornment, FormControlLabel, Switch, Alert, Chip } from '@mui/material';
import { Save, ArrowBack, Publish, Public, Share } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchPropertyDetail } from '../../store';
import { useToast } from '../../contexts/ToastContext';

const DealEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showToast } = useToast();
    
    const isNew = id === 'new';
    const { detail: property } = useSelector((state: RootState) => state.properties);
    const [tab, setTab] = useState(0);

    // Form state (simplified)
    const [formData, setFormData] = useState<any>({
        address: '', city: '', state: '', zip: '', price: 0, beds: 0, baths: 0, sqft: 0, description: '',
        distribution: { sharedToNetwork: false, referralFeeType: 'PERCENTAGE', referralFeeValue: 2.5, visibleToOrgs: [] }
    });

    useEffect(() => {
        if (!isNew && id) {
            dispatch(fetchPropertyDetail(id));
        }
    }, [id, isNew, dispatch]);

    useEffect(() => {
        if (property && !isNew) {
            setFormData(property);
        }
    }, [property, isNew]);

    const handleSave = () => {
        showToast('Deal saved successfully');
        navigate('/agent/deals');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Button startIcon={<ArrowBack />} onClick={() => navigate('/agent/deals')}>Back</Button>
                    <Typography variant="h4" className="font-bold">{isNew ? 'New Deal' : 'Edit Deal'}</Typography>
                </div>
                <div className="flex gap-2">
                    <Button variant="outlined" startIcon={<Save />} onClick={handleSave}>Save Draft</Button>
                    <Button variant="contained" startIcon={<Publish />} onClick={handleSave}>Publish</Button>
                </div>
            </div>

            <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} className="px-4 bg-slate-50">
                        <Tab label="Property Info" />
                        <Tab label="Financials" />
                        <Tab label="Media" />
                        <Tab label="Distribution" />
                        <Tab label="Settings" />
                    </Tabs>
                </Box>

                <div className="p-8">
                    {tab === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" className="font-bold mb-4">Basic Details</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Street Address" fullWidth value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField label="City" fullWidth value={formData.city} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField label="State" fullWidth value={formData.state} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField label="Zip Code" fullWidth value={formData.zip} />
                            </Grid>
                            
                            <Grid item xs={12}><Divider className="my-2" /></Grid>
                            
                            <Grid item xs={12} md={3}>
                                <TextField label="Beds" type="number" fullWidth value={formData.beds} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField label="Baths" type="number" fullWidth value={formData.baths} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField label="Sqft" type="number" fullWidth value={formData.sqft} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField label="Year Built" type="number" fullWidth value={formData.yearBuilt} />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField label="Description" multiline rows={4} fullWidth value={formData.description} />
                            </Grid>
                        </Grid>
                    )}

                    {tab === 1 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="List Price" 
                                    fullWidth 
                                    type="number" 
                                    value={formData.price}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="ARV (After Repair Value)" 
                                    fullWidth 
                                    type="number" 
                                    defaultValue={formData.metrics?.arv}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="Estimated Rehab" 
                                    fullWidth 
                                    type="number" 
                                    defaultValue={formData.metrics?.rehabEst}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField 
                                    label="Projected Rent" 
                                    fullWidth 
                                    type="number" 
                                    defaultValue={formData.metrics?.estRent}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {tab === 2 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                            <Typography className="text-slate-500 mb-4">Drag and drop photos here</Typography>
                            <Button variant="outlined">Upload Photos</Button>
                        </div>
                    )}

                    {tab === 3 && (
                        <div className="space-y-8">
                            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex items-start gap-4">
                                <Public className="text-indigo-600 mt-1" />
                                <div>
                                    <Typography variant="h6" className="font-bold text-indigo-900">Network Distribution</Typography>
                                    <Typography variant="body2" className="text-indigo-700 mb-4">
                                        Share this deal with the partner network to increase visibility. You retain full ownership and control of the transaction.
                                    </Typography>
                                    <FormControlLabel 
                                        control={
                                            <Switch 
                                                checked={formData.distribution?.sharedToNetwork} 
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    distribution: { ...formData.distribution, sharedToNetwork: e.target.checked }
                                                })} 
                                            />
                                        } 
                                        label={<span className="font-bold">Share to Network Marketplace</span>} 
                                    />
                                </div>
                            </div>

                            {formData.distribution?.sharedToNetwork && (
                                <div className="animate-in fade-in">
                                    <Typography variant="subtitle1" className="font-bold mb-4">Referral Terms</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                select 
                                                label="Referral Fee Type" 
                                                fullWidth 
                                                value={formData.distribution?.referralFeeType}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    distribution: { ...formData.distribution, referralFeeType: e.target.value }
                                                })}
                                            >
                                                <MenuItem value="PERCENTAGE">Percentage of Sale Price</MenuItem>
                                                <MenuItem value="FLAT">Flat Fee</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField 
                                                label="Fee Value" 
                                                type="number" 
                                                fullWidth 
                                                value={formData.distribution?.referralFeeValue}
                                                InputProps={{ 
                                                    endAdornment: formData.distribution?.referralFeeType === 'PERCENTAGE' ? '%' : undefined,
                                                    startAdornment: formData.distribution?.referralFeeType === 'FLAT' ? '$' : undefined
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Alert severity="info" className="mt-4">
                                        Partner agents who bring a buyer will be eligible for this referral fee upon closing.
                                    </Alert>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Paper>
        </div>
    );
};

export default DealEditorPage;
