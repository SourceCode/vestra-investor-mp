import React, { useEffect } from 'react';
import { Paper, Typography, Grid, Button, Chip } from '@mui/material';
import { Extension, CheckCircle, LinkOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchIntegrationsRequest, toggleIntegrationRequest } from '../../store';
import { useToast } from '../../contexts/ToastContext';

const IntegrationsPage: React.FC = () => {
    const dispatch = useDispatch();
    const { integrations, loading } = useSelector((state: RootState) => state.organization);
    const { showToast } = useToast();

    useEffect(() => {
        dispatch(fetchIntegrationsRequest());
    }, [dispatch]);

    const handleToggle = (id: string, currentStatus: string) => {
        dispatch(toggleIntegrationRequest(id));
        showToast(currentStatus === 'CONNECTED' ? 'Integration disconnected' : 'Integration connected successfully');
    };

    return (
        <div>
            <div className="mb-8">
                <Typography variant="h4" className="font-bold text-slate-900 mb-2">Integrations</Typography>
                <Typography className="text-slate-500">Connect external tools to streamline your workflow.</Typography>
            </div>

            <Grid container spacing={3}>
                {loading ? <div>Loading...</div> : integrations.map(int => (
                    <Grid item xs={12} md={6} lg={4} key={int.id}>
                        <Paper className="p-6 rounded-xl border border-slate-200 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-100 rounded-xl">
                                    <Extension className="text-slate-600" />
                                </div>
                                <Chip 
                                    label={int.status} 
                                    size="small" 
                                    color={int.status === 'CONNECTED' ? 'success' : 'default'} 
                                    icon={int.status === 'CONNECTED' ? <CheckCircle /> : <LinkOff />}
                                />
                            </div>
                            
                            <Typography variant="h6" className="font-bold">{int.provider}</Typography>
                            <Typography variant="body2" className="text-slate-500 mb-4">{int.category}</Typography>
                            
                            {int.status === 'CONNECTED' && int.lastSync && (
                                <Typography variant="caption" className="text-slate-400 block mb-6">
                                    Last synced: {int.lastSync}
                                </Typography>
                            )}

                            <div className="mt-auto">
                                <Button 
                                    variant={int.status === 'CONNECTED' ? 'outlined' : 'contained'} 
                                    color={int.status === 'CONNECTED' ? 'error' : 'primary'}
                                    fullWidth
                                    onClick={() => handleToggle(int.id, int.status)}
                                >
                                    {int.status === 'CONNECTED' ? 'Disconnect' : 'Connect'}
                                </Button>
                            </div>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default IntegrationsPage;
