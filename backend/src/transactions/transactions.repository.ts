import { Injectable } from "@nestjs/common";
import db from "../database"

@Injectable()
export class TransactionsRepository {
    // Implement your database operations here
    private readonly tableName = 'transactions';
    async findTransactions(): Promise<any[]> {
        // Implement your database query to retrieve transactions
        // Return the result as an array of transaction objects
        return [
            { id: 1, amount: 100, description: 'Sample Transaction' },
            { id: 2, amount: 200, description: 'Another Transaction' }
        ]
    }

    async bulkCreateTransactions(transactions: any[]): Promise<any[]> {
        // Implement your database operation to create multiple transactions
        // Return the result as an array of created transaction objects
        return db.transaction(async (trx) => {
            const insertedTransactions: any = [];
            let person;
            for (const transactionData of transactions) {
                // Find the person with the matching phone number
                try {
                    person = await trx('people').where({ telephone: transactionData.phone }).first();
                    if (!person) {
                        console.log(`No matching person found for phone number ${transactionData.phone} in transaction ${transactionData.id}`)
                        continue;
                    }
                } catch (error) {
                    console.error(`Error finding person with phone number ${transactionData.phone} in transaction ${transactionData.id}`)
                    continue;
                }
                // Prepare transaction data for insertion
                const transactionToInsert = {
                    external_id: transactionData["@_id"],
                    peopleId: person.id,
                    phone: transactionData.phone,
                    store: transactionData.store,
                    transaction_date: transactionData.date,
                    total_amount: transactionData.totalPrice,
                };

                let transactionId;
                try {
                    // Check if transaction already exists
                    const existingTransaction = await trx(this.tableName).where({
                        external_id: transactionToInsert.external_id,
                    }).first();
                    if (existingTransaction) {
                        continue;
                    } else {
                        //Insert new transaction
                        const [newTransaction] = await trx(this.tableName).insert(transactionToInsert).returning('*');
                        transactionId = newTransaction.id;
                    }
                } catch (error) {
                    console.error(`Error inserting transaction for ${transactionData.phone}: `, error);
                    continue;
                }

                // Handle Items
                if (transactionData.items.item && transactionData.items.item.length > 0) {
                    try {
                        // Remove existing item associations
                        await trx('transaction_items').where({ transaction_id: transactionId }).del();

                        // Insert or get items and create associations
                        for (const itemData of transactionData.items.item) {
                            // we need name, default_price for items
                            // we need transaction_id, item_id, quantity,  for transaction_items
                            const itemName = itemData.item[0];
                            const defaultPrice = itemData.price_per_item;
                            console.log("defaultPrice: ", defaultPrice);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
                insertedTransactions.push({
                    id: transactionId,
                    ...transactionToInsert,
                });

            }
            return insertedTransactions;
        });
    }
}