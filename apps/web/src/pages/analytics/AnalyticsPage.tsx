import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Grid, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { trpc } from '../../utils/trpc';
import { TimeRange } from '../../types';
import { KpiGrid, VolumeChart, DistributionChart, InsightsPanel } from '../../components/analytics/AnalyticsComponents';

const AnalyticsPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    // Fetch data
    const { data, isLoading, error } = trpc.analytics.dashboard.useQuery({ timeRange });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4}>
                <Typography color="error">Failed to load analytics: {error.message}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Dashboard
                </Typography>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="time-range-select-label">Time Range</InputLabel>
                    <Select
                        labelId="time-range-select-label"
                        id="time-range-select"
                        value={timeRange}
                        label="Time Range"
                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    >
                        <MenuItem value="7d">Last 7 Days</MenuItem>
                        <MenuItem value="30d">Last 30 Days</MenuItem>
                        <MenuItem value="90d">Last 90 Days</MenuItem>
                        <MenuItem value="all">All Time</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {data && <KpiGrid kpis={data.kpis} />}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                        <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
                        {data && <VolumeChart data={data.charts.main} />}
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                        <Typography variant="h6" gutterBottom>Property Distribution</Typography>
                        {data && <DistributionChart data={data.charts.distribution || []} />}
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>AI Insights</Typography>
                        {data && <InsightsPanel insights={data.insights} />}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AnalyticsPage;
