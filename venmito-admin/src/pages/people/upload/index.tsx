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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useFileUpload } from '@/hooks/useUpload';
import { useRouter } from 'next/router';

export default function UploadPage() {
    const [rowsToShow, setRowsToShow] = useState(10);
    const router = useRouter();
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
            router.push('/people')
        } catch (error) {
            // Error is already handled in the hook
            console.error(error);
        }
    };

    const handleRowsChange = (event: { target: { value: React.SetStateAction<number>; }; }) => {
        setRowsToShow(event.target.value);
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
                        ? 'Drop the file here ...'
                        : 'Drag \'n\' drop a JSON or YAML file here, or click to select a file'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    (*.json, *.yml, and *.yaml files are accepted)
                </Typography>
            </Box>

            {/* Preview of Uploaded Data */}
            {jsonData.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Uploaded Data Preview
                        </Typography>

                        {/* Rows selector */}
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Show Rows</InputLabel>
                            <Select
                                value={rowsToShow}
                                onChange={handleRowsChange}
                                label="Show Rows"
                            >
                                <MenuItem value={10}>10 rows</MenuItem>
                                <MenuItem value={25}>25 rows</MenuItem>
                                <MenuItem value={50}>50 rows</MenuItem>
                                <MenuItem value={100}>100 rows</MenuItem>
                                <MenuItem value={jsonData.length}>All rows</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Table with scrolling */}
                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: 400, // This sets a max height and enables vertical scrolling
                            overflow: 'auto' // Ensures both horizontal and vertical scrolling works
                        }}
                    >
                        <Table stickyHeader>
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
                                {jsonData.slice(0, rowsToShow).map((person) => (
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

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                            Showing {Math.min(rowsToShow, jsonData.length)} of {jsonData.length} items
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