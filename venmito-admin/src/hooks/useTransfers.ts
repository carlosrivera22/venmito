export default function useTransfers() {
    return {
        transfers: [
            {
                id: '1',
                name: 'Transfer 1',
                amount: 100,
                currency: 'USD',
            },
            {
                id: '2',
                name: 'Transfer 2',
                amount: 200,
                currency: 'EUR',
            },
        ],
    };
}