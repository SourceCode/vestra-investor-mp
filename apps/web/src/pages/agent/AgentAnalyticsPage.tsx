import { Grid, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import AnalyticsToolbar from '../../components/analytics/AnalyticsToolbar';
import ChartContainer from '../../components/analytics/ChartContainer';
import KpiCard from '../../components/analytics/KpiCard';
import { fetchAnalyticsRequest, RootState } from '../../store';

const AgentAnalyticsPage: React.FC = () => {
    const dispatch = useDispatch();
    const { data, loading, timeRange } = useSelector((state: RootState) => state.analytics);

    useEffect(() => {
        dispatch(fetchAnalyticsRequest({ range: timeRange, role: 'ADMIN' }));
    }, [dispatch, timeRange]);

    if (loading || !data) return <div className="p-8">Loading analytics...</div>;

    const COLORS = ['#0f172a', '#14b8a6', '#f59e0b', '#ef4444'];

    return (
        <div>
            <AnalyticsToolbar
                title="Performance Analytics"
                timeRange={timeRange}
                onChangeRange={(r) => dispatch(fetchAnalyticsRequest({ range: r, role: 'ADMIN' }))}
            />

            <Grid container spacing={3} className="mb-8">
                {data.kpis.map((kpi, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <KpiCard {...kpi} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <ChartContainer title="Deal Velocity (Published vs Closed)">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.charts.main}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <ChartContainer title="Pipeline Health">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.charts.distribution}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.charts.distribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-xs text-slate-500 mt-[-20px]">
                            {data.charts.distribution?.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </ChartContainer>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <ChartContainer title="Offers Per Deal">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.secondary}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper className="p-6 rounded-xl border border-slate-200 h-96 overflow-y-auto">
                        <Typography variant="h6" className="font-bold text-slate-800 mb-4">AI Insights</Typography>
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
            </Grid>
        </div>
    );
};

export default AgentAnalyticsPage;
