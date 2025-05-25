require("dotenv").config(); // Load environment variables
require("ts-node/register");

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: "pg", // Use 'pg' for PostgreSQL
        connection: {
            // Use 'postgres' (service name) when running in Docker, localhost when running locally
            host: process.env.DATABASE_HOST || "postgres",
            port: 5432,
            database: process.env.DATABASE_NAME || "postgres",
            user: process.env.DATABASE_USER || "postgres",
            password: process.env.DATABASE_PASSWORD || "postgres",
            ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
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
        debug: process.env.NODE_ENV === 'development', // Enable SQL logging in development
    },

    staging: {
        client: "pg",
        connection: {
            host: process.env.DATABASE_HOST,
            port: 5432,
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: { rejectUnauthorized: false }, // Force SSL in staging environment
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
            port: 5432,
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: { rejectUnauthorized: false }, // Force SSL in production environment
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