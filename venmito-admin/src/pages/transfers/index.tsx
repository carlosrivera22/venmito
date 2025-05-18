import useTransfers from "@/hooks/useTransfers";

export default function Transfers() {
    const { transfers } = useTransfers();
    return (
        <div>
            <h1>Transfers</h1>
            {JSON.stringify(transfers)}
        </div>
    );
}