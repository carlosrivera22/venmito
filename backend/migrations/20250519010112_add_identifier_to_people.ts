import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Add identifier column to people table
    await knex.schema.alterTable('people', (table) => {
        table.string('identifier').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    // Remove identifier column from people table
    await knex.schema.alterTable('people', (table) => {
        table.dropColumn('identifier');
    });
}