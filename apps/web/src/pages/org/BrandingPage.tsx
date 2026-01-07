import { Save, Upload } from '@mui/icons-material';
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ColorPicker from '../../components/org/ColorPicker';
import PropertyCard from '../../components/PropertyCard';
import { MOCK_PROPERTIES } from '../../constants';
import { useToast } from '../../contexts/ToastContext';
import { RootState, updateOrgSettingsRequest } from '../../store';

const BrandingPage: React.FC = () => {
    const dispatch = useDispatch();
    const { settings } = useSelector((state: RootState) => state.organization);
    const { showToast } = useToast();

    const [draftSettings, setDraftSettings] = useState<any>({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (settings) setDraftSettings(settings);
    }, [settings]);

    const handleChange = (field: string, value: any) => {
        setDraftSettings({ ...draftSettings, [field]: value });
        setIsDirty(true);
    };

    const handleSave = () => {
        dispatch(updateOrgSettingsRequest(draftSettings));
        setIsDirty(false);
        showToast('Branding updated successfully');
    };

    if (!settings) return null;

    // We render a preview that explicitly uses draftSettings instead of the global theme context
    // This allows previewing without committing
    const PreviewHeader = () => (
        <div className="w-full h-16 border-b border-slate-200 flex items-center px-6 justify-between bg-white">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: draftSettings.primaryColor }}>
                    {draftSettings.name?.[0]}
                </div>
                <span className="font-bold text-slate-900">{draftSettings.marketplaceName}</span>
            </div>
            <div className="flex gap-4">
                <span className="text-sm font-medium text-slate-600">Buy</span>
                <span className="text-sm font-medium text-slate-600">Sell</span>
                <Button
                    variant="contained"
                    size="small"
                    style={{ backgroundColor: draftSettings.primaryColor }}
                >
                    Sign In
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Typography variant="h4" className="font-bold text-slate-900 mb-2">Branding & White-labeling</Typography>
                    <Typography className="text-slate-500">Customize the look and feel of your marketplace.</Typography>
                </div>
                {isDirty && (
                    <Button variant="contained" startIcon={<Save />} onClick={handleSave}>Save Changes</Button>
                )}
            </div>

            <Grid container spacing={6}>
                {/* Controls */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper className="p-6 rounded-xl border border-slate-200 space-y-6 sticky top-24">
                        <div>
                            <Typography variant="subtitle2" className="font-bold mb-4">Logo</Typography>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50">
                                <Upload className="text-slate-400 mb-2" />
                                <Typography variant="caption" className="block text-slate-500">Upload Light Logo</Typography>
                            </div>
                        </div>

                        <Divider />

                        <div>
                            <Typography variant="subtitle2" className="font-bold mb-4">Colors</Typography>
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Primary Brand Color"
                                    color={draftSettings.primaryColor || '#000'}
                                    onChange={(c) => handleChange('primaryColor', c)}
                                />
                                <ColorPicker
                                    label="Secondary Accent Color"
                                    color={draftSettings.secondaryColor || '#000'}
                                    onChange={(c) => handleChange('secondaryColor', c)}
                                />
                            </div>
                        </div>
                    </Paper>
                </Grid>

                {/* Live Preview */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Typography variant="overline" className="text-slate-400 font-bold mb-2 block">Live Preview</Typography>
                    <div className="border-4 border-slate-200 rounded-xl overflow-hidden bg-slate-100 min-h-[600px] flex flex-col">
                        <PreviewHeader />

                        <div className="p-8">
                            <div className="mb-8 text-center">
                                <Typography variant="h4" className="font-bold mb-2" style={{ color: draftSettings.primaryColor }}>
                                    Find your next opportunity
                                </Typography>
                                <Typography className="text-slate-500">Browse exclusive off-market deals.</Typography>
                            </div>

                            <Grid container spacing={3}>
                                {MOCK_PROPERTIES.slice(0, 2).map(p => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={p.id}>
                                        {/* Mock Property Card that respects draft colors */}
                                        <Paper className="overflow-hidden rounded-xl h-full flex flex-col">
                                            <div className="h-40 bg-slate-200 relative">
                                                <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white shadow-sm" style={{ backgroundColor: draftSettings.secondaryColor }}>
                                                    New
                                                </div>
                                            </div>
                                            <div className="p-4 flex-grow">
                                                <Typography variant="subtitle1" className="font-bold">{p.address}</Typography>
                                                <Typography variant="caption" className="text-slate-500 block mb-2">{p.city}, {p.state}</Typography>
                                                <Typography variant="h6" className="font-bold text-slate-900">${p.price.toLocaleString()}</Typography>
                                            </div>
                                            <div className="p-4 border-t border-slate-100">
                                                <Button fullWidth variant="outlined" size="small" style={{ borderColor: draftSettings.primaryColor, color: draftSettings.primaryColor }}>
                                                    View Details
                                                </Button>
                                            </div>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </div>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default BrandingPage;
