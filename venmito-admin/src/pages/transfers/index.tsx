import React, { useState } from 'react';
import useTransfers from "@/hooks/useTransfers";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    TextField,
    InputAdornment
} from '@mui/material';
import { format } from 'date-fns';
import { Search } from '@mui/icons-material';

export default function Transfers() {
    const { transfers } = useTransfers();
    const [searchTerm, setSearchTerm] = useState('');

    // Handle search input change
    const handleSearchChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSearchTerm(event.target.value);
    };

    // Filter transfers based on search term
    const filteredTransfers = transfers
        ? transfers.filter(transfer =>
            transfer.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfer.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transfer.sender.identifier.includes(searchTerm) ||
            transfer.recipient.identifier.includes(searchTerm) ||
            transfer.amount.toString().includes(searchTerm)
        )
        : [];

    // Format currency display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Loading state
    if (!transfers) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Transfers
            </Typography>

            {/* Search field */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by name, ID or amount"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="transfers table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTransfers.length > 0 ? (
                            filteredTransfers.map((transfer) => (
                                <TableRow key={transfer.id} hover>
                                    <TableCell>{transfer.id}</TableCell>
                                    <TableCell>{formatDate(transfer.date)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {transfer.sender.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                            ID: {transfer.sender.identifier}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {transfer.recipient.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                            ID: {transfer.recipient.identifier}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 'medium',
                                                color: parseFloat(transfer.amount) > 50 ? '#2e7d32' : 'inherit'
                                            }}
                                        >
                                            {formatCurrency(transfer.amount)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No transfers found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                Total: {filteredTransfers.length} transfers
            </Typography>
        </Box>
    );
}