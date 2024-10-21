# Node CRUD API

## Assignment: CRUD API

### Description

This project implements a simple CRUD (Create, Read, Update, Delete) API.

### Features

- **GET** `/api/users`: Retrieve all user records.
- **GET** `/api/users/{userId}`: Retrieve a specific user record by ID.
- **POST** `/api/users`: Create a new user record.
- **PUT** `/api/users/{userId}`: Update an existing user record by ID.
- **DELETE** `/api/users/{userId}`: Delete a user record by ID.

### How to Run

1. **Install Dependencies**

   Run the following command to install all necessary dependencies:

   npm install
2. **Run Application**

   Run the following command to run the app in dev mode:
   
   npm run start:dev

   Run the following command to run the app in prod mode:
   
   npm run start:prod

   The app will run on 3000 port. Port can be changed in .env file.
