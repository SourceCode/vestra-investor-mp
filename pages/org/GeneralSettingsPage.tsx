import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, TextField, Button, Divider, MenuItem, Alert } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, updateOrgSettingsRequest } from '../../store';
import { useToast } from '../../contexts/ToastContext';

const GeneralSettingsPage: React.FC = () => {
    const dispatch = useDispatch();
    const { settings } = useSelector((state: RootState) => state.organization);
    const { showToast } = useToast();
    
    const [formData, setFormData] = useState<any>({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
        setIsDirty(true);
    };

    const handleSave = () => {
        dispatch(updateOrgSettingsRequest(formData));
        setIsDirty(false);
        showToast('Settings saved successfully');
    };

    if (!settings) return null;

    return (
        <div>
            <div className="mb-8">
                <Typography variant="h4" className="font-bold text-slate-900 mb-2">General Settings</Typography>
                <Typography className="text-slate-500">Manage your organization's profile and defaults.</Typography>
            </div>

            <Paper className="p-8 rounded-xl border border-slate-200">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            label="Organization Name" 
                            fullWidth 
                            value={formData.name || ''} 
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            label="Marketplace Display Name" 
                            fullWidth 
                            value={formData.marketplaceName || ''} 
                            onChange={(e) => handleChange('marketplaceName', e.target.value)}
                            helperText="Visible to investors in the header"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            label="Support Email" 
                            fullWidth 
                            type="email"
                            value={formData.supportEmail || ''} 
                            onChange={(e) => handleChange('supportEmail', e.target.value)}
                        />
                    </Grid>
                    
                    <Grid item xs={12}><Divider /></Grid>

                    <Grid item xs={12} md={4}>
                        <TextField 
                            label="Default Currency" 
                            select 
                            fullWidth 
                            value={formData.currency || 'USD'} 
                            onChange={(e) => handleChange('currency', e.target.value)}
                        >
                            <MenuItem value="USD">USD ($)</MenuItem>
                            <MenuItem value="EUR">EUR (€)</MenuItem>
                            <MenuItem value="GBP">GBP (£)</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField 
                            label="Timezone" 
                            select 
                            fullWidth 
                            value={formData.timezone || 'America/Los_Angeles'} 
                            onChange={(e) => handleChange('timezone', e.target.value)}
                        >
                            <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                            <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                            <MenuItem value="Europe/London">London (GMT)</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField 
                            label="Default Close Timeline (Days)" 
                            type="number"
                            fullWidth 
                            value={formData.defaultCloseDays || 30} 
                            onChange={(e) => handleChange('defaultCloseDays', Number(e.target.value))}
                        />
                    </Grid>
                </Grid>

                {isDirty && (
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center animate-in fade-in">
                        <Typography variant="body2" className="text-orange-600 font-medium">
                            You have unsaved changes.
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<Save />} 
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>
                    </div>
                )}
            </Paper>
        </div>
    );
};

export default GeneralSettingsPage;
