# VENMITO

### This application has a monorepo structure with a frontend (venmito-admin) and a backend project.

## Frontend Instructions
In order to run the frontend project called *venmito-admin* you should open the terminal and run:
 ```
 cd venmito-admin
 ```` 

For consistency we're going to be using `yarn` package manager. (Make sure you have `yarn` installed)

Inside *venmito-admin* run:
 ```
 yarn
 ```
to install all frontend dependencies. 

Finally run:
 ```
 yarn dev
 ```
 to run the project locally on port `3000` 

Open http://localhost:3000 with your browser to see the result.

Note: *The application won't work properly unless we setup the backend as well*

## Backend Instructions
In order to run the backend application you should open the terminal and run `cd backend`

Inside the `backend` folder run: 
```
yarn install
```
to install dependencies. 

### Database
This project uses a relational PostgreSQL database. 

We run our PostgreSQL service inside a Docker container. To run the database service execute the following command: 

```
docker compose up -d
```

In order to properly run the project we need to setup our schema. For that run:

```
npx knex migrate:latest
```

Finally to run our backend service type the following command: 

```
yarn start
```

## Hasura (For developers)



