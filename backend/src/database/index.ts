import "dotenv/config";
const knex = require("knex");

const dbConfig = {
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: process.env.DATABASE_NAME || "postgres",
    port: 5432,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
};

const db = knex({
    client: "pg",
    connection: dbConfig,
    migrations: {
        directory: "../../migrations",
    },
    pool: {
        min: 2,
        max: 10,
    },
});

export default db;