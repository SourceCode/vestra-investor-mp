import { Grid, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import AccountShell from '../../components/AccountShell';
import AnalyticsToolbar from '../../components/analytics/AnalyticsToolbar';
import ChartContainer from '../../components/analytics/ChartContainer';
import KpiCard from '../../components/analytics/KpiCard';
import { fetchAnalyticsRequest, RootState } from '../../store';

const InvestorAnalyticsPage: React.FC = () => {
    const dispatch = useDispatch();
    const { data, loading, timeRange } = useSelector((state: RootState) => state.analytics);

    useEffect(() => {
        dispatch(fetchAnalyticsRequest({ range: timeRange, role: 'USER' }));
    }, [dispatch, timeRange]);

    if (loading || !data) return <div className="p-8">Loading analytics...</div>;

    return (
        <AccountShell title="">
            <AnalyticsToolbar
                title="Investment Performance"
                timeRange={timeRange}
                onChangeRange={(r) => dispatch(fetchAnalyticsRequest({ range: r, role: 'USER' }))}
            />

            <Grid container spacing={3} className="mb-8">
                {data.kpis.map((kpi, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <KpiCard {...kpi} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ChartContainer title="Deal Funnel">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.main} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper className="p-6 rounded-xl border border-slate-200 h-96 overflow-y-auto">
                        <Typography variant="h6" className="font-bold text-slate-800 mb-4">Insights</Typography>
                        <List disablePadding>
                            {data.insights.map((insight, i) => (
                                <ListItem key={i} className="bg-slate-50 rounded-lg mb-2">
                                    <ListItemText
                                        primary={insight}
                                        primaryTypographyProps={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <ChartContainer title="Portfolio Growth">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.charts.secondary}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Grid>
            </Grid>
        </AccountShell>
    );
};

export default InvestorAnalyticsPage;
