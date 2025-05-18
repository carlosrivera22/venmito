
import { useState, useEffect } from 'react';

// Define the Person type to match your API
type Person = {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
};

// Custom hook for managing people data
export const usePeople = () => {
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch people from the API
    const fetchPeople = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/people');
            if (!response.ok) {
                throw new Error('Failed to fetch people');
            }
            const data = await response.json();
            setPeople(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new person
    const createPerson = async (personData: Partial<Person>) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/people', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personData),
            });

            if (!response.ok) {
                throw new Error('Failed to create person');
            }

            const newPerson = await response.json();
            setPeople(prevPeople => [...prevPeople, newPerson.data]);
            return newPerson.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Optional: Fetch people on initial load
    useEffect(() => {
        fetchPeople();
    }, []);

    return {
        people,
        setPeople,
        fetchPeople,
        createPerson,
        isLoading,
        error
    };
};