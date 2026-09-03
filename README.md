# ShopKart Authentication Service

Full-stack customer authentication service for ShopKart, including an Express
and MongoDB backend plus a responsive React customer portal.

## Features

### Backend

- Customer registration with full name, email, phone, and password.
- Password hashing with `bcrypt`.
- Login using a signed JWT stored in an HttpOnly cookie.
- Protected profile endpoint.
- Logout with cookie invalidation.
- Password-change API endpoint.
- Duplicate-email and invalid-credential validation.
- Automatic in-memory MongoDB fallback for local development when a MongoDB
  server is unavailable.
- Demo customer accounts seeded on startup when the database is empty.

### Frontend

- React and Vite development setup.
- Login and registration screens.
- One-click demo account selection.
- Authenticated ShopKart dashboard.
- Routed Overview, Orders, Wishlist, and Profile sections.
- Session restoration using the `/customers/me` endpoint.
- Responsive layout for desktop and mobile screens.

## Technology stack

- **Frontend:** React, React Router, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT and HttpOnly cookies
- **Security:** bcrypt password hashing

## Project structure

```text
.
├── backend/
│   ├── controllers/
│   │   └── customer.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── customer.model.js
│   ├── routes/
│   │   └── customer.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── docker-compose.yml
└── package.json
```

## Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB 6 or newer for persistent storage, or a working internet connection
  so `mongodb-memory-server` can download its local MongoDB binary.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/RajnishSharma7077/shopkart-authentication-service-.git
cd shopkart-authentication-service-
npm install
cd frontend
npm install
cd ..
```

Create an environment file:

```bash
cp .env.example .env
```

Update `.env` with a strong JWT secret and the MongoDB connection string:

```env
MONGO_URI=mongodb://localhost:27017/shopkart
JWT_SECRET=replace_this_with_a_strong_secret
PORT=5001
NODE_ENV=development
```

## Running locally

Start the backend from the project root:

```bash
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open the application at [http://localhost:5173](http://localhost:5173).
The Vite development server proxies `/customers` API calls to the backend at
`http://localhost:5001`.

For a production frontend build:

```bash
cd frontend
npm run build
npm run preview
```

## Demo accounts

When the database is empty, these accounts are created automatically:

| Name | Email | Password |
| --- | --- | --- |
| Aarav Sharma | `aarav@shopkart.com` | `demo123` |
| Meera Kapoor | `meera@shopkart.com` | `demo123` |
| Rohan Singh | `rohan@shopkart.com` | `demo123` |

The login screen also includes buttons that fill in these credentials
automatically.

## Frontend routes

| Route | Description | Authentication |
| --- | --- | --- |
| `/login` | Login and registration screen | Public |
| `/profile` | Customer overview dashboard | Protected |
| `/orders` | Recent order history | Protected |
| `/wishlist` | Saved items | Protected |

Unauthenticated users attempting to access a protected route are redirected to
`/login`. After successful login, the frontend navigates to `/profile`.

## API reference

All customer endpoints are prefixed with `/customers`.

### Register

```http
POST /customers/register
Content-Type: application/json
```

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "phone": "9876543210"
}
```

Successful response: `201 Created`.

### Login

```http
POST /customers/login
Content-Type: application/json
```

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Successful login sets the `token` HttpOnly cookie and returns the customer
profile without the password.

### Get current customer

```http
GET /customers/me
Cookie: token=<jwt>
```

Returns the authenticated customer profile.

### Logout

```http
POST /customers/logout
Cookie: token=<jwt>
```

Clears the authentication cookie.

### Change password

```http
PATCH /customers/change-password
Content-Type: application/json
Cookie: token=<jwt>
```

```json
{
  "oldPassword": "secret123",
  "newPassword": "newsecret123"
}
```

This endpoint is available in the backend API for future account settings UI.

## Database options

### Local MongoDB

Run MongoDB locally and set:

```env
MONGO_URI=mongodb://localhost:27017/shopkart
```

### Docker Compose

If Docker is installed, start the included MongoDB service:

```bash
docker compose up -d mongo
```

### In-memory fallback

If the configured MongoDB connection cannot be reached, the backend attempts to
start `mongodb-memory-server`. Data stored in this mode is temporary and is lost
when the backend process stops.

## Validation and troubleshooting

- If the frontend shows a blank page, confirm the Vite server is running on
  port `5173` and check the browser console.
- If API calls fail, confirm the backend is running on port `5001`.
- If registration returns a database error, check MongoDB availability or allow
  `mongodb-memory-server` to download its binary.
- Use a password with at least six characters.
- Do not commit `.env`; it is ignored by Git. Use `.env.example` as the
  configuration template.

## Security notes

- Never use the demo credentials in production.
- Use a long, random `JWT_SECRET`.
- Use HTTPS and `NODE_ENV=production` in production deployments.
- Keep the JWT in the HttpOnly cookie rather than local storage.
- Replace the demo dashboard data with real order and wishlist APIs before
  production use.

## License

This project is currently provided without a declared open-source license.
