import React, { useEffect } from 'react';
import { Grid, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchAnalyticsRequest } from '../../store';
import KpiCard from '../../components/analytics/KpiCard';
import ChartContainer from '../../components/analytics/ChartContainer';
import AnalyticsToolbar from '../../components/analytics/AnalyticsToolbar';

const AgentAnalyticsPage: React.FC = () => {
    const dispatch = useDispatch();
    const { data, timeRange, loading } = useSelector((state: RootState) => state.analytics);

    useEffect(() => {
        dispatch(fetchAnalyticsRequest({ role: 'ADMIN', range: timeRange }));
    }, [dispatch, timeRange]);

    if (loading || !data) return <div className="p-8">Loading analytics...</div>;

    const COLORS = ['#0f172a', '#14b8a6', '#f59e0b', '#ef4444'];

    return (
        <div>
             <AnalyticsToolbar 
                title="Performance Analytics" 
                timeRange={timeRange} 
                onChangeRange={(r) => dispatch(fetchAnalyticsRequest({ role: 'ADMIN', range: r }))} 
            />

            <Grid container spacing={3} className="mb-8">
                {data.kpis.map((kpi, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <KpiCard {...kpi} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <ChartContainer title="Deal Velocity (Published vs Closed)">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.charts.main}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Grid>
                
                <Grid item xs={12} md={4}>
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
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </ChartContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartContainer title="Offers Per Deal">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.secondary}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper className="p-6 rounded-xl border border-slate-200 h-96 overflow-y-auto">
                        <Typography variant="h6" className="font-bold text-slate-800 mb-4">AI Insights</Typography>
                         <List disablePadding>
                            {data.insights.map((insight, i) => (
                                <ListItem key={i} className="bg-slate-50 rounded-lg mb-2">
                                    <ListItemText 
                                        primary={insight} 
                                        primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
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
