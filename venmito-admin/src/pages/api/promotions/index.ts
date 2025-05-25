import { NextApiRequest, NextApiResponse } from "next"

type ResponseData = {
    data: any,
    error?: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    switch (req.method) {
        case 'GET':
            return getPromotions(req, res)
        default:
            return res.status(405).end()
    }
}

async function getPromotions(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    try {
        const response = await fetch("http://backend:5000/promotions");

        if (!response.ok) {
            throw new Error("Network response was not ok")
        }

        const promotions = await response.json();
        return res.status(200).json({ data: promotions })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ data: "", error: "An error occurred while fetching promotions" })
    }
}
