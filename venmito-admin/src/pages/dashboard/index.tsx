import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import MostUsedDevicesChart from '@/components/charts/MostUsedDevicesChart';
import PromotionsByCompanyChart from '@/components/charts/PromotionsByCompanyChart';

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

                {/* You can add more dashboard components here */}
            </Box>
        </Container>
    );
};

export default Dashboard;