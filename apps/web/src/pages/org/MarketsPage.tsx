import { Add, LocationOn } from '@mui/icons-material';
import { Button, Card, CardContent, Grid, Paper, Switch, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMarketsRequest, RootState } from '../../store';

const MarketsPage: React.FC = () => {
    const dispatch = useDispatch();
    const { loading, markets } = useSelector((state: RootState) => state.organization);

    useEffect(() => {
        dispatch(fetchMarketsRequest());
    }, [dispatch]);

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="font-bold text-slate-900 mb-2">Operating Markets</Typography>
                    <Typography className="text-slate-500">Configure where your organization is active.</Typography>
                </div>
                <Button variant="outlined" startIcon={<Add />}>Add Market</Button>
            </div>

            <Grid container spacing={3}>
                {loading ? <div>Loading...</div> : markets.map(market => (
                    <Grid size={{ xs: 12, md: 4 }} key={market.id}>
                        <Card className={`h-full border transition-all ${market.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 opacity-70'}`}>
                            <CardContent>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        <LocationOn className={market.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'} />
                                    </div>
                                    <Switch checked={market.status === 'ACTIVE'} />
                                </div>
                                <Typography variant="h6" className="font-bold">{market.name}, {market.state}</Typography>
                                <Typography variant="body2" className="text-slate-500 mt-1">
                                    {market.dealCount} active deals
                                </Typography>

                                {market.status === 'ACTIVE' && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <Button size="small" fullWidth>Configure Defaults</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default MarketsPage;
