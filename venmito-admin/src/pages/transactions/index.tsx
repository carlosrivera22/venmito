import useTransactions from "@/hooks/useTransactions";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default function Transactions() {
    const { transactions } = useTransactions();
    if (!transactions) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <h1>Transactions</h1>
            <ul>
                {transactions.map((transaction: { id: Key | null | undefined; description: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; amount: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
                    <li key={transaction.id}>
                        {transaction.description} - ${transaction.amount}
                    </li>
                ))}
            </ul>
        </div>
    );
}