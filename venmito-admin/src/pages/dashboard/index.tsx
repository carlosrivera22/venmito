import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import PromotionsByCompanyChart from '@/components/charts/PromotionsByCompanyChart';


const Dashboard = () => {
    return (
        <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* First component - Promotions by Company */}
                <Box sx={{ height: 500 }}>
                    <PromotionsByCompanyChart />
                </Box>

                {/* You can add more dashboard components here */}
            </Box>
        </Container>
    );
};

export default Dashboard;