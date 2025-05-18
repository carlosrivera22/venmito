import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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

    // Merge options with defaults
    const {
        validate = defaultValidation,
        maxItems = 2000,
        allowedTypes = ['application/json']
    } = options;

    // File drop handler
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            setUploadError(`Please upload a ${allowedTypes.join(' or ')} file`);
            return;
        }

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

                setJsonData(limitedData);
                setUploadSuccess(true);
                setUploadError(null);
            } catch (error) {
                setUploadError(error instanceof Error ? error.message : 'Invalid file');
                setJsonData([]);
            }
        };
        reader.readAsText(file);
    }, [validate, maxItems, allowedTypes]);

    // Dropzone hook
    const dropzone = useDropzone({
        onDrop,
        accept: Object.fromEntries(
            allowedTypes.map(type => [type, []])
        ),
        multiple: false
    });

    // Upload handler
    const handleUpload = async (uploadUrl: string) => {
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

    return {
        jsonData,
        uploadError,
        uploadSuccess,
        isUploading,
        dropzone,
        handleUpload,
        reset,
        setUploadError,
        setUploadSuccess
    };
};