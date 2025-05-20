import React from 'react';
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    Box,
    Chip,
    Stack
} from '@mui/material';
import { usePeople } from "@/hooks/usePeople";
import { useRouter } from 'next/router';

export default function People() {
    const router = useRouter();
    const { people, isLoading, error } = usePeople();

    // Format date to a readable string
    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get color for device chip
    const getDeviceColor = (deviceName: string) => {
        switch (deviceName.toLowerCase()) {
            case 'android':
                return 'success';
            case 'iphone':
                return 'primary';
            case 'desktop':
                return 'secondary';
            default:
                return 'default';
        }
    };

    if (isLoading) {
        return (
            <Container>
                <Typography variant="h6">Loading people...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth={false} sx={{ mt: 4, px: 4 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h4">People List</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/people/upload')}
                >
                    Add People
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 900 }} aria-label="people table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Date of Birth</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Devices</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {people.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" color="textSecondary">
                                        No people found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            people.map((person: any) => (
                                <TableRow
                                    key={person.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {person.identifier}
                                    </TableCell>

                                    {/* Combined Name Column */}
                                    <TableCell>
                                        {person.first_name} {person.last_name}
                                    </TableCell>

                                    {/* Combined Contact Column */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            {person.email && (
                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                    {person.email}
                                                </Typography>
                                            )}
                                            {person.telephone && (
                                                <Typography variant="body2" color="textSecondary">
                                                    {person.telephone}
                                                </Typography>
                                            )}
                                            {!person.email && !person.telephone && 'N/A'}
                                        </Box>
                                    </TableCell>

                                    {/* Combined Address Column */}
                                    <TableCell>
                                        {(person.location?.City || person.location?.Country) ? (
                                            <Typography variant="body2">
                                                {person.location?.City ? `${person.location.City}` : ''}
                                                {person.location?.City && person.location?.Country ? ', ' : ''}
                                                {person.location?.Country ? `${person.location.Country}` : ''}
                                            </Typography>
                                        ) : (
                                            'N/A'
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {person.dob ? formatDate(person.dob) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {person.devices && person.devices.length > 0 ? (
                                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                                {person.devices.map((device: string, index: number) => (
                                                    <Chip
                                                        key={index}
                                                        label={device}
                                                        size="small"
                                                        color={getDeviceColor(device) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                                                    />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                No devices
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Stack mx={5} my={3}>
                <Typography variant={"body1"}>Total:{people.length} Users</Typography>
            </Stack>
        </Container>
    );
}