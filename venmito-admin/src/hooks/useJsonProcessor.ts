// src/hooks/useJsonProcessor.ts
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define types for our hook
interface StandardizedRecord {
    [key: string]: any;
}

interface ProcessingResult {
    filename: string;
    recordCount: number;
    data: StandardizedRecord[];
    error: string | null;
    schema: string[];
}

interface ProcessingSummary {
    message: string;
    fileCount: number;
    totalRecords: number;
    commonFields: string[];
    standardizedData: StandardizedRecord[];
    results: {
        filename: string;
        recordCount: number;
        success: boolean;
        error: string | null;
        identifiedFields: string[];
    }[];
}

// Custom hook for processing JSON files
export const useJsonProcessor = () => {
    const [processing, setProcessing] = useState(false);
    const [processedData, setProcessedData] = useState<ProcessingSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Function to read file content as text
    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    };

    // Function to parse JSON data
    const parseJsonData = (content: string): { records: StandardizedRecord[], schema: string[] } => {
        try {
            const parsedData = JSON.parse(content);

            let records: Record<string, any>[] = [];

            if (Array.isArray(parsedData)) {
                records = parsedData;
            } else if (parsedData && typeof parsedData === 'object') {
                // If it's a single object, wrap it in an array
                records = [parsedData];
            } else {
                throw new Error("Invalid JSON format: Expected an object or array of objects");
            }

            // Standardize each record
            const standardizedRecords = records.map(cleanRecord);

            // Extract schema from records
            const schema = extractSchema(standardizedRecords);

            return { records: standardizedRecords, schema };

        } catch (error) {
            console.error("Error parsing JSON", error);
            throw new Error("Invalid JSON format");
        }
    };

    // Function to extract schema (field names) from records
    const extractSchema = (records: Record<string, any>[]): string[] => {
        const fieldsSet = new Set<string>();

        records.forEach(record => {
            if (record && typeof record === 'object') {
                Object.keys(record).forEach(key => fieldsSet.add(key));
            }
        });

        return Array.from(fieldsSet);
    };

    // Function to clean and normalize a record
    const cleanRecord = (record: Record<string, any>): StandardizedRecord => {
        if (!record || typeof record !== 'object') {
            return { id: uuidv4().slice(0, 8) };
        }

        const cleanedRecord: StandardizedRecord = {};

        // Process each field
        Object.entries(record).forEach(([key, value]) => {
            // Normalize key names (trim)
            const normalizedKey = key.trim();

            // Skip empty values
            if (value === undefined || value === null || value === '') {
                return;
            }

            // Process specific fields
            if (normalizedKey.toLowerCase() === 'id' ||
                normalizedKey.toLowerCase() === '_id') {
                cleanedRecord['id'] = String(value);
            }
            else if (normalizedKey.toLowerCase() === 'first_name' ||
                normalizedKey.toLowerCase() === 'firstname') {
                cleanedRecord['first_name'] = String(value);
                updateFullName(cleanedRecord);
            }
            else if (normalizedKey.toLowerCase() === 'last_name' ||
                normalizedKey.toLowerCase() === 'lastname') {
                cleanedRecord['last_name'] = String(value);
                updateFullName(cleanedRecord);
            }
            else if (normalizedKey.toLowerCase() === 'name') {
                handleNameField(value, cleanedRecord);
            }
            else if (normalizedKey.toLowerCase().includes('email')) {
                cleanedRecord['email'] = String(value).trim();
            }
            else if (normalizedKey.toLowerCase().includes('phone') ||
                normalizedKey.toLowerCase().includes('telephone')) {
                cleanedRecord['phone'] = String(value).trim();
            }
            else if (normalizedKey.toLowerCase() === 'devices') {
                // Handle devices array or string
                if (Array.isArray(value)) {
                    cleanedRecord['devices'] = [...value];
                } else if (typeof value === 'string') {
                    cleanedRecord['devices'] = [value];
                }
            }
            else if (normalizedKey.toLowerCase() === 'location') {
                // Handle location object
                if (typeof value === 'object') {
                    cleanedRecord['location'] = { ...value };
                } else {
                    cleanedRecord['location'] = { address: String(value) };
                }
            }
            else if (normalizedKey.toLowerCase() === 'city' &&
                !cleanedRecord['location']) {
                // Create location object if it doesn't exist
                cleanedRecord['location'] = {
                    City: String(value)
                };
            }
            else if (normalizedKey.toLowerCase() === 'country' &&
                cleanedRecord['location']) {
                // Add country to existing location
                cleanedRecord['location']['Country'] = String(value);
            }
            else if (normalizedKey.toLowerCase() === 'country' &&
                !cleanedRecord['location']) {
                // Create location object with country
                cleanedRecord['location'] = {
                    Country: String(value)
                };
            }
            else if (normalizedKey.toLowerCase().includes('dob') ||
                normalizedKey.toLowerCase().includes('birth')) {
                cleanedRecord['dob'] = String(value);
            }
            else {
                // For other fields, just copy them
                cleanedRecord[normalizedKey] = value;
            }
        });

        // Ensure we have an ID
        if (!cleanedRecord['id']) {
            cleanedRecord['id'] = uuidv4().slice(0, 8);
        }

        return cleanedRecord;
    };

    // Helper function to handle name field
    const handleNameField = (value: any, record: StandardizedRecord) => {
        record['name'] = String(value);

        // Try to split the name into first and last name if not already present
        if (!record['first_name'] && !record['last_name']) {
            const nameParts = String(value).split(' ');
            if (nameParts.length > 1) {
                record['first_name'] = nameParts[0];
                record['last_name'] = nameParts.slice(1).join(' ');
            } else {
                record['first_name'] = String(value);
            }
        }
    };

    // Helper function to update the full name when first or last name changes
    const updateFullName = (record: StandardizedRecord) => {
        if (record['first_name'] || record['last_name']) {
            record['name'] = `${record['first_name'] || ''} ${record['last_name'] || ''}`.trim();
        }
    };

    // Function to find common fields across all records
    const findCommonFields = (results: ProcessingResult[]): string[] => {
        // Get all unique fields from all schemas
        const allFields = new Set<string>();
        results.forEach(result => {
            result.schema.forEach(field => allFields.add(field));
        });

        // Find fields that exist in at least one record from each file
        const commonFields: string[] = [];

        allFields.forEach(field => {
            const isCommon = results.every(result =>
                result.schema.includes(field)
            );

            if (isCommon) {
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
            // Filter only JSON files
            const jsonFiles = files.filter(file => {
                const extension = file.name.split('.').pop()?.toLowerCase();
                return extension === 'json';
            });

            if (jsonFiles.length === 0) {
                throw new Error('No JSON files found. Please upload JSON files only.');
            }

            // Process each JSON file
            const processedResults: ProcessingResult[] = await Promise.all(
                jsonFiles.map(async (file) => {
                    try {
                        const fileContent = await readFileAsText(file);
                        const { records, schema } = parseJsonData(fileContent);

                        return {
                            filename: file.name,
                            recordCount: records.length,
                            data: records,
                            error: null,
                            schema
                        };
                    } catch (err: any) {
                        console.error(`Error processing ${file.name}:`, err);
                        return {
                            filename: file.name,
                            recordCount: 0,
                            data: [],
                            error: err.message || `Error processing ${file.name}`,
                            schema: []
                        };
                    }
                })
            );

            // Find common fields across all records
            const commonFields = findCommonFields(processedResults);

            // Combine results from all files
            const allData = processedResults.flatMap(result => result.data);

            setProcessedData({
                message: "Files processed successfully",
                fileCount: jsonFiles.length,
                totalRecords: allData.length,
                commonFields,
                standardizedData: allData,
                results: processedResults.map(result => ({
                    filename: result.filename,
                    recordCount: result.recordCount,
                    success: !result.error,
                    error: result.error,
                    identifiedFields: result.schema
                }))
            });

            // Check for files with errors
            const filesWithErrors = processedResults.filter(result => result.error);

            // If all files had errors, throw an error
            if (filesWithErrors.length === jsonFiles.length) {
                throw new Error('All files failed to process. Please check the file format.');
            }

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