import useTransactions from "@/hooks/useTransactions";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from "@mui/material";
import { format } from "date-fns";

export default function Transactions() {
    const { transactions } = useTransactions();
    const [searchTerm, setSearchTerm] = useState("");
    const [storeFilter, setStoreFilter] = useState("all");

    if (!transactions) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    // Filter transactions based on search and store filter
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch =
            searchTerm === "" ||
            `${transaction.firstName} ${transaction.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.email && transaction.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (transaction.store && transaction.store.toLowerCase().includes(searchTerm.toLowerCase())) ||
            transaction.items.some((item: { itemName: string; }) => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStore =
            storeFilter === "all" ||
            transaction.store === storeFilter;

        return matchesSearch && matchesStore;
    });

    // Get unique store names for the filter dropdown
    const storeOptions = transactions.length > 0
        ? [...new Set(transactions.map(t => t.store))]
        : [];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Transactions
            </Typography>

            {/* Filters using flexbox */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    mb: 3
                }}
            >
                <TextField
                    fullWidth
                    label="Search by name, email, store or items"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 1 }}
                />
                <FormControl
                    variant="outlined"
                    sx={{
                        minWidth: { xs: '100%', md: '200px' },
                        width: { md: '30%' }
                    }}
                >
                    <InputLabel>Store</InputLabel>
                    <Select
                        value={storeFilter}
                        onChange={(e) => setStoreFilter(e.target.value)}
                        label="Store"
                    >
                        <MenuItem value="all">All Stores</MenuItem>
                        {storeOptions.map((store) => (
                            <MenuItem key={store} value={store}>{store}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Data table */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="transactions table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Store</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTransactions && filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => (
                                <TableRow key={transaction.id} hover>
                                    <TableCell>
                                        {transaction.external_id}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            {transaction.firstName} {transaction.lastName}
                                        </Typography>
                                        {transaction.email && (
                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                                {transaction.email}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.store}
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: '250px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {transaction.items.map((item: { quantity: any; itemName: any; }) => `${item.quantity}× ${item.itemName}`).join(', ')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        ${parseFloat(transaction.total_amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.transaction_date
                                            ? format(new Date(transaction.transaction_date), "MMM d, yyyy")
                                            : "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No transactions found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                Total: {filteredTransactions?.length || 0} transactions
            </Typography>
        </Box>
    );
}