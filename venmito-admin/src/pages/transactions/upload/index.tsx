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
    Chip
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { XMLParser } from 'fast-xml-parser';

export default function XmlUploadPage() {
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [rawXml, setRawXml] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
    const [flattenedData, setFlattenedData] = useState<any[]>([]);

    // Process transactions to create a flattened view better suited for table display
    useEffect(() => {
        if (jsonData.length > 0) {
            // Create a flattened version of the transactions
            const flattened = jsonData.map((transaction: any) => {
                // Get all items as a comma-separated string
                const items = Array.isArray(transaction.items?.item)
                    ? transaction.items.item.map((i: any) => i.item).join(', ')
                    : transaction.items?.item?.item || 'No items';

                // Calculate total price
                const totalPrice = Array.isArray(transaction.items?.item)
                    ? transaction.items.item.reduce((sum: number, i: any) => sum + Number(i.price || 0), 0)
                    : Number(transaction.items?.item?.price || 0);

                // Return flattened structure for display
                return {
                    id: transaction['@_id'] || transaction.id,
                    date: transaction.date,
                    store: transaction.store,
                    phone: transaction.phone,
                    items: items,
                    totalPrice: totalPrice,
                    // Original structure for reference
                    original: transaction
                };
            });

            setFlattenedData(flattened);
        }
    }, [jsonData]);

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

                    console.log("Parsed transactions:", transactions);
                    resolve(transactions);
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
                                        <TableCell>Transaction ID</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Store</TableCell>
                                        <TableCell>Phone</TableCell>
                                        <TableCell>Items</TableCell>
                                        <TableCell align="right">Total Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {flattenedData.slice(0, 20).map((transaction, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{transaction.id}</TableCell>
                                            <TableCell>{transaction.date}</TableCell>
                                            <TableCell>{transaction.store}</TableCell>
                                            <TableCell>{transaction.phone}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        maxWidth: 200,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {transaction.items}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(transaction.totalPrice)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
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

                    {flattenedData.length > 20 && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Showing 20 of {flattenedData.length} transactions
                        </Typography>
                    )}

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="body2">
                                Total transactions: {jsonData.length}
                            </Typography>
                            <Typography variant="body2">
                                Total value: {formatCurrency(flattenedData.reduce((sum, t) => sum + t.totalPrice, 0))}
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