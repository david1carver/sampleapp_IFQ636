# Mesa — Developer Setup & Contribution SOP

A standard operating procedure for getting the Mesa restaurant-review platform
running locally, verifying it, and making a **genuine** contribution that the
team can record honestly.

> **Scope note (read first).** This SOP teaches the real mechanics — environment
> setup, running the app/tests, and the standard Git branch → commit → PR →
> review → merge-conflict workflow. It is written for someone *actually doing
> the work*: the commit/PR/review/conflict evidence it produces is only
> meaningful if the steps reflect work you genuinely performed. It deliberately
> does **not** include copy-paste "make it look like you contributed" commit
> content, "screenshot here for proof" markers, or a pre-filled contribution
> declaration. Record contributions truthfully on the declaration form.

---

## 0. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 18 or 20 | `node -v` |
| npm | 9+ | `npm -v` |
| Git | any recent | `git --version` |
| MongoDB | Atlas URI **or** local Mongo 6 | — |
| Postman | latest (optional) | desktop app |
| Newman | latest (optional, for CI-style runs) | `newman -v` |

You will also need the **`backend/.env` values** (Mongo URI + JWT secret). These
are **not** in the repo for security — get them from the team lead and paste them
in locally (see step 2).

---

## 1. Clone and create your working branch

Cloning from GitHub (rather than working from a zip) is what makes your commits
count under *your* account.

```bash
# Clone
git clone https://github.com/david1carver/restaurant-review-platform.git
cd restaurant-review-platform

# Always branch off main for any change — never commit straight to main.
git checkout main
git pull origin main
git checkout -b feature/<your-initials>-<short-description>
# e.g. git checkout -b feature/cb-review-length-test
```

Set your Git identity once so commits are attributed to you:

```bash
git config user.name  "Your Name"
git config user.email "your-github-email@example.com"
```

---

## 2. Backend: install, configure, seed, run

```bash
cd backend
npm install
```

Create `backend/.env` (use the real values supplied by the team lead):

```env
MONGO_URI=<mongodb-connection-string>
JWT_SECRET=<jwt-secret>
PORT=5001
```

Seed the database (creates 6 restaurants + the admin/diner test users):

```bash
node seed.js
```

Start the backend (leave this terminal running):

```bash
npm run dev          # http://localhost:5001
```

Smoke-test it from a second terminal:

```bash
curl -i http://localhost:5001/api/restaurants
# Expect: HTTP/1.1 200 OK  +  a JSON body with an "items" array
```

---

## 3. Frontend: install, configure, run

In a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5001
```

Start it:

```bash
npm start            # opens http://localhost:3000
```

Demo logins (from the seed): admin `admin@mesa.test / admin1234`,
diner `diner@mesa.test / diner1234`.

---

## 4. Run the unit test suite

The backend tests use Mocha + Sinon and need **no database** (Mongoose is
stubbed), so they run anywhere.

```bash
cd backend
NODE_ENV=test npm test
```

Expected: the full suite passes (currently **49 passing**) — controller tests
plus the design-pattern/OOP tests. If you add a test, this number goes up; make
sure it stays green before you push.

Capture the terminal output for your own records if your task involves tests.

---

## 5. Run the API tests (Postman / Newman)

**Postman app:** Import `postman/Mesa.postman_collection.json` and
`postman/Mesa.local.postman_environment.json`, select the *Mesa — Local*
environment, then **Run** the collection (Collection Runner). With the backend
running on 5001, every request shows pass/fail.

**Headless (Newman):**

```bash
npm install -g newman
newman run postman/Mesa.postman_collection.json \
  -e postman/Mesa.local.postman_environment.json \
  --reporters cli,html --reporter-html-export postman/newman-report.html
```

Newman exits non-zero if any assertion fails, so the same command works in CI.

---

## 6. Make a genuine contribution

Pick up a **real** open task (ask the team lead, or take one from the issue
list / backlog). Examples of self-contained tasks suitable for one person:

- Add a unit test for an untested branch (e.g. `updateReview` rating-range
  rejection, or a new edge case).
- Add input validation or a small endpoint improvement.
- Improve a frontend component or fix a UI bug.
- Extend the Postman collection with another error-case request.

Then:

```bash
# Make your change in your editor...

# Stage and commit with a clear, descriptive message (present tense).
git add <files-you-changed>
git commit -m "test(reviews): cover rating-range rejection in updateReview"

# Push your branch to your own account's remote tracking.
git push -u origin feature/<your-initials>-<short-description>
```

**Commit message guidance** — describe what the change does and why, e.g.
`feat(...)`, `fix(...)`, `test(...)`, `docs(...)`. Several small honest commits
are better than one giant one.

---

## 7. Open a Pull Request

On GitHub, open a PR from your `feature/...` branch into `main`. Use a
structured description:

```
## What
<one or two lines on the change>

## Why
<the reason / which task or requirement it addresses>

## Test plan
- [ ] `NODE_ENV=test npm test` passes
- [ ] (if relevant) Postman/Newman collection passes
- [ ] manual check: <what you clicked / curled>
```

Request a review from a teammate.

---

## 8. Review a teammate's PR (code review)

A substantive review is part of the workflow — not a rubber stamp.

1. Open the PR → **Files changed**.
2. Pull the branch locally and run it if the change is non-trivial:
   ```bash
   git fetch origin
   git checkout <their-branch>
   NODE_ENV=test npm test
   ```
3. Leave **inline comments** on specific lines: ask questions, point out edge
   cases, suggest improvements. Approve only once you're satisfied, or request
   changes with concrete reasons.

---

## 9. Merge-conflict resolution

Conflicts arise naturally when two branches edit the same lines. When yours
won't merge cleanly:

```bash
# Bring your branch up to date with main.
git checkout feature/<your-branch>
git fetch origin
git merge origin/main          # conflicts will be reported here
```

Git marks conflicts in the affected files:

```
<<<<<<< HEAD
your version
=======
the version from main
>>>>>>> origin/main
```

Edit each file to the correct combined result, remove the `<<<<<<<`, `=======`,
`>>>>>>>` markers, then:

```bash
git add <resolved-files>
git commit                     # completes the merge
NODE_ENV=test npm test         # re-verify nothing broke
git push
```

Record in the PR/report *what* the conflict was and *how* you resolved it — that
narrative is the evidence, and it's only accurate if the conflict was real.

---

## 10. Recording contributions honestly

The contribution declaration should reflect what each person actually did. If
the workload was uneven, state that plainly — an honest, lopsided declaration is
both acceptable and far safer than an invented even split. Your commit history,
PRs, and reviews are the supporting record; keep them genuine and they'll back
up whatever you declare.

---

## Quick reference

```bash
# Full local bring-up
git clone https://github.com/david1carver/restaurant-review-platform.git && cd restaurant-review-platform
cd backend && npm install                # + create backend/.env
node seed.js && npm run dev              # terminal 1  → :5001
cd ../frontend && npm install            # + create frontend/.env
npm start                                # terminal 2  → :3000

# Verify
cd ../backend && NODE_ENV=test npm test  # 49 passing
newman run ../postman/Mesa.postman_collection.json -e ../postman/Mesa.local.postman_environment.json

# Contribute
git checkout -b feature/<initials>-<desc>
# ...edit...; git add; git commit -m "..."; git push -u origin HEAD
```
