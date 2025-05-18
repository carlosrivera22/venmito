import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Create Promotions table
    await knex.schema.createTable('promotions', (table) => {
        table.increments('id').primary();
        table.integer('peopleId')
            .unsigned()
            .references('id')
            .inTable('people')
            .onDelete('CASCADE');
        table.boolean('responded').defaultTo(false);
        table.date('promotionDate').notNullable();
        table.timestamps(true, true); // createdAt and updatedAt
    });
}

export async function down(knex: Knex): Promise<void> {
    // Drop the promotions table
    await knex.schema.dropTableIfExists('promotions');
}