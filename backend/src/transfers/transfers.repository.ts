import { Injectable } from "@nestjs/common";
import db from "../database";

@Injectable()
export class TransfersRepository {
    private readonly tableName = 'transfers';
    async findTransfers() {
        return [{
            id: 1,
            amount: 100,
            sender: 'sender',
            receiver: 'receiver',
            status: 'pending'
        }]
    }

    async bulkCreateTransfers(transfers: any[]) {
        console.log("transfers: ", transfers);
        return db.transaction(async (trx) => {
            const insertedTransfers: any = [];
            for (const transfer of transfers) {
                try {
                    const paddedRecipient = transfer.recipient_id.toString().padStart(4, '0');
                    const paddedSender = transfer.sender_id.toString().padStart(4, '0');
                    console.log("Recipient: ", paddedRecipient);
                    console.log("Sender: ", paddedSender);
                } catch (error) {
                    console.error(error);
                }
            }
            return insertedTransfers;
        })
    }
}