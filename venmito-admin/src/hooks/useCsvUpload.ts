import Papa from 'papaparse';

export const useCsvUpload = () => {
    /**
     * Converts CSV string to JSON array
     * @param csv The CSV string to convert
     * @returns The parsed data as an array of objects
     */
    function convertCsvToJson(csv: string): any[] {
        const result = Papa.parse<any>(csv, {
            header: true,           // Use first row as headers
            skipEmptyLines: true,   // Skip empty rows
            dynamicTyping: true,    // Convert strings to numbers/booleans when appropriate
            // Remove trimHeaders as it's not recognized in the type definitions
            transform: (value) => {
                // Manually trim string values instead
                return typeof value === 'string' ? value.trim() : value;
            }
        });

        return result.data;
    }

    /**
     * Handles file upload and conversion
     * @param file The CSV file to process
     * @returns Promise resolving to the parsed JSON data
     */
    function handleCsvFileUpload(file: File): Promise<any[]> {
        return new Promise((resolve, reject) => {
            Papa.parse<any>(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                // Remove trimHeaders here too
                transform: (value) => {
                    return typeof value === 'string' ? value.trim() : value;
                },
                complete: (result) => {
                    // Process headers to trim them manually since trimHeaders isn't available
                    if (result.data.length > 0) {
                        const firstRow = result.data[0];
                        const newFirstRow: any = {};

                        // Create a new first row with trimmed headers
                        Object.keys(firstRow).forEach(key => {
                            const trimmedKey = key.trim();
                            newFirstRow[trimmedKey] = firstRow[key];

                            // If the key changed after trimming, delete the old one from all rows
                            if (trimmedKey !== key) {
                                result.data.forEach(row => {
                                    row[trimmedKey] = row[key];
                                    delete row[key];
                                });
                            }
                        });
                    }

                    resolve(result.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }

    return {
        convertCsvToJson,
        handleCsvFileUpload
    };
};