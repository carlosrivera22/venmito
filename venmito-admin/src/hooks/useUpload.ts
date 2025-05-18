import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useYamlProcessor } from './useYamlProcessor';

// Type for validation function
type ValidationFunction = (data: any[]) => boolean | string;

// Default validation function
const defaultValidation: ValidationFunction = (data) => {
    // Ensure data is an array
    if (!Array.isArray(data)) {
        return 'JSON must be an array of objects';
    }

    // Optional: Add more specific validation
    if (data.length > 0) {
        const firstItem = data[0];
        const requiredFields = [
            'id', 'first_name', 'last_name', 'email',
            'telephone', 'location', 'devices', 'dob'
        ];

        const missingFields = requiredFields.filter(
            field => !(field in firstItem)
        );

        if (missingFields.length > 0) {
            return `Missing required fields: ${missingFields.join(', ')}`;
        }
    }

    return true;
};

// Options for the hook
interface UseFileUploadOptions {
    validate?: ValidationFunction;
    maxItems?: number;
    allowedTypes?: string[];
}

export const useFileUpload = (
    options: UseFileUploadOptions = {}
) => {
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { process } = useYamlProcessor();

    // Merge options with defaults
    const {
        validate = defaultValidation,
        maxItems = 2000,
        allowedTypes = ['application/json', 'application/x-yaml', 'text/yaml', 'text/x-yaml']
    } = options;

    // File drop handler
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];

        // Check if file exists
        if (!file) {
            setUploadError('No file selected');
            return;
        }

        // Detect file type based on extension and mime type
        const isYaml = file.name.endsWith('.yml') ||
            file.name.endsWith('.yaml') ||
            file.type === 'application/x-yaml' ||
            file.type === 'text/yaml' ||
            file.type === 'text/x-yaml';

        const isJson = file.name.endsWith('.json') ||
            file.type === 'application/json';

        // If neither yaml nor json, show error
        if (!isYaml && !isJson) {
            setUploadError('Please upload a JSON or YAML file');
            return;
        }

        try {
            // Handle YAML files
            if (isYaml) {
                try {
                    const processedData = await process(file);

                    // Validate processed YAML data
                    const validationResult = validate(processedData);

                    // Check validation result
                    if (validationResult !== true) {
                        throw new Error(validationResult as string);
                    }

                    // Limit number of items if specified
                    const limitedData = processedData.slice(0, maxItems);
                    console.log("Processed YAML data:", limitedData);
                    setJsonData(limitedData);
                    setUploadSuccess(true);
                    setUploadError(null);
                } catch (error) {
                    setUploadError(error instanceof Error ? error.message : 'Failed to process YAML file');
                    setJsonData([]);
                }
                return;
            }

            // Continue with JSON processing as before
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = JSON.parse(event.target?.result as string);

                    // Validate JSON structure
                    const validationResult = validate(jsonContent);

                    // Check validation result
                    if (validationResult !== true) {
                        throw new Error(validationResult as string);
                    }

                    // Limit number of items if specified
                    const limitedData = jsonContent.slice(0, maxItems);
                    console.log("JSON DATA: ", limitedData);
                    setJsonData(limitedData);
                    setUploadSuccess(true);
                    setUploadError(null);
                } catch (error) {
                    setUploadError(error instanceof Error ? error.message : 'Invalid file');
                    setJsonData([]);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Error processing file');
            setJsonData([]);
        }
    }, [validate, maxItems, process]);

    // Dropzone hook
    const dropzone = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json'],
            'application/x-yaml': ['.yml', '.yaml'],
            'text/yaml': ['.yml', '.yaml'],
            'text/x-yaml': ['.yml', '.yaml']
        },
        multiple: false
    });

    // Upload handler
    const handleUpload = async (uploadUrl: string) => {
        console.log("JSON DATA: ", jsonData);
        if (jsonData.length === 0) {
            setUploadError('No data to upload');
            return;
        }

        setIsUploading(true);
        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(errorBody || 'Failed to upload data');
            }

            const result = await response.json();
            console.log(result);
            setUploadSuccess(true);
            setUploadError(null);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Upload failed';
            setUploadError(errorMessage);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    // Reset function
    const reset = () => {
        setJsonData([]);
        setUploadError(null);
        setUploadSuccess(false);
    };

    // Expose a method to manually set JSON data
    const setData = (data: any[]) => {
        try {
            // Validate the data first
            const validationResult = validate(data);

            // Check validation result
            if (validationResult !== true) {
                throw new Error(validationResult as string);
            }

            // Limit number of items if specified
            const limitedData = data.slice(0, maxItems);
            setJsonData(limitedData);
            setUploadSuccess(true);
            setUploadError(null);
            return true;
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Invalid data format');
            return false;
        }
    };

    return {
        jsonData,
        uploadError,
        uploadSuccess,
        isUploading,
        dropzone,
        handleUpload,
        reset,
        setUploadError,
        setUploadSuccess,
        setData // Expose the new method to manually set data
    };
};