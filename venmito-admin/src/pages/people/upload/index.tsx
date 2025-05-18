import React from 'react';
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
    Snackbar
} from '@mui/material';
import { useFileUpload } from '@/hooks/useUpload';

export default function UploadPage() {
    const {
        jsonData,
        uploadError,
        uploadSuccess,
        isUploading,
        dropzone: { getRootProps, getInputProps, isDragActive },
        handleUpload,
        setUploadError,
        setUploadSuccess
    } = useFileUpload();


    const onUploadClick = async () => {
        try {
            await handleUpload('/api/people/upload');
        } catch (error) {
            // Error is already handled in the hook
            console.error(error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Upload People Data
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
                        ? 'Drop the JSON file here ...'
                        : 'Drag \'n\' drop a JSON file here, or click to select a file'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    (Only *.json files will be accepted)
                </Typography>
            </Box>

            {/* Preview of Uploaded Data */}
            {jsonData.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Uploaded Data Preview
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>City</TableCell>
                                    <TableCell>Country</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {jsonData.slice(0, 10).map((person) => (
                                    <TableRow key={person.id}>
                                        <TableCell>{person.id}</TableCell>
                                        <TableCell>{`${person.first_name} ${person.last_name}`}</TableCell>
                                        <TableCell>{person.email}</TableCell>
                                        <TableCell>{person.location?.City}</TableCell>
                                        <TableCell>{person.location?.Country}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                            Total items: {jsonData.length}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onUploadClick}
                            disabled={isUploading}
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
                    Data uploaded successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
}