import React, { useEffect } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchReferralsRequest } from '../../store';
import { MonetizationOn, ArrowForward, ArrowBack } from '@mui/icons-material';

const AgentReferralsPage: React.FC = () => {
    const dispatch = useDispatch();
    const { referrals, loading } = useSelector((state: RootState) => state.agent);

    useEffect(() => {
        dispatch(fetchReferralsRequest());
    }, [dispatch]);

    const totalRevenue = referrals
        .filter(r => r.type === 'INBOUND' && r.status === 'PAID')
        .reduce((sum, r) => sum + r.amount, 0);

    return (
        <div>
            <Typography variant="h4" className="font-bold mb-6">Referrals</Typography>

            <Grid container spacing={3} className="mb-8">
                <Grid item xs={12} md={4}>
                    <Paper className="p-6 rounded-xl border border-slate-200">
                        <Typography variant="body2" className="text-slate-500 font-bold uppercase tracking-wider mb-2">Total Revenue</Typography>
                        <Typography variant="h4" className="font-bold text-slate-900">${totalRevenue.toLocaleString()}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className="p-6 rounded-xl border border-slate-200">
                        <Typography variant="body2" className="text-slate-500 font-bold uppercase tracking-wider mb-2">Pending Payouts</Typography>
                        <Typography variant="h4" className="font-bold text-slate-900">$3,750</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                <TableContainer>
                    <Table>
                        <TableHead className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-bold text-slate-500">Deal</TableCell>
                                <TableCell className="font-bold text-slate-500">Type</TableCell>
                                <TableCell className="font-bold text-slate-500">Partner</TableCell>
                                <TableCell className="font-bold text-slate-500">Status</TableCell>
                                <TableCell className="font-bold text-slate-500 text-right">Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center" className="py-8">Loading...</TableCell></TableRow>
                            ) : (
                                referrals.map(ref => (
                                    <TableRow key={ref.id} hover>
                                        <TableCell>
                                            <div className="font-semibold">{ref.dealAddress}</div>
                                            <div className="text-xs text-slate-500">{ref.date}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                icon={ref.type === 'INBOUND' ? <ArrowBack fontSize="small" /> : <ArrowForward fontSize="small" />}
                                                label={ref.type} 
                                                size="small" 
                                                variant="outlined"
                                                className={ref.type === 'INBOUND' ? 'border-green-200 text-green-700' : 'border-blue-200 text-blue-700'}
                                            />
                                        </TableCell>
                                        <TableCell>{ref.partnerOrg}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={ref.status} 
                                                size="small" 
                                                color={ref.status === 'PAID' ? 'success' : ref.status === 'PENDING' ? 'warning' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell align="right" className="font-mono font-bold">
                                            ${ref.amount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
};

export default AgentReferralsPage;
