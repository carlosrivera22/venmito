import React, { useState } from 'react';
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
    CircularProgress
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useCsvUpload } from '@/hooks/useCsvUpload';

export default function UploadPage() {
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { handleCsvFileUpload } = useCsvUpload();

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        try {
            const file = acceptedFiles[0];
            const data = await handleCsvFileUpload(file);
            setJsonData(data);
            setUploadError(null);
        } catch (error) {
            console.error('Error parsing CSV:', error);
            setUploadError('Failed to parse CSV file. Please check the file format.');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv']
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
            await handleUpload('/api/transfers/upload');
        } catch (error) {
            console.error(error);
        }
    };

    // Get column headers for the table (from the first item if available)
    const getTableHeaders = () => {
        if (jsonData.length === 0) return [];
        return Object.keys(jsonData[0]);
    };

    const headers = getTableHeaders();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Upload CSV Data
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
                        ? 'Drop the CSV file here ...'
                        : 'Drag \'n\' drop a CSV file here, or click to select a file'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    (*.csv files only)
                </Typography>
            </Box>

            {/* Preview of Uploaded Data */}
            {jsonData.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        CSV Data Preview
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {headers.map((header) => (
                                        <TableCell key={header}>{header}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {jsonData.slice(0, 10).map((row, index) => (
                                    <TableRow key={index}>
                                        {headers.map((header) => (
                                            <TableCell key={`${index}-${header}`}>
                                                {row[header]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                            Total rows: {jsonData.length}
                        </Typography>
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
                    CSV data uploaded successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
}