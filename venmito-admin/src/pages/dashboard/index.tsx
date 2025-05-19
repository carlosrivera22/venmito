import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import MostUsedDevicesChart from '@/components/charts/MostUsedDevicesChart';
import PromotionsByCompanyChart from '@/components/charts/PromotionsByCompanyChart';
import PopularItemsChart from '@/components/charts/PopularItems';
import TransactionsByStoreChart from '@/components/charts/TransactionsByStore';
import TransactionTrendsChart from '@/components/charts/TransactionTrends';

// New transfer charts
import TransferVolumeChart from '@/components/charts/TransferVolumeChart';
import TransfersByUserChart from '@/components/charts/TransfersByUserChart';
const Dashboard = () => {
    return (
        <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* First row of charts */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    '& > *': { flex: 1 }
                }}>
                    {/* Promotions by Company */}
                    <Box sx={{ height: { xs: 400, md: 500 } }}>
                        <PromotionsByCompanyChart />
                    </Box>

                    {/* Most Used Devices */}
                    <Box sx={{ height: { xs: 400, md: 500 } }}>
                        <MostUsedDevicesChart />
                    </Box>
                </Box>

                {/* Second row - Transaction charts */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    '& > *': { flex: 1 }
                }}>
                    {/* Transactions by Store */}
                    <Box sx={{ height: { xs: 400, md: 500 } }}>
                        <TransactionsByStoreChart />
                    </Box>

                    {/* Popular Items */}
                    <Box sx={{ height: { xs: 400, md: 500 } }}>
                        <PopularItemsChart />
                    </Box>
                </Box>

                {/* Third row - Transaction trends and transfers volume */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    '& > *': { flex: 1 }
                }}>
                    {/* Transfer Volume Distribution */}
                    <Box sx={{ height: { xs: 400, md: 500 } }}>
                        <TransferVolumeChart />
                    </Box>

                    {/* Transfers By User */}
                    <Box sx={{ height: { xs: 400, md: 500 } }}>
                        <TransfersByUserChart />
                    </Box>

                </Box>

                {/* Fourth row - Transfers specific charts */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    '& > *': { flex: 1 }
                }}>
                    {/* Transaction Trends */}
                    <Box sx={{ height: { xs: 400, md: 500 } }}>
                        <TransactionTrendsChart />
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;