import { useEffect, useState } from "react";

export default function useTransfers() {
    const [transfers, setTransfers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransfers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/transfers");
            if (!response.ok) {
                setError("Error fetching transfers");
                setIsLoading(false);
                return;
            }
            const data = await response.json();
            setTransfers(data);
            setIsLoading(false);
        } catch (error) {
            setError("Error fetching transfers");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, []);

    return { transfers, isLoading, error };
}