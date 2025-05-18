import { useState } from 'react';

export const useYamlProcessor = () => {
    const [yamlContent, setYamlContent] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processedData, setProcessedData] = useState<any[] | null>(null);

    function process(file: File): Promise<any[]> {
        setIsProcessing(true);
        setError(null);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;

                    // Store the original content in state
                    setYamlContent(content);

                    // Process the YAML content to JSON format
                    const processedResult = processYamlToJson(content);

                    // Store the processed result
                    setProcessedData(processedResult);

                    // Log the processed result
                    console.log("Processed YAML to JSON:", processedResult);

                    setIsProcessing(false);
                    resolve(processedResult);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to process YAML file';
                    setError(errorMessage);
                    setIsProcessing(false);
                    reject(errorMessage);
                }
            };

            reader.onerror = () => {
                const errorMessage = 'Error reading the YAML file';
                setError(errorMessage);
                setIsProcessing(false);
                reject(errorMessage);
            };

            // Read the file as text
            reader.readAsText(file);
        });
    }

    // Function to convert YAML content to JSON format matching the target structure
    function processYamlToJson(yamlContent: string): any[] {
        // Split the YAML content into person blocks
        const personBlocks = yamlContent.split('- ').filter(block => block.trim());

        // Process each block into a JSON object
        return personBlocks.map(block => {
            const lines = block.split('\n').filter(line => line.trim());
            const person: any = {};

            // Extract all the properties
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                const colonIndex = trimmedLine.indexOf(':');
                if (colonIndex === -1) continue;

                const key = trimmedLine.substring(0, colonIndex).trim();
                const value = trimmedLine.substring(colonIndex + 1).trim();

                // Process according to the key
                if (key === 'Android' || key === 'Desktop' || key === 'Iphone') {
                    // Handle devices
                    if (!person.devices) {
                        person.devices = [];
                    }

                    if (parseInt(value) === 1) {
                        person.devices.push(key);
                    }
                } else if (key === 'city') {
                    // Handle location: split city and country
                    const locationParts = value.split(',').map(part => part.trim());
                    const city = locationParts[0];
                    const country = locationParts.length > 1 ? locationParts[1] : '';

                    person.location = {
                        City: city,
                        Country: country
                    };
                } else if (key === 'name') {
                    // Split into first_name and last_name
                    const nameParts = value.split(' ');
                    person.first_name = nameParts[0];
                    person.last_name = nameParts.slice(1).join(' ');
                } else if (key === 'id') {
                    // Format ID as a 4-digit string
                    person.id = value.toString().padStart(4, '0');
                } else if (key === 'phone') {
                    person.telephone = value;
                } else if (key === 'dob') {
                    // Parse the date format
                    if (value.includes('/')) {
                        // Already in MM/DD/YYYY format
                        person.dob = value;
                    } else {
                        // Parse date like "May 20, 2000" or "May 20 2000"
                        const months: Record<string, string> = {
                            'January': '01', 'February': '02', 'March': '03', 'April': '04',
                            'May': '05', 'June': '06', 'July': '07', 'August': '08',
                            'September': '09', 'October': '10', 'November': '11', 'December': '12'
                        };

                        try {
                            // Handle date with or without comma
                            let parts;
                            if (value.includes(',')) {
                                parts = value.split(',').map(part => part.trim());
                                const monthDay = parts[0].split(' ');
                                const month = months[monthDay[0]];
                                const day = monthDay[1].padStart(2, '0');
                                const year = parts[1];
                                person.dob = `${month}/${day}/${year}`;
                            } else {
                                parts = value.split(' ');
                                if (parts.length === 3) {
                                    const month = months[parts[0]];
                                    const day = parts[1].padStart(2, '0');
                                    const year = parts[2];
                                    person.dob = `${month}/${day}/${year}`;
                                } else {
                                    // If we can't parse it, just store as is
                                    person.dob = value;
                                }
                            }
                        } catch (e) {
                            // If date parsing fails, just store the original value
                            person.dob = value;
                        }
                    }
                } else if (key === 'email') {
                    // Copy the email field
                    person.email = value;
                } else {
                    // For any other fields, just copy as is
                    person[key] = value;
                }
            }

            return person;
        });
    }

    return {
        process,
        yamlContent,
        processedData,
        isProcessing,
        error
    };
};