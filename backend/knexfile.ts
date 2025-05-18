require("dotenv").config(); // Load environment variables
require("ts-node/register");

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: "pg", // Use 'pg' for PostgreSQL
        connection: {
            host: process.env.DATABASE_HOST || "127.0.0.1",
            port: process.env.DATABASE_PORT || 5432,
            database: process.env.DATABASE_NAME || "postgres",
            user: process.env.DATABASE_USER || "postgres",
            password: process.env.DATABASE_PASSWORD || "postgres",
            ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false, // Use SSL if DATABASE_SSL is set
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: "./src/db/seeds",
        },
    },

    staging: {
        client: "pg",
        connection: {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT || 5432,
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: { rejectUnauthorized: false }, // Force SSL in staging environment
            sslmode: "require",
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: "./src/db/seeds",
        },
    },

    production: {
        client: "pg",
        connection: {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT || 5432,
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: { rejectUnauthorized: false }, // Force SSL in production environment
            sslmode: "require",
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: "./src/db/seeds",
        },
    },
};