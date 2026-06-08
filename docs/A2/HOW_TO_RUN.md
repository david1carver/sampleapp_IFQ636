# How to run & test — Restaurant Review Platform (A2)

## Prerequisites
- Node.js 18+ (20 recommended) and npm
- A MongoDB connection string (MongoDB Atlas free tier, or local `mongodb://127.0.0.1:27017/mesa`)

## 1. Backend — configure
```bash
cd backend
cp .env.example .env
# edit .env:  MONGO_URI=<your connection string>   JWT_SECRET=<any random string>   PORT=5001
npm install
```

## 2. Backend — run the unit tests (no DB needed)
```bash
npm test
```
Expected: **44 passing** (Mocha + Chai + Sinon). This is the screenshot for report §5.1.

## 3. Backend — seed demo data + start the API
```bash
npm run seed      # 6 restaurants, admin + diner users, 3 demo notifications
npm run dev       # API on http://localhost:5001  (health: /api/health)
```
Demo logins: `admin@mesa.test / admin1234`  ·  `diner@mesa.test / diner1234`

## 4. Frontend — run
```bash
cd ../frontend
cp .env.example .env      # REACT_APP_API_URL=http://localhost:5001
npm install
npm start                 # http://localhost:3000
```
Log in as the diner and watch the **notification bell** (top-right). Log in as
admin and respond to a review → a new notification appears for the diner.

## 5. API testing (Postman) — report §6
Import `docs/A2/RestaurantReview.postman_collection.json`. Run **Auth › Login
(diner)** and **Auth › Login (admin)** first (they auto-save tokens), then run
each folder. It covers happy paths and error cases (401/403/404/409/400).

## 6. CI/CD to EC2 — report §7
Follow `docs/A2/cicd-runbook.md`. Provision EC2 with `scripts/ec2-setup.sh`,
add GitHub Secrets (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`), push to `main`.

---

## Creating the NEW A2 GitHub repository (team)
From the unzipped project folder:
```bash
git init
git add .
git commit -m "chore: import A2 project (Restaurant Review Platform)"
# create an EMPTY repo on github.com first (no README), then:
git remote add origin https://github.com/<team>/<new-repo>.git
git branch -M main
git push -u origin main
```
Then, for the **Team collaboration (10 pts)** criterion, each member must make
their own commits via feature branches + pull requests, and the team must create
and resolve **at least two merge conflicts** (e.g. two members edit the route
list in `backend/server.js` and the shared `frontend/src/components/mesa/Navbar.jsx`).
Capture the contributor graph, branches, a reviewed PR, and the conflict
resolutions for report §4.2.

## Project layout
```
backend/                 Express API
  core/                  Singleton Logger + Database, typed errors
  repositories/          Repository pattern (+ decorators/ Decorator)
  builders/ strategies/  Builder + Strategy
  events/  factories/    Observer subject/observers + Factory Method
  services/              Facade services + container (composition root)
  controllers/ routes/   thin HTTP layer
  models/                Mongoose models (incl. Notification)
  test/                  44 unit tests (mocha + chai + sinon)
  seed.js
frontend/                React 18 + Tailwind ("Mesa" design system)
  src/components/mesa/NotificationBell.jsx   (A2 feature)
.github/workflows/ci.yml CI/CD (test + EC2 deploy)
scripts/                 ec2-setup.sh, nginx config
docs/A2/                 SRS, report sections, test matrix, Postman, runbook, filled report
```
