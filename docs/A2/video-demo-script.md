# A2 Part B — Video demonstration script (~10 minutes)

A live demo that verifies functionality, completeness, and understanding. **Each
member demonstrates their own part** (rubric requirement). Show the *running*
system, not the report. Keep screens large and readable.

**Before recording (have ready):**
- Backend running (`npm run dev`) + frontend (`npm start`), seeded data loaded.
- Logged-out browser tab; Postman open with the collection imported.
- GitHub repo open: Actions tab, Insights → Contributors, a merged PR, branches.
- An SSH terminal to EC2 ready to run `pm2 status` (or screenshots if live host is down).
- VS Code open at the `backend/` folder.

---

## 0:00–0:45 — Intro & overview (Member A)
- "This is the Restaurant Review Platform, our IFQ636 A2 project, extending our A1
  app with an OOP, design-pattern architecture, a notifications feature, unit
  tests and a CI/CD pipeline."
- Name the team and who built what (one sentence each).
- Show the public URL loading (or localhost) — the Browse page.

## 0:45–3:00 — Live app: core flows (Member A — diner; Member B — admin)
**Diner (Member A):**
1. Register/login as `diner@mesa.test`.
2. Browse → use a **cuisine filter**, a **search**, and change **sort** (rating/newest).
3. Open a restaurant → **write a review** (rating + text) → show it appears and the
   **average rating updates** (mention the `$group` aggregation via the Observer).
4. Try to review the **same restaurant again** → show the **HTTP 409** "already reviewed".
5. Go to **My Reviews** → **edit** then **delete** a review.
6. Point at the **🔔 bell** → open the dropdown → "this is our new A2 feature".

**Admin (Member B):**
1. Login as `admin@mesa.test`.
2. **Restaurants:** create a restaurant, edit it, delete one (mention reviews cascade-delete).
3. **Review moderation:** remove a review → switch to the diner tab → show the diner
   got a **notification** ("your review was removed"). This shows the event-driven flow.
4. Respond to a review as owner → diner gets an "owner responded" notification.

## 3:00–5:00 — Design patterns & OOP in code (Member B or C)
Open `backend/` in VS Code and show 3–4 patterns *briefly*, tying each to behaviour:
- **Facade** `services/ReviewService.js` — "controllers stay thin; the service
  coordinates everything."
- **Observer** `events/ReviewSubject.js` + `events/observers/` — "creating a review
  fires one event; three observers react: rating recompute, notification, audit.
  Adding a new side-effect is one new class — Open/Closed."
- **Repository + Decorator** `repositories/BaseRepository.js` and
  `decorators/LoggingRepositoryDecorator.js` — "data access is abstracted; the
  decorator adds logging transparently via a Proxy."
- **Strategy + Builder** `strategies/SortStrategy.js`, `builders/RestaurantQueryBuilder.js`
  — "sort algorithms are interchangeable; the builder assembles the search query."
- Mention Singleton (`core/Logger`, `core/Database`) and Factory Method
  (`factories/NotificationFactory`). "Eight patterns total — matrix is in §3.1."

## 5:00–6:30 — Unit testing (Member C)
- Terminal: `cd backend && npm test` → show **49 passing**.
- Scroll the output: auth, restaurant CRUD, review CRUD, notifications, and the
  16 pattern tests. "Pure unit tests — Mongoose is stubbed with Sinon, so no DB."
- Show the test-case table briefly (`docs/A2/functional-test-cases.md`).

## 6:30–7:45 — API testing with Postman (Member C)
- Run **Auth › Login (diner)** and **(admin)** → tokens auto-save.
- Run a happy path (GET /restaurants, POST review) and an **error case**
  (duplicate review → 409; create restaurant as diner → 403; no token → 401).
- "All endpoints and error paths are covered; the collection is in the repo."

## 7:45–9:00 — CI/CD pipeline (Member A or B)
- Show `.github/workflows/ci.yml` — "Job 1 tests on every push; Job 2 deploys to EC2."
- GitHub → **Actions** → open the latest run → show **test** then **deploy** green.
- SSH to EC2 → `pm2 status` → show **mesa-backend** and **mesa-frontend** both online.
- Open `http://<EC2_PUBLIC_IP>/` → app loads; `/api/health` → `{"status":"OK"}`.
  "Push to main automatically tests and redeploys."

## 9:00–9:45 — GitHub collaboration (whole team)
- GitHub → **Insights › Contributors**: show commits from each member.
- Show the **branch list**, a **merged pull request with a review comment**, and
  the **two resolved merge conflicts**.

## 9:45–10:00 — Wrap-up (Member A)
- One sentence each on the biggest thing learned (ties to the reflection).
- "Thanks — the report, code, and this demo together cover all A2 criteria."

---

### Tips
- Rehearse once; keep each person to their time slot.
- If the live EC2 host is down due to the AWS account limit, narrate it and show
  the green pipeline + `pm2 status` screenshots instead — be honest, as in the report.
- Speak to *why* (design decisions), not just *what* — the rubric marks understanding.
