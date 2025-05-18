import { usePromotions } from "@/hooks/usePromotions";

export default function Promotions() {
    const { promotions } = usePromotions();
    if (!promotions) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <h1>Promotions</h1>
            {JSON.stringify(promotions)}
        </div>
    );
}