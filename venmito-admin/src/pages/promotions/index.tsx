import { usePromotions } from "@/hooks/usePromotions";
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
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Button
} from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/router";

export default function Promotions() {
    const { promotions, isLoading } = usePromotions();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const router = useRouter()

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    // Filter promotions based on search and status filter
    const filteredPromotions = promotions?.filter(promotion => {
        const matchesSearch =
            searchTerm === "" ||
            `${promotion.firstName} ${promotion.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (promotion.email && promotion.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (promotion.telephone && promotion.telephone.includes(searchTerm));

        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "responded" && promotion.responded) ||
            (filterStatus === "not-responded" && !promotion.responded);

        return matchesSearch && matchesStatus;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Promotions
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
                    label="Search by name, email or phone"
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
                    <InputLabel>Response Status</InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Response Status"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="responded">Responded</MenuItem>
                        <MenuItem value="not-responded">Not Responded</MenuItem>
                    </Select>
                </FormControl>
            </Box>
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
                    onClick={() => router.push('/promotions/upload')}
                >
                    Add Promotions
                </Button>
            </Box>

            {/* Data table */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="promotions table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell>Person</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Response</TableCell>
                            <TableCell>Promotion Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPromotions && filteredPromotions.length > 0 ? (
                            filteredPromotions.map((promotion) => (
                                <TableRow key={promotion.id} hover>
                                    <TableCell>
                                        {promotion.firstName && promotion.lastName
                                            ? `${promotion.firstName} ${promotion.lastName}`
                                            : "Unknown Person"}
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            {promotion.email && (
                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                    {promotion.email}
                                                </Typography>
                                            )}
                                            {promotion.telephone && (
                                                <Typography variant="body2" color="textSecondary">
                                                    {promotion.telephone}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={promotion.responded ? "Responded" : "No Response"}
                                            color={promotion.responded ? "success" : "error"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {promotion.promotionDate
                                            ? format(new Date(promotion.promotionDate), "MMM d, yyyy")
                                            : "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No promotions found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                Total: {filteredPromotions?.length || 0} promotions
            </Typography>
        </Box>
    );
}