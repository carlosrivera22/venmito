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
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransferVolumeChart = () => {
    const { transfers } = useTransfers();
    const theme = useTheme();

    // Process data to categorize transfers by amount range
    const chartData = useMemo(() => {
        if (!transfers || transfers.length === 0) return [];

        // Define amount ranges
        const ranges = [
            { name: 'Small (<$10)', min: 0, max: 10, count: 0, value: 0 },
            { name: 'Medium ($10-$50)', min: 10, max: 50, count: 0, value: 0 },
            { name: 'Large ($50-$100)', min: 50, max: 100, count: 0, value: 0 },
            { name: 'X-Large (>$100)', min: 100, max: Infinity, count: 0, value: 0 }
        ];

        // Categorize transfers
        transfers.forEach(transfer => {
            const amount = parseFloat(transfer.amount);
            for (const range of ranges) {
                if (amount >= range.min && amount < range.max) {
                    range.count += 1;
                    range.value += amount;
                    break;
                }
            }
        });

        // Return only ranges with data
        return ranges.filter(range => range.count > 0);
    }, [transfers]);

    // Define chart colors
    const COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main
    ];

    // Calculate transfer stats
    const transferStats = useMemo(() => {
        if (!transfers || transfers.length === 0) return {
            totalCount: 0,
            totalAmount: 0,
            avgAmount: 0
        };

        const totalAmount = transfers.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        return {
            totalCount: transfers.length,
            totalAmount: Math.round(totalAmount * 100) / 100,
            avgAmount: Math.round((totalAmount / transfers.length) * 100) / 100
        };
    }, [transfers]);

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
                No transfer data available.
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
                    Transfer Volume Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Total Transfers
                        </Typography>
                        <Typography variant="h4">
                            {transferStats.totalCount}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Total Volume
                        </Typography>
                        <Typography variant="h4">
                            ${transferStats.totalAmount}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Avg Transfer Amount
                        </Typography>
                        <Typography variant="h4">
                            ${transferStats.avgAmount}
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
                            dataKey="count"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name, props) => {
                                const item = props.payload;
                                return [`${value} transfers ($${Math.round(item.value * 100) / 100})`, item.name];
                            }}
                        />
                        <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default TransferVolumeChart;