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
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PopularItemsChart = () => {
    const { transactions } = useTransactions();
    const theme = useTheme();

    // Process data to count item popularity
    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Count all items across transactions
        const itemCounts: any = {};
        const itemQuantities: any = {};

        transactions.forEach(transaction => {
            if (transaction.items && Array.isArray(transaction.items)) {
                transaction.items.forEach((item: any) => {
                    if (item.itemName) {
                        // Count occurrences (number of transactions with this item)
                        itemCounts[item.itemName] = (itemCounts[item.itemName] || 0) + 1;

                        // Sum quantities (total units sold)
                        itemQuantities[item.itemName] = (itemQuantities[item.itemName] || 0) + parseInt(item.quantity);
                    }
                });
            }
        });

        // Convert to array, combine counts with quantities, and sort by quantity
        return Object.entries(itemQuantities)
            .map(([name, quantity]: any) => ({
                name,
                quantity,
                transactions: itemCounts[name]
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 7); // Take top 7 items
    }, [transactions]);

    // Define chart colors
    const COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        '#8884d8',
        '#82ca9d',
        '#ffc658',
    ];

    // Calculate item stats
    const itemStats = useMemo(() => {
        if (!transactions || transactions.length === 0) return {
            totalItems: 0,
            uniqueItems: 0,
            mostPopularItem: 'N/A'
        };

        // Count total items sold
        let totalQuantity = 0;
        const uniqueItems = new Set();

        transactions.forEach(transaction => {
            if (transaction.items && Array.isArray(transaction.items)) {
                transaction.items.forEach((item: { itemName: unknown; quantity: string; }) => {
                    if (item.itemName) {
                        uniqueItems.add(item.itemName);
                        totalQuantity += parseInt(item.quantity);
                    }
                });
            }
        });

        // Find the most popular item
        const mostPopularItem = chartData.length > 0 ? chartData[0].name : 'N/A';

        return {
            totalItems: totalQuantity,
            uniqueItems: uniqueItems.size,
            mostPopularItem
        };
    }, [transactions, chartData]);

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
                No item data available.
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
                    Popular Items
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Total Items Sold
                        </Typography>
                        <Typography variant="h4">
                            {itemStats.totalItems}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Unique Items
                        </Typography>
                        <Typography variant="h4">
                            {itemStats.uniqueItems}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Most Popular
                        </Typography>
                        <Typography variant="h4">
                            {itemStats.mostPopularItem}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 300, display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={110}
                            fill="#8884d8"
                            dataKey="quantity"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name, props) => {
                                const item = props.payload;
                                return [`${value} units (${item.transactions} transactions)`, item.name];
                            }}
                        />
                        <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default PopularItemsChart;