# ShopKart Authentication Service

Customer authentication backend and React frontend for ShopKart.

Quick start

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install backend dependencies: `npm install`.
3. Start the backend: `npm run dev`.
4. In another terminal, install frontend dependencies and start it:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open `http://localhost:5173`.

If MongoDB is not available, the backend automatically uses an in-memory MongoDB
for local development. Demo accounts are seeded on startup:

- `aarav@shopkart.com` / `demo123`
- `meera@shopkart.com` / `demo123`
- `rohan@shopkart.com` / `demo123`

API endpoints

- POST /customers/register
- POST /customers/login
- GET /customers/me (protected)
- POST /customers/logout (protected)
- PATCH /customers/change-password (protected, bonus)

Notes

- JWT is stored in an HttpOnly cookie named `token`.
- Passwords are hashed with bcrypt and never returned in responses.
- The frontend proxies `/customers` requests to the backend on port `5001`.
