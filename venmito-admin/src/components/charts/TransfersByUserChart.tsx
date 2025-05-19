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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransfersByUserChart = () => {
    const { transfers } = useTransfers();
    const theme = useTheme();

    // Process data to count transfers and amounts by user
    const chartData = useMemo(() => {
        if (!transfers || transfers.length === 0) return [];

        // Track both sent and received
        const userActivity: any = {};

        // Process all transfers
        transfers.forEach(transfer => {
            // Sender stats
            const senderId = transfer.sender.id;
            const senderName = transfer.sender.name;
            if (!userActivity[senderId]) {
                userActivity[senderId] = {
                    id: senderId,
                    name: senderName,
                    sent: 0,
                    sentAmount: 0,
                    received: 0,
                    receivedAmount: 0
                };
            }
            userActivity[senderId].sent += 1;
            userActivity[senderId].sentAmount += parseFloat(transfer.amount);

            // Recipient stats
            const recipientId = transfer.recipient.id;
            const recipientName = transfer.recipient.name;
            if (!userActivity[recipientId]) {
                userActivity[recipientId] = {
                    id: recipientId,
                    name: recipientName,
                    sent: 0,
                    sentAmount: 0,
                    received: 0,
                    receivedAmount: 0
                };
            }
            userActivity[recipientId].received += 1;
            userActivity[recipientId].receivedAmount += parseFloat(transfer.amount);
        });

        // Calculate total activity for each user
        const userData = Object.values(userActivity).map((user: any) => ({
            ...user,
            total: user.sent + user.received,
            totalAmount: user.sentAmount + user.receivedAmount,
            // Round to 2 decimal places
            sentAmount: Math.round(user.sentAmount * 100) / 100,
            receivedAmount: Math.round(user.receivedAmount * 100) / 100
        }));

        // Return top 10 most active users
        return userData
            .sort((a, b) => b.total - a.total)
            .slice(0, 7)
            .map(user => ({
                name: user.name.split(' ')[0],  // Just use first name to save space
                sent: user.sent,
                received: user.received,
                sentAmount: user.sentAmount,
                receivedAmount: user.receivedAmount
            }));
    }, [transfers]);

    // Calculate user stats
    const userStats = useMemo(() => {
        if (!transfers || transfers.length === 0) return {
            uniqueUsers: 0,
            topSender: 'N/A',
            topReceiver: 'N/A'
        };

        // Count unique users
        const uniqueSenders = new Set(transfers.map(t => t.sender.id));
        const uniqueRecipients = new Set(transfers.map(t => t.recipient.id));
        const uniqueUsers = new Set([...uniqueSenders, ...uniqueRecipients]);

        // Find top sender
        const senderCounts: any = {};
        transfers.forEach(t => {
            senderCounts[t.sender.id] = (senderCounts[t.sender.id] || 0) + 1;
        });
        const topSenderId = Object.entries(senderCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0];
        const topSender = transfers.find(t => t.sender.id.toString() === topSenderId)?.sender.name || 'N/A';

        // Find top receiver
        const recipientCounts: any = {};
        transfers.forEach(t => {
            recipientCounts[t.recipient.id] = (recipientCounts[t.recipient.id] || 0) + 1;
        });
        const topRecipientId = Object.entries(recipientCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0];
        const topReceiver = transfers.find(t => t.recipient.id.toString() === topRecipientId)?.recipient.name || 'N/A';

        return {
            uniqueUsers: uniqueUsers.size,
            topSender,
            topReceiver
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
                No user activity data available.
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
                    User Transfer Activity
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Unique Users
                        </Typography>
                        <Typography variant="h4">
                            {userStats.uniqueUsers}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Top Sender
                        </Typography>
                        <Typography variant="h6" sx={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userStats.topSender}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Top Receiver
                        </Typography>
                        <Typography variant="h6" sx={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userStats.topReceiver}
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
                            bottom: 20
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            formatter={(value, name) => {
                                if (name === 'sent') return [`${value} transfers`, 'Sent'];
                                if (name === 'received') return [`${value} transfers`, 'Received'];
                                if (name === 'sentAmount') return [`$${value}`, 'Sent Amount'];
                                if (name === 'receivedAmount') return [`$${value}`, 'Received Amount'];
                                return [value, name];
                            }}
                        />
                        <Legend />
                        <Bar dataKey="sent" name="Sent" fill={theme.palette.primary.main} />
                        <Bar dataKey="received" name="Received" fill={theme.palette.secondary.main} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default TransfersByUserChart;