import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Create Items table first (products/services that can be purchased)
    await knex.schema.createTable('items', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();  // Unique item names
        table.decimal('default_price', 10, 2).notNullable();  // Default price (can be overridden in transaction)
        table.timestamps(true, true);
    });

    // Create Transactions table
    await knex.schema.createTable('transactions', (table) => {
        table.increments('id').primary();
        table.string('external_id').nullable();  // For external reference IDs
        table.integer('peopleId')
            .unsigned()
            .references('id')
            .inTable('people')
            .onDelete('SET NULL')
            .nullable();  // Allow null for transactions without identified people
        table.string('phone').nullable();  // Keep phone number for future people matching
        table.string('store').notNullable();
        table.date('transaction_date').notNullable();
        table.decimal('total_amount', 10, 2).notNullable();  // Total transaction amount
        table.timestamps(true, true);
    });

    // Create TransactionItems (junction table)
    await knex.schema.createTable('transaction_items', (table) => {
        table.increments('id').primary();
        table.integer('transaction_id')
            .unsigned()
            .references('id')
            .inTable('transactions')
            .onDelete('CASCADE')
            .notNullable();
        table.integer('item_id')
            .unsigned()
            .references('id')
            .inTable('items')
            .onDelete('RESTRICT')  // Prevent deletion of items that have transaction history
            .notNullable();
        table.integer('quantity').notNullable().defaultTo(1);
        table.decimal('price_per_item', 10, 2).notNullable();  // Actual price at time of purchase
        table.decimal('total_price', 10, 2).notNullable();  // quantity * price_per_item
        table.timestamps(true, true);

        // Add a unique constraint to prevent duplicate items in a transaction
        // Comment this out if you want to allow the same item multiple times in a transaction
        // table.unique(['transaction_id', 'item_id']);
    });

    // Create indexes for better query performance
    await knex.schema.alterTable('transactions', (table) => {
        table.index('phone');
        table.index('transaction_date');
    });
}

export async function down(knex: Knex): Promise<void> {
    // Drop tables in reverse order of creation
    await knex.schema.dropTableIfExists('transaction_items');
    await knex.schema.dropTableIfExists('transactions');
    await knex.schema.dropTableIfExists('items');
}