import React, { useMemo } from 'react';
import { usePeople } from '@/hooks/usePeople';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MostUsedDevicesChart = () => {
    const { people, isLoading, error } = usePeople();
    const theme = useTheme();

    // Process data to count device usage
    const chartData = useMemo(() => {
        if (!people || people.length === 0) return [];

        // Count all devices across people
        const deviceCounts: Record<string, number> = {};

        people.forEach(person => {
            if (person.devices && Array.isArray(person.devices)) {
                person.devices.forEach(device => {
                    const normalizedDevice = device.toString().trim();
                    deviceCounts[normalizedDevice] = (deviceCounts[normalizedDevice] || 0) + 1;
                });
            }
        });

        // Convert to array and sort by count (descending)
        return Object.entries(deviceCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [people]);

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

    // Calculate device stats
    const deviceStats = useMemo(() => {
        if (!people || people.length === 0) return { totalPeople: 0, totalDevices: 0, avgDevicesPerPerson: 0 };

        const totalPeople = people.length;
        const peopleWithDevices = people.filter(p => p.devices && p.devices.length > 0).length;
        const totalDevices = chartData.reduce((sum, item) => sum + item.value, 0);
        const avgDevicesPerPerson = totalDevices / totalPeople;

        return {
            totalPeople,
            peopleWithDevices,
            totalDevices,
            avgDevicesPerPerson: Math.round(avgDevicesPerPerson * 10) / 10 // Round to 1 decimal
        };
    }, [people, chartData]);

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
                No device data available.
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
                    Most Used Devices
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Total Devices
                        </Typography>
                        <Typography variant="h4">
                            {deviceStats.totalDevices}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Avg Devices/Person
                        </Typography>
                        <Typography variant="h4">
                            {deviceStats.avgDevicesPerPerson}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            People with Devices
                        </Typography>
                        <Typography variant="h4">
                            {deviceStats.peopleWithDevices}/{deviceStats.totalPeople}
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
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [`${value} devices`, name]}
                        />
                        <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default MostUsedDevicesChart;