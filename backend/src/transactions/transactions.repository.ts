import { Injectable } from "@nestjs/common";
import db from "../database"

@Injectable()
export class TransactionsRepository {
    // Define table names for all related tables
    private readonly tableName = 'transactions';
    private readonly itemsTableName = 'items';
    private readonly transactionItemsTableName = 'transaction_items';

    async findTransactions(): Promise<any[]> {
        // Get transactions with related data
        const transactions = await db(this.tableName)
            .select(
                'transactions.*',
                'people.firstName',
                'people.lastName',
                'people.email'
            )
            .leftJoin('people', 'transactions.peopleId', 'people.id');

        // For each transaction, get its items
        const transactionsWithItems = await Promise.all(
            transactions.map(async (transaction) => {
                const items = await db(this.transactionItemsTableName)
                    .select(
                        'transaction_items.*',
                        'items.name as itemName'
                    )
                    .where({ transaction_id: transaction.id })
                    .leftJoin('items', 'transaction_items.item_id', 'items.id');

                return { ...transaction, items };
            })
        );

        return transactionsWithItems;
    }

    async bulkCreateTransactions(transactions: any[]): Promise<any[]> {
        // Implement your database operation to create multiple transactions
        // Return the result as an array of created transaction objects
        return db.transaction(async (trx) => {
            const insertedTransactions: any = [];

            for (const transactionData of transactions) {
                let person;
                // Find the person with the matching phone number
                try {
                    person = await trx('people').where({ telephone: transactionData.phone }).first();
                    if (!person) {
                        console.log(`No matching person found for phone number ${transactionData.phone} in transaction ${transactionData.id}`);
                        continue;
                    }
                } catch (error) {
                    console.error(`Error finding person with phone number ${transactionData.phone} in transaction ${transactionData.id}`);
                    continue;
                }

                // Calculate total amount from items
                const totalAmount = Array.isArray(transactionData.items.item)
                    ? transactionData.items.item.reduce((sum, item) => sum + parseFloat(item.price), 0)
                    : parseFloat(transactionData.items.item?.price || 0);

                // Prepare transaction data for insertion
                const transactionToInsert = {
                    external_id: transactionData["@_id"] || transactionData.id,
                    peopleId: person.id,
                    phone: transactionData.phone,
                    store: transactionData.store,
                    transaction_date: transactionData.date,
                    total_amount: totalAmount,
                };

                let transactionId;
                try {
                    // Check if transaction already exists
                    const existingTransaction = await trx(this.tableName).where({
                        external_id: transactionToInsert.external_id,
                    }).first();

                    if (existingTransaction) {
                        console.log(`Transaction with external_id ${transactionToInsert.external_id} already exists. Skipping.`);
                        continue;
                    } else {
                        // Insert new transaction
                        const [newTransaction] = await trx(this.tableName).insert(transactionToInsert).returning('*');
                        transactionId = newTransaction.id;
                    }
                } catch (error) {
                    console.error(`Error inserting transaction for ${transactionData.phone}: `, error);
                    continue;
                }

                // Handle Items
                if (transactionData.items.item) {
                    try {
                        // Ensure items is always treated as an array
                        const itemsArray = Array.isArray(transactionData.items.item)
                            ? transactionData.items.item
                            : [transactionData.items.item];

                        // Process each item
                        for (const itemData of itemsArray) {
                            // Extract item information - handle nested structure
                            // The XML structure has item name within another item property
                            const itemName = Array.isArray(itemData.item) ? itemData.item[0] : itemData.item;
                            const pricePerItem = parseFloat(itemData.price_per_item);
                            const quantity = parseInt(itemData.quantity);
                            const totalPrice = parseFloat(itemData.price);

                            // Find or create the item
                            let itemId;
                            const existingItem = await trx(this.itemsTableName)
                                .where({ name: itemName })
                                .first();

                            if (existingItem) {
                                itemId = existingItem.id;
                            } else {
                                // Insert new item
                                const [newItem] = await trx(this.itemsTableName)
                                    .insert({
                                        name: itemName,
                                        default_price: pricePerItem
                                    })
                                    .returning('*');

                                itemId = newItem.id;
                            }

                            // Create transaction item entry
                            await trx(this.transactionItemsTableName).insert({
                                transaction_id: transactionId,
                                item_id: itemId,
                                quantity: quantity,
                                price_per_item: pricePerItem,
                                total_price: totalPrice
                            });
                        }
                    } catch (error) {
                        console.error(`Error processing items for transaction ${transactionId}:`, error);
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