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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionsByStoreChart = () => {
    const { transactions } = useTransactions();
    const theme = useTheme();

    // Process data to count transactions by store
    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Count transactions by store
        const storeCounts: any = {};
        const storeAmounts: any = {};

        transactions.forEach(transaction => {
            if (transaction.store) {
                storeCounts[transaction.store] = (storeCounts[transaction.store] || 0) + 1;
                storeAmounts[transaction.store] = (storeAmounts[transaction.store] || 0) + parseFloat(transaction.total_amount);
            }
        });

        // Convert to array and sort by count (descending)
        return Object.entries(storeCounts)
            .map(([name, count]: any) => ({
                name,
                count,
                amount: Math.round(storeAmounts[name] * 100) / 100
            }))
            .sort((a, b) => b.count - a.count);
    }, [transactions]);

    // Calculate transaction stats
    const transactionStats = useMemo(() => {
        if (!transactions || transactions.length === 0) return {
            totalTransactions: 0,
            totalAmount: 0,
            avgTransactionValue: 0
        };

        const totalTransactions = transactions.length;
        const totalAmount = transactions.reduce(
            (sum, t) => sum + parseFloat(t.total_amount), 0
        );
        const avgTransactionValue = totalAmount / totalTransactions;

        return {
            totalTransactions,
            totalAmount: Math.round(totalAmount * 100) / 100,
            avgTransactionValue: Math.round(avgTransactionValue * 100) / 100
        };
    }, [transactions]);

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
                    Transactions by Store
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Total Transactions
                        </Typography>
                        <Typography variant="h4">
                            {transactionStats.totalTransactions}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Total Revenue
                        </Typography>
                        <Typography variant="h4">
                            ${transactionStats.totalAmount}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Avg Transaction Value
                        </Typography>
                        <Typography variant="h4">
                            ${transactionStats.avgTransactionValue}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 300, display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 70
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval={0}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                        <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                        <Tooltip
                            formatter={(value, name) => {
                                if (name === "count") return [`${value} transactions`, "Transactions"];
                                if (name === "amount") return [`$${value}`, "Revenue"];
                                return [value, name];
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" name="Transactions" fill={theme.palette.primary.main} />
                        <Bar yAxisId="right" dataKey="amount" name="Revenue" fill={theme.palette.secondary.main} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default TransactionsByStoreChart;