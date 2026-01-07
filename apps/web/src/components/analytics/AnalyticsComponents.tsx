import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { AnalyticsKpi, AnalyticsData, ChartDataPoint } from '../../types';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export const KpiGrid: React.FC<{ kpis: AnalyticsKpi[] }> = ({ kpis }) => {
    return (
        <Grid container spacing={3} mb={4}>
            {kpis.map((kpi, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="overline">
                                {kpi.label}
                            </Typography>
                            <Typography variant="h4" component="div">
                                {kpi.value}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                                {kpi.trend === 'up' && <TrendingUp color="success" fontSize="small" />}
                                {kpi.trend === 'down' && <TrendingDown color="error" fontSize="small" />}
                                {kpi.trend === 'neutral' && <Remove color="action" fontSize="small" />}
                                <Typography
                                    variant="body2"
                                    color={kpi.trend === 'up' ? 'success.main' : kpi.trend === 'down' ? 'error.main' : 'text.secondary'}
                                    ml={1}
                                >
                                    {Math.abs(kpi.change || 0)}% vs last period
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export const VolumeChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="value2" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" name="Revenue" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DistributionChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export const InsightsPanel: React.FC<{ insights: string[] }> = ({ insights }) => {
    return (
        <Box>
            {insights.map((insight, index) => (
                <Typography key={index} paragraph variant="body2">
                    • {insight}
                </Typography>
            ))}
            {insights.length === 0 && <Typography variant="body2" color="textSecondary">No insights available.</Typography>}
        </Box>
    );
};
