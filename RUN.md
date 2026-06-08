# RUN — Restaurant Review Platform (IFQ636 A2)

Quick start for running the program locally. Full details: `docs/A2/HOW_TO_RUN.md`.
HD evidence checklist: `docs/A2/HD_CHECKLIST.md`.

## Prerequisites
- **Node.js 18+** (20 recommended) and **npm**
- A **MongoDB** connection string — MongoDB Atlas (free M0) or local `mongodb://127.0.0.1:27017/mesa`
- Two terminals (one for backend, one for frontend)

## 1) Backend — install, test, seed, run
```bash
cd backend
cp .env.example .env
#   then edit .env:
#   MONGO_URI=<your MongoDB connection string>
#   JWT_SECRET=<any random string>
#   PORT=5001
npm install

npm test            # -> 49 passing  (no database needed; this is the §5.1 screenshot)
npm run seed        # loads 6 restaurants, admin + diner users, 3 demo notifications
npm run dev         # starts the API on http://localhost:5001
```
Health check: open http://localhost:5001/api/health → `{"status":"OK"}`

## 2) Frontend — install and run (second terminal)
```bash
cd frontend
cp .env.example .env          # REACT_APP_API_URL=http://localhost:5001
npm install
npm start                     # opens http://localhost:3000
```

## 3) Log in and try it
| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@mesa.test   | admin1234  |
| Diner | diner@mesa.test   | diner1234  |

- Log in as **diner** → browse, open a restaurant, write a review → see the **🔔 notification bell** update.
- Log in as **admin** → respond to a review or moderate one → the diner receives a notification.

## 4) API testing (optional)
Import `docs/A2/RestaurantReview.postman_collection.json` into Postman, run the
**Auth › Login** requests first (they auto-save the tokens), then run each folder.

## Common issues
- **`MongooseError` / connection hangs:** `MONGO_URI` is wrong or the Atlas IP allow-list doesn't include your IP. Fix `.env` / Atlas Network Access.
- **Frontend calls fail (Network/CORS):** make sure `frontend/.env` has `REACT_APP_API_URL=http://localhost:5001` and the backend is running.
- **Port 5001 in use:** change `PORT` in `backend/.env` (and `REACT_APP_API_URL` to match).
- **`npm test` not found:** run it from inside the `backend/` folder.
