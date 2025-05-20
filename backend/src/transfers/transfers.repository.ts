import { Injectable } from "@nestjs/common";
import db from "../database";

@Injectable()
export class TransfersRepository {
    private readonly tableName = 'transfers';
    async findTransfers() {
        // Query to fetch all transfers with sender and recipient information
        const transfers = await db(this.tableName)
            .select([
                `${this.tableName}.*`,
                'sender.firstName as senderFirstName',
                'sender.lastName as senderLastName',
                'sender.identifier as senderIdentifier',
                'recipient.firstName as recipientFirstName',
                'recipient.lastName as recipientLastName',
                'recipient.identifier as recipientIdentifier'
            ])
            .leftJoin('people as sender', `${this.tableName}.senderId`, 'sender.id')
            .leftJoin('people as recipient', `${this.tableName}.recipientId`, 'recipient.id')
            .orderBy(`${this.tableName}.date`, 'desc');

        // Transform the results to have a cleaner structure
        return transfers.map(transfer => ({
            id: transfer.id,
            amount: transfer.amount,
            date: transfer.date,
            status: transfer.status,
            sender: {
                id: transfer.senderId,
                identifier: transfer.senderIdentifier,
                firstName: transfer.senderFirstName,
                lastName: transfer.senderLastName,
                name: `${transfer.senderFirstName} ${transfer.senderLastName}`
            },
            recipient: {
                id: transfer.recipientId,
                identifier: transfer.recipientIdentifier,
                firstName: transfer.recipientFirstName,
                lastName: transfer.recipientLastName,
                name: `${transfer.recipientFirstName} ${transfer.recipientLastName}`
            }
        }));
    }

    async bulkCreateTransfers(transfers: any[]) {
        console.log("transfers: ", transfers);
        return db.transaction(async (trx) => {
            const insertedTransfers: any = [];
            for (const transfer of transfers) {
                try {
                    //Skip entries without sender or recipient
                    if (!transfer.sender_id || !transfer.recipient_id) {
                        continue;
                    }
                    //Check if sender and recipient exist
                    const paddedRecipient = transfer.recipient_id.toString().padStart(4, '0');
                    const paddedSender = transfer.sender_id.toString().padStart(4, '0');
                    let recipient;
                    let sender;
                    try {
                        recipient = await trx('people')
                            .where({ identifier: paddedRecipient })
                            .first();
                        sender = await trx('people')
                            .where({ identifier: paddedSender })
                            .first();

                        if (!recipient || !sender) {
                            console.log("Recipient or sender not found");
                            continue;
                        }
                    } catch (error) {
                        console.error(`Error finding recipient or sender: ${error}`);
                        continue;
                    }

                    const transferToInsert = {
                        senderId: sender.id,
                        recipientId: recipient.id,
                        amount: transfer.amount,
                        date: transfer.date,
                    };

                    let transferId;
                    try {
                        //Insert the transfer
                        const newTransfer = await trx('transfers').insert(transferToInsert);
                        transferId = newTransfer[0];
                        insertedTransfers.push(transferId);
                        console.log("Transfer inserted: ", transferId);
                    } catch (error) {
                        console.error(`Error inserting transfer: ${error}`);
                    }

                } catch (error) {
                    console.error(error);
                }
            }
            if (insertedTransfers.length === 0) throw new Error('No inserted transfers')
            return insertedTransfers;
        })
    }
}