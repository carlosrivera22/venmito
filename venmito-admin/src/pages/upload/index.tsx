// src/app/data-upload/page.tsx
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
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDataProcessor } from '@/hooks/useDataProcessor';


export default function DataUploadPage() {
    const [files, setFiles] = useState<File[]>([]);
    const { processing, processedData, error, processFiles } = useDataProcessor();

    // Handle file drop functionality
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/yaml': ['.yml', '.yaml'],
            'application/json': ['.json']
        }
    });

    // Handle file removal
    const handleFileRemove = (fileToRemove: File) => {
        setFiles(files.filter(file => file !== fileToRemove));
    };

    // Handle form submission
    const handleSubmit = async () => {
        await processFiles(files);
    };

    // Group files by type for display
    const getFileTypeCount = (extension: string) => {
        return files.filter(file =>
            file.name.toLowerCase().endsWith(`.${extension}`)
        ).length;
    };

    const yamlCount = getFileTypeCount('yml') + getFileTypeCount('yaml');
    const jsonCount = getFileTypeCount('json');

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Data Standardization Tool
                </Typography>

                <Typography paragraph color="text.secondary">
                    Upload your YAML/YML and JSON files to analyze, identify common entities, and standardize to a unified format.
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
                        Supported formats: YAML/YML, JSON
                    </Typography>
                </Box>

                {files.length > 0 && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Selected Files ({files.length})
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            {yamlCount > 0 && (
                                <Chip
                                    label={`${yamlCount} YAML files`}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {jsonCount > 0 && (
                                <Chip
                                    label={`${jsonCount} JSON files`}
                                    color="secondary"
                                    variant="outlined"
                                />
                            )}
                        </Box>

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
                                        color={file.name.toLowerCase().endsWith('.json') ? 'secondary' : 'primary'}
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
                                onClick={handleSubmit}
                                disabled={processing || files.length === 0}
                                startIcon={processing ? <CircularProgress size={20} /> : null}
                            >
                                {processing ? 'Processing...' : 'Analyze & Standardize Data'}
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>

            {processedData && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Data Analysis Results
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Files Processed:</strong> {processedData.fileCount}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Total Records:</strong> {processedData.totalRecords}
                        </Typography>

                        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                            Common Fields Identified Across All Files
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {processedData.commonFields.map((field: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                                <Chip key={index} label={field} color="primary" />
                            ))}
                            {processedData.commonFields.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No common fields found across all files.
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                        File Processing Results
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Filename</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Records</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Fields Identified</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedData.results.map((result: { filename: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; fileType: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; recordCount: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; success: any; identifiedFields: any[]; }, index: React.Key | null | undefined) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.filename}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={result.fileType}
                                                size="small"
                                                color={result.fileType === 'JSON' ? 'secondary' : 'primary'}
                                            />
                                        </TableCell>
                                        <TableCell>{result.recordCount}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={result.success ? 'Success' : 'Failed'}
                                                color={result.success ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {result.identifiedFields.slice(0, 3).join(', ')}
                                                {result.identifiedFields.length > 3 &&
                                                    ` +${result.identifiedFields.length - 3} more`}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
                        Standardized Data Preview
                    </Typography>
                    <Box
                        component="pre"
                        sx={{
                            p: 2,
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.875rem',
                            maxHeight: '300px'
                        }}
                    >
                        {JSON.stringify(processedData.standardizedData.slice(0, 3), null, 2)}
                        {processedData.standardizedData.length > 3 && (
                            '\n\n... and ' + (processedData.standardizedData.length - 3) + ' more records'
                        )}
                    </Box>
                </Paper>
            )}

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => { }}
            >
                <Alert
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}