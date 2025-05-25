# Venmito - Development Setup

This guide will help you get the application running on your local machine.

## Prerequisites

Make sure you have these installed on your machine:

- **Docker** (version 20.0 or higher)
- **Docker Compose** (usually comes with Docker)
- **Git**

### Check if you have Docker:
```bash
docker --version
docker-compose --version
```

If you don't have Docker, download it from: https://www.docker.com/products/docker-desktop

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/carlosrivera22/venmito.git

   cd venmito
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

   **NOTE: This may take a few minutes, so be patient.**

   WAIT UNTIL THIS STEP IS COMPLETED BEFORE CONTINUING.

3. **Run database migrations** (**in a new terminal**)
   ```bash
   # Wait for the containers to start, then run:
   docker-compose run --rm backend npx knex migrate:latest
   ```

4. **Access the application**
   - **Frontend (Admin Panel)**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Hasura GraphQL Console**: http://localhost:8080
   - **PostgreSQL**: localhost:5432

## Hasura GraphQL Console (For developers)

1. **Open the Hasura GraphQL 
   console on the brower at:**
   ```bash
   localhost:8080
   ```

2. Go to data tab. Then create on manage and click `Connect Database`.

3. Choose `PostgreSQL` and click `Connect Existing Database`.

4. Choose `Database URL` and paste the following:
   ```bash
   postgres://postgres:postgres@postgres:5432/postgres
   ````

5. Choose whatever database name you want, and click `Connect Database`.

6. In the `Database` make sure to track all tables and relationships. 

7. Go to the `API` tab, and play around with the explorer. 