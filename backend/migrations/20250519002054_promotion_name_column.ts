import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('promotions', (table) => {
        table.string('promotion').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('promotions', (table) => {
        table.dropColumn('promotion');
    });
}