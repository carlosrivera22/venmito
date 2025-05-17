// src/hooks/useFileProcessor.ts
import { useState } from 'react';
import yaml from 'js-yaml';
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

// Custom hook for processing YAML files
export const useYamlProcessor = () => {
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

    // Function to parse YAML with handling for the non-standard format
    const parseYamlData = (content: string): { records: StandardizedRecord[], schema: string[] } => {
        try {
            // First try standard YAML parsing
            const parsedData = yaml.load(content);

            if (Array.isArray(parsedData)) {
                // Extract schema from the first few records
                const schema = extractSchema(parsedData);
                return {
                    records: parsedData.map(record => cleanRecord(record)),
                    schema
                };
            }

            // If it's a single object, wrap it in an array
            if (parsedData && typeof parsedData === 'object') {
                const schema = extractSchema([parsedData]);
                return {
                    records: [cleanRecord(parsedData)],
                    schema
                };
            }

            // Handle the specific non-standard format from your example
            // Format: "- key1: value1   key2: value2   key3: value3"
            const peopleEntries = content.split('-').filter(entry => entry.trim());

            if (peopleEntries.length > 0) {
                const parsedRecords = peopleEntries.map(entry => {
                    const record: Record<string, any> = {};

                    // Split by multiple spaces or tabs
                    entry.trim().split(/\s{2,}|\t+/).forEach(part => {
                        const keyValue = part.split(':');
                        if (keyValue.length >= 2) {
                            const key = keyValue[0].trim();
                            const value = keyValue.slice(1).join(':').trim();
                            if (key && value !== undefined) {
                                record[key] = value;
                            }
                        }
                    });

                    return cleanRecord(record);
                });

                // Extract schema from the parsed records
                const schema = extractSchema(parsedRecords);

                return { records: parsedRecords, schema };
            }

            throw new Error("Could not parse YAML content in any recognized format");

        } catch (error) {
            console.error("Error parsing YAML", error);
            throw new Error("Invalid YAML format");
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
            // Normalize key names (lowercase, remove spaces)
            const normalizedKey = key.trim();

            // Skip empty values
            if (value === undefined || value === null || value === '') {
                return;
            }

            // Process specific fields
            if (normalizedKey.toLowerCase().includes('name')) {
                handleNameField(normalizedKey, value, cleanedRecord);
            }
            else if (normalizedKey.toLowerCase().includes('email')) {
                cleanedRecord['email'] = String(value).trim();
            }
            else if (normalizedKey.toLowerCase().includes('phone') ||
                normalizedKey.toLowerCase().includes('telephone')) {
                cleanedRecord['phone'] = String(value).trim();
            }
            else if (normalizedKey.toLowerCase() === 'id' ||
                normalizedKey.toLowerCase() === '_id') {
                cleanedRecord['id'] = String(value);
            }
            else if (normalizedKey.toLowerCase().includes('city') ||
                normalizedKey.toLowerCase().includes('country') ||
                normalizedKey.toLowerCase().includes('location')) {
                handleLocationField(normalizedKey, value, cleanedRecord);
            }
            else if (normalizedKey.toLowerCase().includes('dob') ||
                normalizedKey.toLowerCase().includes('birth')) {
                cleanedRecord['dob'] = String(value);
            }
            else if (['android', 'desktop', 'iphone'].includes(normalizedKey.toLowerCase())) {
                handleDeviceField(normalizedKey, value, cleanedRecord);
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

    // Helper function to handle name fields
    const handleNameField = (key: string, value: any, record: StandardizedRecord) => {
        const lowerKey = key.toLowerCase();

        if (lowerKey === 'name') {
            record['name'] = String(value);

            // Try to split the name into first and last name
            const nameParts = String(value).split(' ');
            if (nameParts.length > 1) {
                record['first_name'] = nameParts[0];
                record['last_name'] = nameParts.slice(1).join(' ');
            } else {
                record['first_name'] = String(value);
            }
        }
        else if (lowerKey === 'first_name' || lowerKey === 'firstname') {
            record['first_name'] = String(value);

            // If we have a last name already, build the full name
            if (record['last_name']) {
                record['name'] = `${record['first_name']} ${record['last_name']}`;
            }
        }
        else if (lowerKey === 'last_name' || lowerKey === 'lastname') {
            record['last_name'] = String(value);

            // If we have a first name already, build the full name
            if (record['first_name']) {
                record['name'] = `${record['first_name']} ${record['last_name']}`;
            }
        }
    };

    // Helper function to handle location fields
    const handleLocationField = (key: string, value: any, record: StandardizedRecord) => {
        // Initialize location object if it doesn't exist
        if (!record['location']) {
            record['location'] = {};
        }

        const lowerKey = key.toLowerCase();

        if (lowerKey === 'city') {
            // Handle "City, Country" format
            if (String(value).includes(',')) {
                const [city, country] = String(value).split(',').map(s => s.trim());
                record['location']['City'] = city;
                record['location']['Country'] = country;
            } else {
                record['location']['City'] = String(value);
            }
        }
        else if (lowerKey === 'country') {
            record['location']['Country'] = String(value);
        }
        else if (lowerKey === 'location') {
            // If location is already an object, merge it
            if (typeof value === 'object') {
                record['location'] = { ...record['location'], ...value };
            } else {
                record['location']['address'] = String(value);
            }
        }
    };

    // Helper function to handle device fields
    const handleDeviceField = (key: string, value: any, record: StandardizedRecord) => {
        // Initialize devices array if it doesn't exist
        if (!record['devices']) {
            record['devices'] = [];
        }

        // Check if the device value indicates presence (1, true, etc.)
        const isPresent = [1, '1', true, 'true', 'yes', 'y'].includes(value);

        if (isPresent) {
            // Capitalize first letter for device name
            const deviceName = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
            if (!record['devices'].includes(deviceName)) {
                record['devices'].push(deviceName);
            }
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
            // Filter only YAML/YML files
            const yamlFiles = files.filter(file => {
                const extension = file.name.split('.').pop()?.toLowerCase();
                return extension === 'yml' || extension === 'yaml';
            });

            if (yamlFiles.length === 0) {
                throw new Error('No YAML/YML files found. Please upload YAML/YML files only.');
            }

            // Process each YAML file
            const processedResults: ProcessingResult[] = await Promise.all(
                yamlFiles.map(async (file) => {
                    try {
                        const fileContent = await readFileAsText(file);
                        const { records, schema } = parseYamlData(fileContent);

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
                fileCount: yamlFiles.length,
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
            if (filesWithErrors.length === yamlFiles.length) {
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