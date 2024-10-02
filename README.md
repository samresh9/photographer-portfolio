
# About Project

**Photographer's Portfolio Application**   
The Photographer's Portfolio application is a simple yet powerful platform that allows users to create and manage photo albums. Users can sign up, log in, and create albums containing images. The application employs a token-based authentication system to ensure that only authenticated users can create albums. Additionally, users can view albums created by other photographers through dedicated album listing and detail pages.
## Description
### Features

### User Authentication
- **Signup & Login**: Users can sign up and log in to the application.
- **JWT Tokens**: The application returns JSON Web Tokens (JWT) upon successful authentication.
- **Protected Routes**: Middleware is implemented to protect routes that require user authentication
- **Password Reset**: Users can reset their passwords via email.

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer (for password reset functionality)
## Getting Started
### Prerequisites
Make sure you have the following installed:
- Node.js (v20 or later)
- npm 
- yarn
- PostgreSQL setup

## Installation
Follow these steps to install and set up the Application:

1. **Clone the Repository**  
   First, clone the repository to your local machine or server using the following command:

```bash
$ git clone git@github.com:samresh9/photographer-portfolio.git
```
*NOTE: After cloning the repository, note that the default branch checked out will be `main`.* 
 
2. **Navigate to the Project Directory**
Change your directory to the root of the project where the codebase is located:
  ```bash
$ cd <project-directory>
```
Replace <project-directory> with the actual path of the project folder.

3. **Install Dependencies**
Install all the required dependencies using Yarn:

```bash
$ yarn install
```
This will install all necessary Node.js packages specified in the package.json file.

4. **Environment Configuration**
Rename the .env.example file to .env in the root project directory. Update the .env file with your specific configuration values for the environment variables.

```bash
$ mv .env.example .env
```
Fill in all the required environment variables as specified in the 
[Configuration](#configuration) section.

5. **Node Version**
Ensure that you are using Node.js version 20 or higher. If necessary, update your Node.js installation to meet this requirement. You can check your Node.js version with:
```bash
$ node -v
```
---
## Running the App

## Running the App
Follow these steps to run the application:

1. **Run Database Migrations**
After starting the application, run the following command to apply any pending database migrations:
```bash
$ yarn migration
```
This ensures your database schema is up-to-date with the current application structure.

2. **Seed Initial Data**
To populate the database with initial data (super admin accounts and other essential records such as role-permission data and more), run the seeder command:
```bash
$ yarn seed
```
This will execute the seeder scripts to insert predefined data into your database.

3. **Start the Application** 
Use one of the following commands based on your environment:

```bash
# development
$ yarn run start

# development with watch mode
$ yarn run dev

```
- start: Runs the application in development mode.
- dev: Runs the application in development mode with file watching for automatic restarts.




---
## Documentation

The API documentation is provided using **Swagger**. It offers an interactive interface to explore and test the API endpoints, making it easier to understand the available functionalities.

To access the API documentation with Swagger, navigate to the following route:
  ```
 <baseUrl>/api-docs
```
Replace `<baseUrl>` *(http://localhost:3000)*  with the actual base URL of your application.

## API Routes

The following routes are defined in this module:

### User Authentication Routes

| Method | Route                                 | Description                                   | Expected Values  (body)                            |
|--------|---------------------------------------|-----------------------------------------------|----------------------------------------------|
| POST   | `/api/v1/users/signup`                | Register a new user.                          | `{"email": "user@example.com", "firstname": "John", "lastname": "Doe", "password": "Password123!"}` |
| POST   | `/api/v1/users/login`                 | Log in an existing user.                      | `{"email": "user@example.com", "password": "Password123!"}` |
| POST   | `/api/v1/users/forgot-password`       | Send a password reset link to the user's email. | `{"email": "user@example.com"}`             |
| POST   | `/api/v1/users/reset-password/:token` | Reset the user's password using a token.     | `{"newPassword": "NewPassword123!"}`       |




### Album Routes

| Method | Route                          | Description                                   | Expected Values                                                                                       |
|--------|--------------------------------|-----------------------------------------------|-------------------------------------------------------------------------------------------------------|
| POST   | `/api/v1/albums/`             | Create a new album.                          | `{"title": "My Album", "description": "Album description"}` (with images uploaded as form data)      |
| GET    | `/api/v1/albums/`             | Retrieve all albums (with pagination).      | Query parameters: `?page=1&limit=10&includeOthers=true&search=mySearchTerm`                         |
| GET    | `/api/v1/albums/:albumId`     | Get details of a specific album.            | URL parameter: `albumId` (e.g., `123`)                                                               |
| PUT    | `/api/v1/albums/:albumId`     | Update a specific album.                     | URL parameter: `albumId`, Body: `{"title": "Updated Title", "description": "New description", "imagesToRemove": "1,2"}` (with new images uploaded as form data) |
| DELETE | `/api/v1/albums/:albumId`     | Delete a specific album.                     | URL parameter: `albumId` (e.g., `123`)                                                               |


## Database Migration and Seeding Configuration


## Database Migration Configuration and Seeding

### Migration
1. **Run pending Migration**

```bash
$ yarn migrate

```
Replace "migration_name" with a descriptive name for the migration, which will generate a new migration file.

2. **Generate and Run Migrations**   
Apply the migrations to update your database schema:
```bash
$ yarn migrate dev <migration_name>
```
This command will execute all pending migrations, ensuring your database schema matches the current application code.


### Seeding

1. **Update Seeder Files**    
Make any necessary changes to your seeder scripts located in the seeder directory.

2. **Run the Seeder**     
Execute the following command to seed your database:
```bash
$ yarn run seed
```
This will insert the data defined in your seeder files into the database, ensuring that your application has the necessary data to function correctly.

*Note: The app has seeder for admin data.*

---
## Configuration
To run the application, you need to set up several services and provide configuration through environment variables. Below are the required environment variables and suggestions for installing the necessary services.

### Required Environment Variables

#### General Configuration
- `PORT`: Port on which the application will run (e.g., `3000`).
- `NODE_ENV`: Environment mode (`development`, `production`, etc.).
- `ADMIN_PASSWORD`: Default password for the super admin account.

#### Database Configuration
- `DATABASE_URL`: Connection string for PostgreSQL. It should include the protocol, username, password, host, port, and database name (e.g., `postgres://user:password@localhost:5432/mydatabase`).

#### JWT Configuration
- `ACCESS_TOKEN_SECRET=`: Secret key for signing JWT tokens.
- `ACCESS_TOKEN_EXPIRY`: Expiration time for JWT tokens (e.g., `1h`).
- `FILE_SERVE_SECRET_KEY`: Secret key for signing files.


#### Mail Configuration
- `SMTP_PORT`: Port for the mail server (e.g., `587`).
- `SMTP_HOST`: Mail server host (e.g., `smtp.mailtrap.io`).
- `SMTP_USERNAME`: Username for the mail server.
- `SMTP_PASSWORD`: Password for the mail server.
- `FROM_EMAIL_ADDRESS`: Default sender email address.
- `BASE_URL`: Base Url for email redirect.


## Git Hooks and Husky


We utilize Husky, a Git hook tool, to enforce certain actions and maintain a consistent workflow within our project. Git hooks are scripts that run before or after specific Git events.



- **Pre-commit Hook**:  We have set up a pre-commit hook that runs code formatting scripts and linters to ensure code consistency before committing changes. This includes using lint-staged to check for linting errors, ensuring that only properly formatted and error-free code is committed.

Please ensure that your code meets the required standards and passes the necessary checks before committing or pushing changes.

---
