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
    Box
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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
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
                    Add Person
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="people table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Telephone</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>Country</TableCell>
                            <TableCell>Date of Birth</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {people.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
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
                                        {person.id}
                                    </TableCell>
                                    <TableCell>{person.firstName}</TableCell>
                                    <TableCell>{person.lastName}</TableCell>
                                    <TableCell>{person.email || 'N/A'}</TableCell>
                                    <TableCell>{person.telephone || 'N/A'}</TableCell>
                                    <TableCell>{person.city || 'N/A'}</TableCell>
                                    <TableCell>{person.country || 'N/A'}</TableCell>
                                    <TableCell>
                                        {person.dob ? formatDate(person.dob) : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}