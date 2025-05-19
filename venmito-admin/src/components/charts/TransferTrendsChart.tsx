import React, { useMemo } from 'react';
import useTransfers from '@/hooks/useTransfers';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransferTrendsChart = () => {
    const { transfers } = useTransfers();
    const theme = useTheme();

    // Process data to group transfers by date
    const chartData = useMemo(() => {
        if (!transfers || transfers.length === 0) return [];

        // Map to store daily transfer stats
        const dailyData: any = {};

        // Process all transfers
        transfers.forEach(transfer => {
            if (!transfer.date) return;

            // Format date as YYYY-MM-DD
            const date = new Date(transfer.date);
            const formattedDate = date.toISOString().split('T')[0];

            // Initialize or update the daily stats
            if (!dailyData[formattedDate]) {
                dailyData[formattedDate] = {
                    date: formattedDate,
                    count: 0,
                    amount: 0,
                    displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                };
            }

            dailyData[formattedDate].count += 1;
            dailyData[formattedDate].amount += parseFloat(transfer.amount);
        });

        return Object.values(dailyData)
            .map((day: any) => ({
                ...day,
                amount: Math.round(day.amount * 100) / 100 // Round to 2 decimal places
            }))
            .sort((a: any, b: any) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
    }, [transfers]);

    // Calculate trend stats
    const trendStats = useMemo(() => {
        if (!chartData || chartData.length === 0) return {
            totalDays: 0,
            avgDailyTransfers: 0,
            avgDailyVolume: 0,
            maxDailyVolume: 0
        };

        const totalDays = chartData.length;
        const totalTransfers = chartData.reduce((sum, day) => sum + day.count, 0);
        const totalVolume = chartData.reduce((sum, day) => sum + day.amount, 0);
        const maxDailyVolume = Math.max(...chartData.map(day => day.amount));

        return {
            totalDays,
            avgDailyTransfers: Math.round(totalTransfers / totalDays * 10) / 10,
            avgDailyVolume: Math.round(totalVolume / totalDays * 100) / 100,
            maxDailyVolume: Math.round(maxDailyVolume * 100) / 100
        };
    }, [chartData]);

    if (!transfers) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (!chartData.length) {
        return (
            <Alert severity="info">
                No transfer trend data available.
            </Alert>
        );
    }

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Transfer Trends
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Time Period
                        </Typography>
                        <Typography variant="h4">
                            {trendStats.totalDays} days
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Avg Daily Transfers
                        </Typography>
                        <Typography variant="h4">
                            {trendStats.avgDailyTransfers}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Avg Daily Volume
                        </Typography>
                        <Typography variant="h4">
                            ${trendStats.avgDailyVolume}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 300, display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 10
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke={theme.palette.primary.main}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke={theme.palette.secondary.main}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            formatter={(value, name) => {
                                if (name === "Transfers") return [value, name];
                                if (name === "Volume") return [`$${value}`, name];
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="count"
                            name="Transfers"
                            stroke={theme.palette.primary.main}
                            activeDot={{ r: 8 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="amount"
                            name="Volume"
                            stroke={theme.palette.secondary.main}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default TransferTrendsChart;