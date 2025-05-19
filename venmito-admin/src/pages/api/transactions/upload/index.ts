import { NextApiRequest, NextApiResponse } from "next"

type ResponseData = {
    data: any,
    error?: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ data: "", error: 'Method not allowed' })
    }
    const { data: transactionsData } = req.body
    if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
        return res.status(400).json({
            data: "", error: 'Invalid or empty upload data'
        });
    }

    try {
        const response = await fetch("http://localhost:5000/transactions/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transactionsData),
        });

        if (!response.ok) {
            return res.status(response.status).json({
                data: "",
                error: `Error uploading transactions: ${response.statusText}`,
            });
        }

        const result = await response.json();
        return res.status(200).json({
            data: {
                message: "Bulk upload successful",
                insertedCount: result.insertedCount || transactionsData.length,
                details: result
            }
        });
    } catch (error) {
        console.error("Bulk upload error:", error);
        return res.status(500).json({
            data: "",
            error: error instanceof Error
                ? error.message
                : "Failed to complete bulk upload"
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    },
};
