// src/hooks/useDataProcessor.ts
import { useState } from 'react';
import { useYamlProcessor } from '@/hooks/useYamlProcessor';
import { useJsonProcessor } from '@/hooks/useJsonProcessor';

// Define combined types
export interface StandardizedRecord {
    [key: string]: any;
}

export interface ProcessingResult {
    filename: string;
    fileType: string;
    recordCount: number;
    success: boolean;
    error: string | null;
    identifiedFields: string[];
}

export interface ProcessingSummary {
    message: string;
    fileCount: number;
    totalRecords: number;
    commonFields: string[];
    standardizedData: StandardizedRecord[];
    results: ProcessingResult[];
}

export const useDataProcessor = () => {
    const [processing, setProcessing] = useState(false);
    const [processedData, setProcessedData] = useState<ProcessingSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize both processors
    const yamlProcessor = useYamlProcessor();
    const jsonProcessor = useJsonProcessor();

    // Function to group files by type
    const groupFilesByType = (files: File[]) => {
        const yamlFiles: File[] = [];
        const jsonFiles: File[] = [];
        const unsupportedFiles: File[] = [];

        files.forEach(file => {
            const extension = file.name.split('.').pop()?.toLowerCase();

            if (extension === 'yml' || extension === 'yaml') {
                yamlFiles.push(file);
            } else if (extension === 'json') {
                jsonFiles.push(file);
            } else {
                unsupportedFiles.push(file);
            }
        });

        return { yamlFiles, jsonFiles, unsupportedFiles };
    };

    // Function to find common fields across all processed data
    const findCommonFields = (yamlData: any, jsonData: any): string[] => {
        if (!yamlData && !jsonData) return [];
        if (!yamlData) return jsonData.commonFields;
        if (!jsonData) return yamlData.commonFields;

        // Get all unique fields
        const allFields = new Set<string>([
            ...yamlData.commonFields,
            ...jsonData.commonFields
        ]);

        // Check which fields exist in both processors' results
        const commonFields: string[] = [];
        allFields.forEach(field => {
            if (yamlData.commonFields.includes(field) && jsonData.commonFields.includes(field)) {
                commonFields.push(field);
            }
        });

        return commonFields;
    };

    // Main processing function
    const processFiles = async (files: File[]) => {
        if (files.length === 0) {
            setError('No files selected');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Group files by type
            const { yamlFiles, jsonFiles, unsupportedFiles } = groupFilesByType(files);

            if (yamlFiles.length === 0 && jsonFiles.length === 0) {
                throw new Error('No supported files found. Please upload YAML or JSON files.');
            }

            if (unsupportedFiles.length > 0) {
                console.warn('Unsupported files detected and skipped:',
                    unsupportedFiles.map(f => f.name).join(', '));
            }

            // Process both file types concurrently
            const yamlPromise = yamlFiles.length > 0
                ? yamlProcessor.processFiles(yamlFiles)
                : Promise.resolve(null);

            const jsonPromise = jsonFiles.length > 0
                ? jsonProcessor.processFiles(jsonFiles)
                : Promise.resolve(null);

            // Wait for both to complete
            await Promise.all([yamlPromise, jsonPromise]);

            // Combine results
            const yamlResults = yamlProcessor.processedData;
            const jsonResults = jsonProcessor.processedData;

            // If both processors returned errors, propagate the errors
            if (yamlProcessor.error && jsonProcessor.error) {
                throw new Error(
                    `Errors processing files: ${yamlProcessor.error}; ${jsonProcessor.error}`
                );
            }

            // Find common fields across all records
            const commonFields = findCommonFields(yamlResults, jsonResults);

            // Combine standardized data
            const standardizedData = [
                ...(yamlResults?.standardizedData || []),
                ...(jsonResults?.standardizedData || [])
            ];

            // Combine processing results
            const results = [
                ...(yamlResults?.results || []).map(result => ({
                    ...result,
                    fileType: 'YAML'
                })),
                ...(jsonResults?.results || []).map(result => ({
                    ...result,
                    fileType: 'JSON'
                }))
            ];

            setProcessedData({
                message: "Files processed successfully",
                fileCount: (yamlResults?.fileCount || 0) + (jsonResults?.fileCount || 0),
                totalRecords: standardizedData.length,
                commonFields,
                standardizedData,
                results
            });

        } catch (err: any) {
            console.error("Error processing files:", err);
            setError(err.message || "An error occurred while processing the files");
        } finally {
            setProcessing(false);
        }
    };

    return {
        processing,
        processedData,
        error,
        processFiles
    };
};