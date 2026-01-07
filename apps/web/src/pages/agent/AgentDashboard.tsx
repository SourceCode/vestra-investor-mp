import { Add, Assignment, CheckCircleOutline, MonetizationOn, MoreVert, People, WarningAmber } from '@mui/icons-material';
import { Button, Chip, Divider, Grid, IconButton, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { fetchDashboardRequest, RootState } from '../../store';

const KPI = ({ color, icon, label, value }: { color: string; icon: React.ReactNode, label: string, value: number, }) => (
    <Paper className="p-6 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
        <div>
            <Typography variant="h4" className="font-bold mb-1">{value}</Typography>
            <Typography variant="body2" className="text-slate-500 font-medium">{label}</Typography>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
    </Paper>
);

const AgentDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, metrics, tasks } = useSelector((state: RootState) => state.agent);

    useEffect(() => {
        dispatch(fetchDashboardRequest());
    }, [dispatch]);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <Typography variant="h4" className="font-bold text-slate-900">Good Morning</Typography>
                    <Typography className="text-slate-500">Here's what's happening in your pipeline today.</Typography>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/agent/deals/new')}
                        className="bg-slate-900"
                    >
                        New Deal
                    </Button>
                </div>
            </div>

            <Grid container spacing={3} className="mb-8">
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPI label="Active Deals" value={metrics.activeDeals} icon={<Assignment className="text-blue-600" />} color="bg-blue-50" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPI label="Pending Offers" value={metrics.pendingOffers} icon={<MonetizationOn className="text-emerald-600" />} color="bg-emerald-50" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPI label="Under Contract" value={metrics.underContract} icon={<CheckCircleOutline className="text-purple-600" />} color="bg-purple-50" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPI label="Unread Messages" value={metrics.unreadMessages} icon={<People className="text-orange-600" />} color="bg-orange-50" />
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <Typography variant="h6" className="font-bold text-slate-800">Priority Tasks</Typography>
                            <Button size="small">View All</Button>
                        </div>
                        <List disablePadding>
                            {tasks.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">No active tasks.</div>
                            ) : (
                                tasks.map((task, i) => (
                                    <React.Fragment key={task.id}>
                                        {i > 0 && <Divider />}
                                        <ListItem
                                            className="hover:bg-slate-50 transition-colors"
                                            secondaryAction={
                                                <Button size="small" variant="outlined" color="primary">Action</Button>
                                            }
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                                                <ListItemText
                                                    primary={<span className="font-medium text-slate-900">{task.title}</span>}
                                                    secondary={`Due: ${task.due} • ${task.type}`}
                                                />
                                            </div>
                                        </ListItem>
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper className="rounded-xl border border-slate-200 p-6 h-full">
                        <Typography variant="h6" className="font-bold text-slate-800 mb-4">Quick Actions</Typography>
                        <div className="flex flex-col gap-3">
                            <Button variant="outlined" fullWidth className="justify-start py-3 text-slate-600 border-slate-200 hover:border-slate-300">
                                Invite Investor
                            </Button>
                            <Button variant="outlined" fullWidth className="justify-start py-3 text-slate-600 border-slate-200 hover:border-slate-300">
                                Share Deal Link
                            </Button>
                            <Button variant="outlined" fullWidth className="justify-start py-3 text-slate-600 border-slate-200 hover:border-slate-300">
                                View Analytics
                            </Button>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default AgentDashboard;
