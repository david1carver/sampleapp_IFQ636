# Mesa — Restaurant Review Platform (IFQ636 Assignment 2)

A full-stack restaurant review platform built for **IFQ636 Software Lifecycle Management** at QUT. Diners discover restaurants and post trustworthy star-rated reviews, owners respond, and administrators curate the catalogue and moderate content.

**Assignment 2** extends the Assignment 1 project by re-architecting the backend around object-oriented design and **eight design patterns**, adding a new in-app **Notifications** subsystem, expanding **unit testing**, and automating build/test/deployment through a **CI/CD pipeline** to AWS EC2.

- **Live deployment:** http://3.27.208.40/  (EC2, nginx + pm2; public IPv4 — may change if the instance is stopped/started)
- **CI/CD:** GitHub Actions **self-hosted runner** on the EC2 instance — every push to `main` runs the unit tests, builds the frontend, writes the production `.env`, and restarts the app under pm2.

## Tech stack
- **Backend:** Node.js + Express, Mongoose 6, MongoDB Atlas (Sydney, ap-southeast-2), JWT auth + bcrypt, role-based authorisation (diner / admin)
- **Frontend:** React 18 + React Router 6, Tailwind CSS 3 (the bespoke "Mesa" design system), axios
- **Testing:** Mocha + Chai + Sinon (unit tests, Mongoose statics stubbed — no DB needed)
- **Infra:** AWS EC2 (Ubuntu, t3.medium), nginx reverse proxy, pm2 process manager, GitHub Actions self-hosted runner

## Object-oriented design — eight patterns
| Pattern | Where |
|---|---|
| Singleton | `core/Logger.js`, `core/Database.js` |
| Repository | `repositories/BaseRepository.js` (+ Restaurant/Review/User/Notification) |
| Decorator (via Proxy) | `repositories/decorators/LoggingRepositoryDecorator.js` |
| Facade | `services/ReviewService.js`, `services/RestaurantService.js` |
| Builder | `builders/RestaurantQueryBuilder.js` |
| Strategy | `strategies/SortStrategy.js` |
| Factory Method | `factories/NotificationFactory.js` |
| Observer | `events/ReviewSubject.js` + `observers/` (Rating, Notification, Audit) |

OOP principles: encapsulation (`#private` fields), inheritance (Strategy/Observer subclasses), abstraction (abstract bases that throw on direct instantiation), and polymorphism (uniform `update()` / `toMongoSort()`).

## Local setup
### 1. Backend
```bash
cd backend
npm install
```
Create `backend/.env` (use your own Atlas URI):
```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mesa?retryWrites=true&w=majority
JWT_SECRET=<a-long-random-string>
PORT=5001
```
Seed the database (6 restaurants + demo users + notifications):
```bash
node seed.js
```
### 2. Frontend
```bash
cd frontend
npm install
```
(`frontend/src/axiosConfig.js` uses a same-origin/relative API base so it works locally and behind the nginx proxy in production.)

## Running locally
```bash
# Terminal 1 — backend (port 5001)
cd backend && npm run dev
# Terminal 2 — frontend (port 3000)
cd frontend && npm start
```

## Demo credentials
| Role | Email | Password |
|---|---|---|
| Diner | diner@mesa.test | diner1234 |
| Admin | admin@mesa.test | admin1234 |

## Running tests
```bash
cd backend
npm test
```
**Expected: 49 passing** — Mocha + Chai + Sinon unit tests covering the controllers, services, repositories, and design-pattern behaviour (no database required).

## API summary
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register, returns JWT |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/restaurants` | Public | List + filter + paginate |
| GET | `/api/restaurants/:slug` | Public | Get one by slug |
| POST | `/api/restaurants` | Admin | Create restaurant |
| PATCH | `/api/restaurants/:id` | Admin | Update restaurant |
| DELETE | `/api/restaurants/:id` | Admin | Delete + cascade reviews |
| POST | `/api/restaurants/:id/reviews` | Diner | Create review (one per diner) |
| GET | `/api/reviews/me` | Diner | List own reviews |
| PATCH/DELETE | `/api/reviews/:id` | Author/Admin | Update / delete review |
| POST | `/api/reviews/:id/response` | Admin | Owner response |
| GET | `/api/notifications` | Auth | List notifications |
| PUT | `/api/notifications/:id/read` | Auth | Mark read |
| GET | `/api/health` | Public | Health check |

A Postman/Thunder Client collection is exported at `docs/A2/RestaurantReview.postman_collection.json`, exercising success paths and error handling (200/201/400/401/403/409).

## CI/CD pipeline
`.github/workflows/ci.yml` (`name: Backend CI`) runs on a **self-hosted runner** installed on the EC2 instance, on every push to `main`: install deps → build the React frontend (yarn) → run the unit tests → write the production `.env` from a secret → restart backend + frontend under pm2. nginx serves the frontend on port 80 and proxies `/api` to the backend on port 5001.

## Author & GitHub workflow
Completed solo by **David (Anrio) Carver** (n11473215). An allocated teammate withdrew from the unit before submission, so all work here is the author's own. The project uses a feature-branch workflow — dedicated `feature/*` branches, pull requests, and resolved merge conflicts — demonstrating command of the GitHub collaboration tooling. See the Assignment 2 report (`docs/A2/`) for full evidence.
