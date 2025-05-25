import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
    data: any;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ data: "", error: "Method not allowed" });
    }

    // Validate input
    const peopleData = req.body;

    if (!Array.isArray(peopleData) || peopleData.length === 0) {
        return res.status(400).json({
            data: "",
            error: "Invalid or empty upload data"
        });
    }

    try {
        // Forward bulk upload to local endpoint
        const response = await fetch("http://backend:5000/people/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(peopleData)
        });

        // Check if response is ok
        if (!response.ok) {
            // Try to get error message from response
            const errorText = await response.text();
            throw new Error(errorText || `API responded with status: ${response.status}`);
        }

        // Parse the response
        const result = await response.json();

        return res.status(200).json({
            data: {
                message: "Bulk upload successful",
                insertedCount: result.insertedCount || peopleData.length,
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

// Disable body parsing size limit for large uploads
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
}