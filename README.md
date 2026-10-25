# DevRadar

DevRadar is a developer discovery and networking platform. It helps users discover other developers, view profiles and skills, send connection requests, review incoming requests, and manage their connections.

## Features

- **Authentication** — sign up, log in, and log out.
- **Developer discovery** — browse a paginated feed of developer profiles.
- **Interest actions** — mark a profile as interested or ignored.
- **Connection requests** — view incoming requests and accept or reject them.
- **Connections** — view accepted connections.
- **Profile management** — view and edit profile information, including skills and an optional profile photo URL.
- **Password update** — change a password after verifying the current password.
- **Responsive frontend structure** — pages are built with HTML, CSS, and vanilla JavaScript; the visual style is dark and monochrome.

## Tech stack

**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js, Express  
**Database:** MongoDB with Mongoose  
**Authentication and security:** JSON Web Tokens (JWT), cookie-based authentication, bcrypt password hashing, and input validation with `validator`

## Project structure

```text
DevRadar/
├── public/                  # Frontend pages, styles, and scripts
│   ├── css/
│   │   └── style.css
│   ├── js/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── profile.html
│   ├── requests.html
│   └── connections.html
├── src/
│   ├── config/              # Database connection
│   ├── middlewares/         # Authentication middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── utils/               # Validation helpers
│   └── app.js               # Express app entry point
├── .env                     # Local environment variables (not committed)
├── .env.example             # Example variable names with placeholder values
├── .gitignore
├── package.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js and npm
- A MongoDB database (for example, a MongoDB Atlas cluster)

### 1. Clone the repository

Replace the placeholder URL with your GitHub repository URL.

```bash
git clone <your-repository-url>
cd DevRadar
```

### 2. Install dependencies

```bash
npm install
```

The project uses `dotenv` to load environment variables. If it is not already listed in your dependencies, install it:

```bash
npm install dotenv
```

For the development script, install Nodemon if needed:

```bash
npm install --save-dev nodemon
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

Use your own MongoDB connection string and a long, randomly generated JWT secret. Do not commit the real `.env` file.

Make sure the backend loads environment variables near the start of `src/app.js`:

```js
require("dotenv").config();
```

Make sure the database connection reads `process.env.MONGODB_URI`, and both JWT signing and verification use `process.env.JWT_SECRET`. The variable names in the code must match the names in `.env`.

### 4. Start the application

Run in development mode (requires Nodemon):

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

If Express is configured to serve the `public/` directory, open the application at:

```text
http://localhost:3000
```

## Main API routes

These are the main routes used by the application. Connection-request status values are included in the route parameters.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/signup` | Create an account |
| `POST` | `/login` | Log in |
| `POST` | `/logout` | Log out |
| `GET` | `/feed?page=1&limit=10` | Load a page of developer profiles |
| `PATCH` | `/profile/edit` | Update profile details |
| `PATCH` | `/profile/password` | Change password |
| `POST` | `/request/send/:status/:toUserId` | Send an interested or ignored action |
| `POST` | `/request/review/:status/:requestId` | Accept or reject an incoming request |
| `GET` | `/user/requests/recieved` | Get incoming requests (`recieved` is the route's current spelling) |
| `GET` | `/user/connections` | Get accepted connections |

Profile viewing is implemented by the `/profile` route. Ensure the HTTP method configured in the backend matches the method used by the frontend.

## Security notes

- Keep `.env` out of Git. Add `.env` to `.gitignore`.
- Never commit database credentials, JWT secrets, access tokens, or real passwords.
- Keep `.env.example` limited to variable names and placeholder values.
- If credentials have already been committed or shared, rotate them. Removing a secret from the latest commit does not remove it from Git history.

## Current status

DevRadar is a project in development. Features, validation, and UI details may change as the application evolves.
