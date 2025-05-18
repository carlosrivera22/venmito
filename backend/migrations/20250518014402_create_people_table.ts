import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Create People table
    await knex.schema.createTable('people', (table) => {
        table.increments('id').primary();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.string('telephone');
        table.string('email').unique();
        table.string('city');
        table.string('country');
        table.date('dob');
        table.timestamps(true, true); // createdAt and updatedAt
    });

    // Create Devices table
    await knex.schema.createTable('devices', (table) => {
        table.increments('id').primary();
        table.string('deviceName').notNullable();
        table.string('deviceType'); // Optional: to specify type of device
        table.timestamps(true, true);
    });

    // Create PeopleDevices junction table
    await knex.schema.createTable('people_devices', (table) => {
        table.increments('id').primary();
        table.integer('peopleId')
            .unsigned()
            .references('id')
            .inTable('people')
            .onDelete('CASCADE');
        table.integer('deviceId')
            .unsigned()
            .references('id')
            .inTable('devices')
            .onDelete('CASCADE');
        table.unique(['peopleId', 'deviceId']); // Prevent duplicate associations
        table.date('assignedDate').defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    // Drop tables in reverse order of creation to maintain referential integrity
    await knex.schema.dropTableIfExists('people_devices');
    await knex.schema.dropTableIfExists('devices');
    await knex.schema.dropTableIfExists('people');
}