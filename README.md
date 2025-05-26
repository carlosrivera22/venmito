# Venmito - Development Setup

This guide will help you get the application running on your local machine.

## Prerequisites

Make sure you have these installed on your machine:

- **Docker** (version 20.0 or higher)
- **Docker Compose** (usually comes with Docker)
- **Git**



### Check if you have Docker:

After installing Docker Desktop, open the Docker Desktop application and check the version by running the following command in your terminal:

```bash
docker --version
docker-compose --version
```

If you don't have Docker, download it from: https://www.docker.com/products/docker-desktop

## Quick Start

1. **Clone the repository or open zip file**
   ```bash
   git clone https://github.com/carlosrivera22/venmito.git

   cd venmito
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

   **NOTE: THIS MAY TAKE A FEW MINUTES, SO BE PATIENT.**

   WAIT UNTIL THIS STEP IS COMPLETED BEFORE CONTINUING.

3. **Run database migrations** (**in a new terminal**)
   ```bash
   # Wait for the containers to start, then run:
   docker-compose run --rm backend npx knex migrate:latest
   ```

4. **Access the application**
   - **Frontend (Admin Panel)**: http://localhost:3000
   - **Backend API**: http://localhost:5001
   - **Hasura GraphQL Console**: http://localhost:8080
   - **PostgreSQL**: localhost:5432

## Application Walkthrough

People are the main entity of the application. They have promotions and make transfers and transactions. 

1. Therefore, once on http://localhost:3000, start by adding people.

2. Only after adding people, you can start adding other data like promotions, transfers, and transactions.

Check out the video below for a walkthrough.
https://youtu.be/SiJ4MNs1e5A

## Hasura GraphQL Console (For developers)

1. **Open the Hasura GraphQL 
   console on the brower at:**
   ```bash
   localhost:8080
   ```

2. Go to data tab. Then create on manage and click `Connect Database`.

3. Choose `PostgreSQL` and click `Connect Existing Database`.

<img width="1431" alt="Screenshot 2025-05-25 at 7 05 30 PM" src="https://github.com/user-attachments/assets/d3182c6b-f06a-4fd0-a763-577e58144b9c" />


4. Choose `Database URL` and paste the following:
   ```bash
   postgres://postgres:postgres@postgres:5432/postgres
   ````
<img width="1136" alt="Screenshot 2025-05-25 at 7 06 24 PM" src="https://github.com/user-attachments/assets/d313d78b-fb24-4981-bc36-07529252e0ff" />



5. Choose whatever database name you want, and click `Connect Database`.

6. In the `Database` make sure to track all tables and relationships. 

7. Go to the `API` tab, and play around with the explorer. 

<img width="1425" alt="Screenshot 2025-05-25 at 7 04 11 PM" src="https://github.com/user-attachments/assets/b5e97bfa-1f88-4361-bb03-6b7ade737572" />
