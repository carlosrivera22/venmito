import { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
    data: any;
    error?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    switch (req.method) {
        case 'GET':
            return getTransfers(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function getTransfers(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    try {
        const response = await fetch('http://backend:5001/transfers')
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const transfers = await response.json();
        return res.status(200).json({ data: transfers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ data: "", error: 'Internal Server Error' });
    }
}