import { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
    data: any;
    error?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method === "GET") {
        return getTransactions(req, res);
    } else {
        return res.status(405).json({ data: "", error: "Method not allowed" });
    }
}

async function getTransactions(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    try {
        const response = await fetch("http://localhost:5000/transactions")
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const transactions = await response.json();
        res.status(200).json({ data: transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({ data: "", error: "Internal server error" });
    }
}
