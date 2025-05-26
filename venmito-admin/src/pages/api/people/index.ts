// pages/api/people.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
    data: any;
    error?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // Handle different HTTP methods
    switch (req.method) {
        case "GET":
            return getPeople(req, res);
        case "POST":
            return createPerson(req, res);
        default:
            return res.status(405).json({ data: "", error: "Method not allowed" });
    }
}

// Function to fetch people from localhost:5001
async function getPeople(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    try {
        // Fetch data from your local API
        const response = await fetch("http://backend:5001/people");

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        // Parse the JSON data
        const people = await response.json();

        return res.status(200).json({ data: people });
    } catch (error) {
        console.error("Error fetching people:", error);
        return res.status(500).json({
            data: "",
            error: "Failed to fetch people from external API"
        });
    }
}

// Additional handler for POST requests
async function createPerson(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    try {
        const { name, first_name, last_name, email } = req.body;

        if (!name && (!first_name || !last_name)) {
            return res.status(400).json({
                data: "",
                error: "Name or first_name and last_name are required"
            });
        }

        // Call your external API to create a person
        const response = await fetch("http://backend:5001/people", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                first_name,
                last_name,
                email
            }),
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const newPerson = await response.json();
        return res.status(201).json({ data: newPerson });
    } catch (error) {
        console.error("Error creating person:", error);
        return res.status(500).json({
            data: "",
            error: "Failed to create person"
        });
    }
}