# Mesa — Restaurant Review Platform

A full-stack restaurant review platform built for **IFQ636 Assignment 1** at QUT. Mesa lets diners discover restaurants, post and read peer reviews, and engage with restaurant owners. Administrators curate the catalogue and moderate user content.

Built by extending the [nahaQUT starter project](https://github.com/nahaQUT/sampleapp_IFQ636) (Node.js + Express + MongoDB + React + JWT authentication).

**Live deployment:** https://sampleapp-ifq636.onrender.com — API base https://sampleapp-ifq636.onrender.com/api/restaurants. Backend deployed on Render against the MongoDB Atlas cluster.

---

## What's inside

- **Express + Mongoose 6** backend against a MongoDB Atlas M0 cluster in AWS Sydney (`ap-southeast-2`)
- **React 18 + Tailwind CSS 3** frontend with the bespoke "Mesa" design system (7 colour tokens, 4 type tokens, 5 shared components)
- **JWT authentication** with role-based authorisation (`diner` / `admin`)
- **Compound unique index** on `(restaurantId, userId)` enforcing one review per diner per restaurant; two-layer defence (controller pre-check + database constraint)
- **Mocha + chai-http** in-process (no HTTP socket) for fast integration tests
- **GitHub Actions CI/CD** pipeline deploying to AWS EC2 on push to `main` (configured under `.github/workflows/deploy.yml`)

## Live screens

The platform ships eight working screens covering the full diner and admin journeys:

| # | Screen | Route | Access |
|---|--------|-------|--------|
| 1 | Browse | `/` | Public |
| 2 | Restaurant Detail | `/restaurants/:slug` | Public |
| 3 | Review Form (create + edit) | `/restaurants/:slug/review` | Authenticated diner |
| 4 | My Reviews | `/my-reviews` | Authenticated diner |
| 5 | Login | `/login` | Public |
| 6 | Register | `/register` | Public |
| 7 | Admin Restaurant Management | `/admin/restaurants` | Admin |
| 8 | Admin Review Moderation | `/admin/reviews` | Admin |

---

## Prerequisites

- **Node.js 18 or 20** (matches the EC2 production target and the GitHub Actions runner)
- **MongoDB Atlas** account with a cluster URI, OR a local MongoDB 6 instance
- A terminal capable of running `npm` commands

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/david1carver/sampleapp_IFQ636.git
cd sampleapp_IFQ636
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` with these variables (use your own Atlas URI):

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mesa?retryWrites=true&w=majority
JWT_SECRET=<a-long-random-string>
PORT=5001
```

### 3. Seed the database

This populates the `restaurants` collection with six Australian restaurants and creates two test users (one admin, one diner):

```bash
node seed.js
```

### 4. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5001
```

## Running locally

Both halves of the stack need their own terminal:

```bash
# Terminal 1 — backend (port 5001)
cd backend
npm run dev

# Terminal 2 — frontend (port 3000)
cd frontend
npm start
```

The React dev server opens [http://localhost:3000](http://localhost:3000) automatically.

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Diner | `diner@mesa.test` | `diner1234` |
| Admin | `admin@mesa.test` | `admin1234` |

New diners can register fresh accounts through the in-app registration form.

## Running tests

The mocha + chai-http test suite covers the highest-value backend paths:

```bash
cd backend
npm test
```

Expected: 7 passing - sinon unit tests covering controller behaviour (covers `GET /api/restaurants` shape and filtering, `POST /api/restaurants/:id/reviews` with 201/409/404 paths).

---

## Project structure
sampleapp_IFQ636/
├── backend/
│   ├── config/db.js                  # Mongoose connection
│   ├── controllers/                  # Auth, Restaurant, Review controllers
│   ├── middleware/                   # protect (JWT), adminGuard (role check)
│   ├── models/                       # User, Restaurant, Review schemas
│   ├── routes/                       # /api/auth, /api/restaurants, /api/reviews
│   ├── test/                         # mocha integration tests
│   ├── .mocharc.json                 # mocha config
│   ├── seed.js                       # one-shot DB seed script
│   └── server.js                     # Express entrypoint
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── mesa/                 # Mesa design-system primitives
│       │   └── ProtectedRoute.jsx    # auth + role gating
│       ├── context/AuthContext.jsx   # re-export shim
│       ├── pages/                    # Browse, Detail, ReviewForm, MyReviews, etc
│       ├── axiosConfig.js            # axios + bearer token interceptor
│       └── index.js                  # AuthProvider + App entrypoint
└── .github/workflows/deploy.yml      # CI/CD pipeline

## API summary

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account, returns JWT |
| POST | `/api/auth/login` | Public | Authenticate, returns JWT |
| GET | `/api/restaurants` | Public | List + filter + paginate |
| GET | `/api/restaurants/:slug` | Public | Get one by slug |
| POST | `/api/restaurants` | Admin | Create restaurant |
| PATCH | `/api/restaurants/:id` | Admin | Update restaurant |
| DELETE | `/api/restaurants/:id` | Admin | Delete restaurant + cascade reviews |
| GET | `/api/restaurants/:id/reviews` | Public | List reviews for one restaurant |
| POST | `/api/restaurants/:id/reviews` | Diner | Create review |
| GET | `/api/reviews` | Admin | List ALL reviews (moderation) |
| GET | `/api/reviews/me` | Diner | List own reviews |
| PATCH | `/api/reviews/:id` | Author or admin | Update review |
| DELETE | `/api/reviews/:id` | Author or admin | Delete review |
| POST | `/api/reviews/:id/response` | Admin | Post owner response |

## Technology choices

- **MongoDB Atlas (Sydney)** for managed Mongo with low local latency
- **Mongoose 6** for schema validation, with restaurant averageRating and reviewCount recomputed by a controller-side $group aggregation called after every review create, update, or delete
- **bcrypt** via Mongoose pre-save hook on the User schema
- **React Router v6** with declarative `<ProtectedRoute>` wrapper for auth + role gating
- **Tailwind CSS 3** with HSL CSS custom properties so the Mesa palette is theme-able from a single source
- **Mocha + sinon** for fast in-process unit tests of controller behaviour

## Branching strategy

Every feature lives on its own `feature/*` branch and lands on `main` via a pull request with a structured What / Why / Test plan / Refs description. Merges are explicit merge commits, not fast-forwards, so the branching strategy stays legible in the commit graph. Feature branches are preserved on the remote post-merge for marker inspection.

Branch naming conventions:
- `feature/backend-*` - backend work (CRUD, models, seed)
- `feature/frontend-*` - frontend pages and components
- `feature/admin-*` - admin-side functionality
- `feature/backend-mocha-tests` - automated tests

---

## Related artefacts

- **SysML requirement diagram:** linked on the assignment cover page (29 requirements traced through the design)
- **Figma:** linked on the assignment cover page (9 low-fi wireframes + 5 hi-fi mockups + interactive prototype)
- **JIRA:** linked on the assignment cover page (4 epics, 13 user stories, 45 subtasks across 3 sprints)
- **GitHub Actions:** runs `npm test` then deploys to EC2 on every push to `main`

## Author

**Anrio Carver** - QUT student ID `n11473215` — IFQ636 Software Lifecycle Management, Semester 1 2026.
