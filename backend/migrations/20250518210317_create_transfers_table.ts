import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Create Transfers table
    await knex.schema.createTable('transfers', (table) => {
        table.increments('id').primary();
        table.integer('senderId')
            .unsigned()
            .references('id')
            .inTable('people')
            .onDelete('CASCADE');
        table.integer('recipientId')
            .unsigned()
            .references('id')
            .inTable('people')
            .onDelete('CASCADE');
        table.decimal('amount', 10, 2).notNullable(); // Supports up to 10 digits with 2 decimal places
        table.date('date').notNullable();
        table.timestamps(true, true); // createdAt and updatedAt
    });
}

export async function down(knex: Knex): Promise<void> {
    // Drop the transfers table
    await knex.schema.dropTableIfExists('transfers');
}