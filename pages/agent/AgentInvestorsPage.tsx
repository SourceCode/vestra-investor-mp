import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Avatar, Chip, Drawer, IconButton } from '@mui/material';
import { Close, Lock, LockOpen, Message } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchInvestorsRequest, unlockInvestorRequest } from '../../store';
import { InvestorSummary } from '../../types';

const AgentInvestorsPage: React.FC = () => {
    const dispatch = useDispatch();
    const { investors, loading } = useSelector((state: RootState) => state.agent);
    const [selectedInvestor, setSelectedInvestor] = useState<InvestorSummary | null>(null);

    useEffect(() => {
        dispatch(fetchInvestorsRequest());
    }, [dispatch]);

    const handleUnlock = (id: string) => {
        dispatch(unlockInvestorRequest(id));
        if (selectedInvestor && selectedInvestor.id === id) {
            setSelectedInvestor({ ...selectedInvestor, status: 'UNLOCKED' });
        }
    };

    return (
        <div>
            <Typography variant="h4" className="font-bold mb-6">Investors</Typography>

            <Paper className="border border-slate-200 rounded-xl overflow-hidden">
                <TableContainer>
                    <Table>
                        <TableHead className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-bold text-slate-500">Investor</TableCell>
                                <TableCell className="font-bold text-slate-500">Status</TableCell>
                                <TableCell className="font-bold text-slate-500">Activity</TableCell>
                                <TableCell className="font-bold text-slate-500">Engagement</TableCell>
                                <TableCell className="font-bold text-slate-500 text-right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center" className="py-8">Loading...</TableCell></TableRow>
                            ) : (
                                investors.map(inv => (
                                    <TableRow key={inv.id} hover className="cursor-pointer" onClick={() => setSelectedInvestor(inv)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>{inv.firstName[0]}</Avatar>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{inv.firstName} {inv.lastName}</div>
                                                    <div className="text-xs text-slate-500">{inv.company || 'Individual'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={inv.status} 
                                                size="small" 
                                                color={inv.status === 'UNLOCKED' ? 'success' : inv.status === 'PENDING' ? 'warning' : 'default'} 
                                            />
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">{inv.lastActive}</TableCell>
                                        <TableCell>
                                            <div className="text-xs text-slate-500">
                                                {inv.dealViews} views • {inv.offersMade} offers
                                            </div>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button size="small" onClick={(e) => { e.stopPropagation(); setSelectedInvestor(inv); }}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Investor Drawer */}
            <Drawer 
                anchor="right" 
                open={!!selectedInvestor} 
                onClose={() => setSelectedInvestor(null)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
            >
                {selectedInvestor && (
                    <div className="h-full flex flex-col">
                        <div className="p-6 bg-slate-900 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.light' }}>{selectedInvestor.firstName[0]}</Avatar>
                                <IconButton onClick={() => setSelectedInvestor(null)} className="text-white"><Close /></IconButton>
                            </div>
                            <Typography variant="h5" className="font-bold">{selectedInvestor.firstName} {selectedInvestor.lastName}</Typography>
                            <Typography className="text-slate-400 text-sm">{selectedInvestor.company}</Typography>
                            <div className="mt-4 flex gap-2">
                                <Button 
                                    variant="contained" 
                                    size="small" 
                                    color="secondary"
                                    startIcon={selectedInvestor.status === 'UNLOCKED' ? <LockOpen /> : <Lock />}
                                    disabled={selectedInvestor.status === 'UNLOCKED'}
                                    onClick={() => handleUnlock(selectedInvestor.id)}
                                >
                                    {selectedInvestor.status === 'UNLOCKED' ? 'Access Granted' : 'Unlock Access'}
                                </Button>
                                <Button variant="outlined" color="inherit" size="small" startIcon={<Message />}>Message</Button>
                            </div>
                        </div>
                        <div className="p-6 flex-grow overflow-y-auto">
                            <div className="mb-6">
                                <Typography variant="subtitle2" className="font-bold text-slate-900 mb-2">Investment Criteria</Typography>
                                <div className="space-y-2 text-sm text-slate-600 border rounded-lg p-3 bg-slate-50">
                                    <div className="flex justify-between"><span>Budget:</span> <b>Up to ${(selectedInvestor.profile.criteria.maxBudget/1000).toFixed(0)}k</b></div>
                                    <div className="flex justify-between"><span>Min Beds:</span> <b>{selectedInvestor.profile.criteria.minBeds}</b></div>
                                </div>
                            </div>
                            <div className="mb-6">
                                <Typography variant="subtitle2" className="font-bold text-slate-900 mb-2">Proof of Funds</Typography>
                                {selectedInvestor.profile.proofOfFundsSubmitted ? (
                                    <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Verified
                                    </div>
                                ) : (
                                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Missing
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default AgentInvestorsPage;
