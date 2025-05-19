import React, { useMemo } from 'react';
import { usePromotions } from '@/hooks/usePromotions';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PromotionsByCompanyChart = () => {
    const { promotions, isLoading, error } = usePromotions();
    const theme = useTheme();

    // Process data to group promotions by company
    const chartData = useMemo(() => {
        if (!promotions || promotions.length === 0) return [];

        // Count promotions by company
        const promotionCounts = promotions.reduce((acc: Record<string, any>, promotion) => {
            const company = promotion.promotion || 'Unknown';

            if (!acc[company]) {
                acc[company] = {
                    name: company,
                    total: 0,
                    responded: 0,
                    notResponded: 0
                };
            }

            acc[company].total += 1;

            if (promotion.responded) {
                acc[company].responded += 1;
            } else {
                acc[company].notResponded += 1;
            }

            return acc;
        }, {});

        // Convert to array and sort by total count (descending)
        return Object.values(promotionCounts)
            .sort((a: any, b: any) => b.total - a.total);
    }, [promotions]);

    // Create colors array
    const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        '#8884d8',
        '#82ca9d',
        '#ffc658',
        '#8dd1e1'
    ];

    // Calculate response rate
    const calculateStats = useMemo(() => {
        if (!promotions || promotions.length === 0) return { total: 0, responseRate: 0 };

        const total = promotions.length;
        const responded = promotions.filter(p => p.responded).length;
        const responseRate = (responded / total) * 100;

        return {
            total,
            responseRate: Math.round(responseRate * 10) / 10 // Round to 1 decimal place
        };
    }, [promotions]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }

    if (!chartData.length) {
        return (
            <Alert severity="info">
                No promotion data available.
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
                    Promotions by Company
                </Typography>
                <Box sx={{ display: 'flex', gap: 4 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Total Promotions
                        </Typography>
                        <Typography variant="h4">
                            {calculateStats.total}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Response Rate
                        </Typography>
                        <Typography variant="h4">
                            {calculateStats.responseRate}%
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip
                            formatter={(value: any, name: string) => {
                                if (name === 'responded') return [`${value} (Responded)`, 'Count'];
                                if (name === 'notResponded') return [`${value} (Not Responded)`, 'Count'];
                                return [value, name];
                            }}
                        />
                        <Legend />
                        <Bar dataKey="responded" name="Responded" stackId="a" fill={theme.palette.success.main} />
                        <Bar dataKey="notResponded" name="Not Responded" stackId="a" fill={theme.palette.error.light} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default PromotionsByCompanyChart;