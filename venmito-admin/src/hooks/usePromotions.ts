import { useEffect, useState } from "react";

export const usePromotions = () => {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPromotions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/promotions");
            if (!response.ok) {
                setError("Error fetching promotions");
                setIsLoading(false);
                return;
            }
            const promotions = await response.json();
            setPromotions(promotions.data);
            setIsLoading(false);
        } catch (error) {
            setError("Error fetching promotions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    return { promotions, isLoading, error };
};