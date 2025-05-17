'use client';

import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Alert,
    Snackbar,
    Divider
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function DataUploadPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [processedData, setProcessedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json'],
            'text/yaml': ['.yml', '.yaml'],
            'text/csv': ['.csv'],
            'application/xml': ['.xml']
        }
    });

    const handleFileRemove = (fileToRemove: File) => {
        setFiles(files.filter(file => file !== fileToRemove));
    };

    const processFiles = async () => {
        setProcessing(true);
        setError(null);

        try {
            // Here we'll eventually add the logic to process and standardize 
            // the files to JSON format

            // For now, just simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Placeholder for processed data
            setProcessedData({
                message: "Files processed successfully",
                fileCount: files.length,
                sampleData: { id: 1, name: "Sample Standardized Data" }
            });

        } catch (err) {
            console.error("Error processing files:", err);
            setError("An error occurred while processing the files");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Data Standardization Tool
                </Typography>

                <Typography paragraph color="text.secondary">
                    Upload your data files (JSON, YAML, CSV, XML) to standardize them to a consistent JSON format.
                </Typography>

                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'grey.400',
                        borderRadius: 2,
                        p: 3,
                        mb: 3,
                        bgcolor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'grey.50',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <input {...getInputProps()} />
                    <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">
                        {isDragActive ? 'Drop the files here' : 'Drag & drop files here'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        or click to select files
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Supported formats: JSON, YAML/YML, CSV, XML
                    </Typography>
                </Box>

                {files.length > 0 && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Selected Files ({files.length})
                        </Typography>

                        <List>
                            {files.map((file, index) => (
                                <ListItem
                                    key={`${file.name}-${index}`}
                                    secondaryAction={
                                        <Button
                                            size="small"
                                            onClick={() => handleFileRemove(file)}
                                            color="error"
                                        >
                                            Remove
                                        </Button>
                                    }
                                >
                                    <ListItemIcon>
                                        <InsertDriveFileIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file.name}
                                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                    />
                                    <Chip
                                        label={file.name.split('.').pop()?.toUpperCase()}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ mr: 2 }}
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={processFiles}
                                disabled={processing}
                                startIcon={processing ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                            >
                                {processing ? 'Processing...' : 'Standardize Data'}
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>

            {processedData && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Processed Data
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                        component="pre"
                        sx={{
                            p: 2,
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.875rem'
                        }}
                    >
                        {JSON.stringify(processedData, null, 2)}
                    </Box>
                </Paper>
            )}

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert
                    onClose={() => setError(null)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}