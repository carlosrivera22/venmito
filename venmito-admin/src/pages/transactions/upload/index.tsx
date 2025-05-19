import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Snackbar,
    CircularProgress,
    Tabs,
    Tab,
    Chip,
    Tooltip,
    IconButton,
    Collapse,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { XMLParser } from 'fast-xml-parser';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function XmlUploadPage() {
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [rawXml, setRawXml] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
    const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});

    const toggleRow = (id: string) => {
        setOpenRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleXmlFileUpload = async (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const xmlContent = event.target?.result as string;
                    setRawXml(xmlContent);

                    // Parse XML to JSON
                    const parser = new XMLParser({
                        ignoreAttributes: false,
                        attributeNamePrefix: "@_",
                        isArray: (name: string) => {
                            // Always treat items.item as an array even if there's just one
                            return name === 'item';
                        }
                    });

                    const parsedData = parser.parse(xmlContent);

                    // Extract the transactions array from the parsed data
                    let transactions = [];
                    if (parsedData.transactions && parsedData.transactions.transaction) {
                        if (Array.isArray(parsedData.transactions.transaction)) {
                            transactions = parsedData.transactions.transaction;
                        } else {
                            transactions = [parsedData.transactions.transaction];
                        }
                    }

                    // Process each transaction to normalize the items structure
                    const processedTransactions = transactions.map((transaction: any) => {
                        // Process items to ensure proper structure
                        if (transaction.items && transaction.items.item) {
                            const items = Array.isArray(transaction.items.item)
                                ? transaction.items.item
                                : [transaction.items.item];

                            // Calculate transaction total
                            const totalPrice = items.reduce((sum: number, item: any) =>
                                sum + Number(item.price || 0), 0);

                            return {
                                ...transaction,
                                items: { item: items },
                                totalPrice: totalPrice
                            };
                        }
                        return transaction;
                    });

                    console.log("Processed transactions:", processedTransactions);
                    resolve(processedTransactions);
                } catch (error) {
                    console.error("XML parsing error:", error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    };

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        try {
            const file = acceptedFiles[0];
            const data = await handleXmlFileUpload(file);
            setJsonData(data);
            setUploadError(null);
        } catch (error) {
            console.error('Error parsing XML:', error);
            setUploadError('Failed to parse XML file. Please check the file format.');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/xml': ['.xml'],
            'text/xml': ['.xml']
        },
        maxFiles: 1
    });

    const handleUpload = async (endpoint: string) => {
        if (jsonData.length === 0) {
            setUploadError('No data to upload');
            return;
        }

        setIsUploading(true);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: jsonData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload data');
            }

            setUploadSuccess(true);
        } catch (error: any) {
            setUploadError(error.message || 'Failed to upload data');
        } finally {
            setIsUploading(false);
        }
    };

    const onUploadClick = async () => {
        try {
            await handleUpload('/api/transactions/upload');
        } catch (error) {
            console.error(error);
        }
    };

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Update the getItemsSummary function
    const getItemsSummary = (items: any[]) => {
        if (!items || items.length === 0) return 'No items';

        // Get unique item names with their quantities
        const itemCounts: { [key: string]: number } = {};

        items.forEach(item => {
            // Fix for accessing item name - check both direct name property and nested item property
            const name = item.name || item.item;
            if (name) {
                itemCounts[name] = (itemCounts[name] || 0) + Number(item.quantity || 1);
            }
        });

        // Format as "ItemName (quantity), ItemName2 (quantity2), ..."
        return Object.entries(itemCounts)
            .map(([name, count]) => `${name}${count > 1 ? ` (${count})` : ''}`)
            .join(', ');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Upload Transaction XML Data
            </Typography>

            {/* Drag and Drop Zone */}
            <Box
                {...getRootProps()}
                sx={{
                    border: '2px dashed grey',
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragActive ? 'action.hover' : 'background.default'
                }}
            >
                <input {...getInputProps()} />
                <Typography variant="body1">
                    {isDragActive
                        ? 'Drop the XML file here ...'
                        : 'Drag \'n\' drop an XML file here, or click to select a file'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    (*.xml files only)
                </Typography>
            </Box>

            {/* Preview of Uploaded Data */}
            {jsonData.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs
                            value={viewMode}
                            onChange={(_, newValue) => setViewMode(newValue)}
                            aria-label="View modes"
                        >
                            <Tab label="Table View" value="table" />
                            <Tab label="Raw XML" value="raw" />
                        </Tabs>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Transaction Data Preview
                        </Typography>
                        <Chip
                            label={`${jsonData.length} transactions found`}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>

                    {viewMode === 'table' ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell>Transaction ID</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Store</TableCell>
                                        <TableCell>Phone</TableCell>
                                        <TableCell>Items</TableCell>
                                        <TableCell align="right">Total Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jsonData.slice(0, 20).map((transaction) => {
                                        const transactionId = transaction['@_id'] || transaction.id;
                                        const isOpen = openRows[transactionId] || false;

                                        return (
                                            <React.Fragment key={transactionId}>
                                                <TableRow hover>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => toggleRow(transactionId)}
                                                            aria-label="expand row"
                                                        >
                                                            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>{transactionId}</TableCell>
                                                    <TableCell>{transaction.date}</TableCell>
                                                    <TableCell>{transaction.store}</TableCell>
                                                    <TableCell>{transaction.phone}</TableCell>
                                                    <TableCell>
                                                        <Tooltip
                                                            title="Click the arrow to see detailed items"
                                                            placement="top"
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    maxWidth: 200,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                {getItemsSummary(transaction.items?.item || [])}
                                                            </Typography>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatCurrency(transaction.totalPrice || 0)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                            <Box sx={{ margin: 1 }}>
                                                                <Typography variant="h6" gutterBottom component="div">
                                                                    Items Detail
                                                                </Typography>
                                                                <Table size="small" aria-label="items">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Item Name</TableCell>
                                                                            <TableCell>Quantity</TableCell>
                                                                            <TableCell>Price Per Item</TableCell>
                                                                            <TableCell align="right">Total Price</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {(transaction.items?.item || []).map((item: any, index: number) => (
                                                                            <TableRow key={index}>
                                                                                <TableCell>{item.name || item.item}</TableCell>
                                                                                <TableCell>{item.quantity}</TableCell>
                                                                                <TableCell>{formatCurrency(Number(item.price_per_item) || 0)}</TableCell>
                                                                                <TableCell align="right">{formatCurrency(Number(item.price) || 0)}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {rawXml}
                            </pre>
                        </Paper>
                    )}

                    {jsonData.length > 20 && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Showing 20 of {jsonData.length} transactions
                        </Typography>
                    )}

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="body2">
                                Total transactions: {jsonData.length}
                            </Typography>
                            <Typography variant="body2">
                                Total value: {formatCurrency(jsonData.reduce((sum, t) => sum + (t.totalPrice || 0), 0))}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onUploadClick}
                            disabled={isUploading}
                            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Data'}
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Error Handling */}
            <Snackbar
                open={!!uploadError}
                autoHideDuration={6000}
                onClose={() => setUploadError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setUploadError(null)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {uploadError}
                </Alert>
            </Snackbar>

            {/* Success Handling */}
            <Snackbar
                open={uploadSuccess}
                autoHideDuration={6000}
                onClose={() => setUploadSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setUploadSuccess(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    XML data uploaded successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
}