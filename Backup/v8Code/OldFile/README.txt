# My App Backend

## Setup

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory and add your MySQL connection details and JWT secret.
4. Set up your MySQL database and run the provided SQL commands to create tables.
5. Run `node server.js` to start the server.

## Endpoints

- **POST /api/auth/login**
  - Request body: `{ "username": "your_username", "password": "your_password" }`
  - Returns a JWT token on success.

- **POST /api/auth/register**
  - Request body: `{ "username": "your_username", "password": "your_password" }`
  - Registers a new user.

- **POST /api/tasks**
  - Requires a valid JWT in the `Authorization` header.
  - Request body: `{ "title": "task title", "description": "task description", "status": "pending" }`
  - Creates a new task.

- **GET /api/tasks**
  - Requires a valid JWT in the `Authorization` header.
  - Returns all tasks.

- **PUT /api/tasks/:id**
  - Requires a valid JWT in the `Authorization` header.
  - Request body: `{ "title": "updated title", "description": "updated description", "status": "completed" }`
  - Updates a task.

- **DELETE /api/tasks/:id**
  - Requires a valid JWT in the `Authorization` header.
  - Deletes a task by ID.
