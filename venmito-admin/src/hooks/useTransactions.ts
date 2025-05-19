import { useEffect, useState } from "react";

export default function useTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/transactions");
            if (!response.ok) {
                setError("Error fetching transactions");
                setIsLoading(false);
                return;
            }
            const transactions = await response.json();
            setTransactions(transactions.data);
            setIsLoading(false);
        } catch (error) {
            setError("Error fetching transactions")
        } finally {
            setIsLoading(false);
        }

    };

    useEffect(() => {
        fetchTransactions()
    }, [])
    return { transactions, isLoading, error };
}