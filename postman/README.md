# Mesa — Postman API Test Collection

Evidence for **Assignment 2, Step 6 (API testing using Postman)**. The collection
exercises every Mesa backend endpoint with `pm.test` assertions, JWT auto-capture,
and explicit error-path cases (401 / 403 / 404 / 409 / 400).

## Files

| File | Purpose |
|---|---|
| `Mesa.postman_collection.json` | The collection — 24 requests across Auth, Restaurants, Reviews, Cleanup |
| `Mesa.local.postman_environment.json` | Local environment (`baseUrl = http://localhost:5001`) |

## What it covers

**Auth** — register diner (saves `diner_token`), login admin (saves `admin_token`),
login with wrong password → 401, get profile, get profile with no token → 401,
update profile.

**Restaurants** — create (admin, saves `restaurantId`/`restaurantSlug`),
create without token → 401, create as diner → 403, list (paginated shape +
response-time assertion), list `?sort=newest` (Strategy pattern), get by slug,
get unknown slug → 404, update (admin).

**Reviews** — create (diner), duplicate review → 409, missing fields → 400,
list for restaurant, my reviews, list all (admin moderation), update (author),
owner response (admin), delete.

**Cleanup** — delete restaurant (admin), which cascades its reviews.

The requests are ordered so the whole collection runs top-to-bottom: tokens and
created IDs flow between requests via collection variables, so it works both in
the Postman Collection Runner and in Newman (CI).

## Running in the Postman app

1. **Import** both JSON files (Import → Files).
2. Select the **Mesa — Local** environment (top-right dropdown).
3. Start the backend locally and seed the admin user:
   ```bash
   cd backend
   npm install
   node seed.js          # creates admin@mesa.test / admin1234
   npm run dev           # starts on http://localhost:5001
   ```
4. Open the collection → **Run** (Collection Runner) → **Run Mesa**.
   Every request's test results show pass/fail. Use this view for the
   assignment screenshots.

## Running headless with Newman (CI-friendly)

```bash
npm install -g newman
newman run postman/Mesa.postman_collection.json \
  -e postman/Mesa.local.postman_environment.json \
  --reporters cli,html --reporter-html-export postman/newman-report.html
```

`newman` returns a non-zero exit code if any assertion fails, so it can gate a
CI job (see Assignment Step 7).

## Endpoint reference

| Method | Path | Auth | Tested cases |
|---|---|---|---|
| POST | `/api/auth/register` | Public | 201 |
| POST | `/api/auth/login` | Public | 200, 401 |
| GET | `/api/auth/profile` | Bearer | 200, 401 |
| PUT | `/api/auth/profile` | Bearer | 200 |
| GET | `/api/restaurants` | Public | 200 (+ sort) |
| GET | `/api/restaurants/:slug` | Public | 200, 404 |
| POST | `/api/restaurants` | Admin | 201, 401, 403 |
| PATCH | `/api/restaurants/:id` | Admin | 200 |
| DELETE | `/api/restaurants/:id` | Admin | 200 |
| GET | `/api/restaurants/:id/reviews` | Public | 200 |
| POST | `/api/restaurants/:id/reviews` | Diner | 201, 409, 400 |
| GET | `/api/reviews/me` | Diner | 200 |
| GET | `/api/reviews` | Admin | 200 |
| PATCH | `/api/reviews/:id` | Author/Admin | 200 |
| POST | `/api/reviews/:id/response` | Admin | 200 |
| DELETE | `/api/reviews/:id` | Author/Admin | 200 |
