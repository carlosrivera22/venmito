import { useState } from 'react';

export const useYamlProcessor = () => {
    const [yamlContent, setYamlContent] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function process(file: File): Promise<string> {
        console.log("todo: implement yaml processor");
        setIsProcessing(true);
        setError(null);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;

                    // Log the file contents
                    console.log("YAML file content:", content);

                    // Store the content in state for potential use later
                    setYamlContent(content);

                    setIsProcessing(false);
                    resolve(content);
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

    return {
        process,
        yamlContent,
        isProcessing,
        error
    };
};