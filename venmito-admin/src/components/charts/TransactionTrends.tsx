import React, { useMemo } from 'react';
import useTransactions from '@/hooks/useTransactions';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionTrendsChart = () => {
    const { transactions } = useTransactions();
    const theme = useTheme();

    // Process data to group transactions by month
    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Group transactions by month
        const monthlyData: any = {};

        transactions.forEach(transaction => {
            if (transaction.transaction_date) {
                // Create a date object and get the month and year
                const date = new Date(transaction.transaction_date);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                // Initialize the month entry if it doesn't exist
                if (!monthlyData[monthYear]) {
                    monthlyData[monthYear] = {
                        date: monthYear,
                        count: 0,
                        amount: 0,
                        displayDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                    };
                }

                // Update counts and totals
                monthlyData[monthYear].count += 1;
                monthlyData[monthYear].amount += parseFloat(transaction.total_amount);
            }
        });

        // Convert to array and sort by date
        return Object.values(monthlyData)
            .map((entry: any) => ({
                ...entry,
                amount: Math.round(entry.amount * 100) / 100 // Round to 2 decimal places
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [transactions]);

    // Calculate trend stats
    const trendStats = useMemo(() => {
        if (!chartData || chartData.length === 0) return {
            totalMonths: 0,
            avgMonthlyTransactions: 0,
            avgMonthlyRevenue: 0
        };

        const totalMonths = chartData.length;
        const totalTransactions = chartData.reduce((sum, month) => sum + month.count, 0);
        const totalRevenue = chartData.reduce((sum, month) => sum + month.amount, 0);

        return {
            totalMonths,
            avgMonthlyTransactions: Math.round(totalTransactions / totalMonths),
            avgMonthlyRevenue: Math.round((totalRevenue / totalMonths) * 100) / 100
        };
    }, [chartData]);

    if (!transactions) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (!chartData.length) {
        return (
            <Alert severity="info">
                No transaction data available.
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
                    Transaction Trends
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Time Period
                        </Typography>
                        <Typography variant="h4">
                            {trendStats.totalMonths} months
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Avg Monthly Transactions
                        </Typography>
                        <Typography variant="h4">
                            {trendStats.avgMonthlyTransactions}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Avg Monthly Revenue
                        </Typography>
                        <Typography variant="h4">
                            ${trendStats.avgMonthlyRevenue}
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
                            tickFormatter={(value) => value}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke={theme.palette.secondary.main}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            formatter={(value, name) => {
                                if (name === "Transactions") return [value, name];
                                if (name === "Revenue") return [`$${value}`, name];
                                return [value, name];
                            }}
                        />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="count"
                            name="Transactions"
                            stroke={theme.palette.primary.main}
                            activeDot={{ r: 8 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="amount"
                            name="Revenue"
                            stroke={theme.palette.secondary.main}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default TransactionTrendsChart;