# Cameron — your tasks for IFQ636 Assignment 2

Hey Cameron — here's everything you need to do, step by step. The goal is that
**your own GitHub account** shows real commits, a pull request, a code review, and
your half of two merge conflicts. That's what the marker checks for the "Team
collaboration" criterion, so it matters that *you* do these from your machine.

Project: **Restaurant Review Platform** (David's Mesa project, extended for A2)
Repo: **https://github.com/david1carver/restaurant-review-platform**

---

## 0. One-time setup (~15 min)

**Install (if you don't have them):**
- Node.js 18 or 20 — https://nodejs.org
- Git — https://git-scm.com
- VS Code — https://code.visualstudio.com

**Accept the repo invite:** David will add you as a collaborator — accept the email
invite (or the notification at github.com).

**Clone the repo** (in a terminal / PowerShell):
```bash
git clone https://github.com/david1carver/restaurant-review-platform.git
cd restaurant-review-platform
```

**Tell Git who you are** (so your commits are attributed to YOU — important):
```bash
git config user.name "Cameron Bruce"
git config user.email "<the email on your GitHub account>"
```

**Backend env:** David will send you a `backend/.env` content (MongoDB URI + JWT
secret). Create the file `backend/.env` and paste:
```
MONGO_URI=<the string David sends>
JWT_SECRET=<the string David sends>
PORT=5001
```

**Install + run the tests** (no database needed for tests):
```bash
cd backend
npm install
npm test
```
**Expect:** `49 passing`. If you see that, you're set up correctly.

**Run the app (optional, for the video):**
```bash
npm run seed        # loads demo data
npm run dev         # backend on http://localhost:5001  (leave running)
```
New terminal:
```bash
cd frontend
copy .env.example .env   # (Mac/Linux: cp .env.example .env)
npm install
npm start                # opens http://localhost:3000
```
Logins: `admin@mesa.test / admin1234` · `diner@mesa.test / diner1234`.

---

## 1. Your first real commit — add a small unit test (~10 min)

This adds genuine test coverage (the user profile endpoints aren't tested yet).

```bash
git checkout main
git pull origin main
git checkout -b feature/profile-tests
```

Create a new file **`backend/test/profile.test.js`** and paste:
```js
// backend/test/profile.test.js - unit tests for the auth profile endpoints
const chai = require('chai');
const sinon = require('sinon');
const User = require('../models/User');
const { getProfile, updateUserProfile } = require('../controllers/authController');

const expect = chai.expect;
const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

describe('authController profile (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  it('getProfile returns 200 with the user profile', async () => {
    sinon.stub(User, 'findById').resolves({ name: 'Test Diner', email: 'diner@mesa.test', university: 'QUT', address: 'Brisbane' });
    const req = { user: { id: 'u1' } };
    const res = mockRes();
    await getProfile(req, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.firstCall.args[0]).to.include({ email: 'diner@mesa.test' });
  });

  it('getProfile returns 404 when the user is not found', async () => {
    sinon.stub(User, 'findById').resolves(null);
    const req = { user: { id: 'nope' } };
    const res = mockRes();
    await getProfile(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('updateUserProfile returns the updated profile with a token', async () => {
    const user = { id: 'u1', name: 'Old', email: 'old@mesa.test', university: '', address: '', role: 'diner' };
    user.save = sinon.stub().resolves(user);
    sinon.stub(User, 'findById').resolves(user);
    const req = { user: { id: 'u1' }, body: { name: 'New Name' } };
    const res = mockRes();
    await updateUserProfile(req, res);
    expect(res.json.firstCall.args[0]).to.have.property('token');
    expect(user.name).to.equal('New Name');
  });
});
```

Run it:
```bash
npm test
```
**Expect:** now **52 passing** (49 + your 3). Then commit + push:
```bash
git add backend/test/profile.test.js
git commit -m "test: add unit tests for the user profile endpoints"
git push -u origin feature/profile-tests
```

**Open a Pull Request:** GitHub will show a "Compare & pull request" button →
click it → add a short description → **Create pull request**. Tell David; he
reviews and merges it. (You'll also review one of *his* PRs — see step 3.)

---

## 2. Your second contribution — Postman 409 & 403 screenshots (~10 min)

We're missing two API screenshots. With the backend running (`npm run dev`):
- Install the **Thunder Client** extension in VS Code (or use Postman).
- **POST** `http://localhost:5001/api/auth/login` with body `{"email":"diner@mesa.test","password":"diner1234"}` → copy the `token`.
- **POST** `http://localhost:5001/api/restaurants/<a restaurant id>/reviews` with Auth → Bearer = your token, body `{"rating":5,"text":"test"}`. Send twice → the 2nd is **409**. Screenshot it.
- **POST** `http://localhost:5001/api/restaurants` with the diner token, body `{"name":"X","cuisine":"Y","location":"Z"}` → **403**. Screenshot it.

Send the two screenshots to David to add to report §6 (or commit them into `docs/A2/screenshots/` on a branch + PR if you're comfortable).

---

## 3. Review David's pull request (~3 min) — this is required evidence

When David opens a PR, go to the repo → **Pull requests** → open it → **Files
changed** → leave a comment (e.g. "Looks good, tests pass") → **Review changes →
Approve**. Then it can be merged. The marker looks for this review.

---

## 4. The two merge conflicts — you own "branch B" (coordinate with David)

A merge conflict happens when you and David edit the **same line**, David merges
first, then yours conflicts. David will tell you when he's merged his side.

**Conflict 1 — CONTRIBUTORS.md** (after David has merged his `contrib-a`):
```bash
git checkout main          # do NOT pull David's latest yet
git checkout -b conflict/contrib-b
```
Create/edit **`CONTRIBUTORS.md`** with one line:
```
# Contributors
- Cameron Bruce: testing, Postman, documentation
```
```bash
git add CONTRIBUTORS.md
git commit -m "docs: add Cameron to CONTRIBUTORS"
git push -u origin conflict/contrib-b
```
Open the PR → GitHub says **"This branch has conflicts"** → click **Resolve
conflicts** → keep **both** your and David's lines, delete the `<<<<<<<`,
`=======`, `>>>>>>>` markers → **Mark as resolved** → **Commit merge** → **Merge
pull request**. 📸 Screenshot the resolve screen.

**Conflict 2 — repeat** the same on `docs/A2/meeting-log.md` (David edits one line,
you edit the same line with your note). 📸 Screenshot it.

---

## 5. What to send David at the end
- Your **student ID** (for the report cover + Part C).
- Your **two Postman screenshots** (409 + 403).
- Your **two merge-conflict screenshots**.
- A one-line confirmation of what you did (for §4.1 / Part C).
- **Sign** the Declaration of Contribution (Part C) and pick a couple of **meeting
  date/times** for §4.2.
- Your **part of the video** (you demo testing + API, David demos the app + patterns).

## What to expect
- `npm test` should always end with `X passing` in green. If a test fails, copy the
  error to the group chat.
- The GitHub PR pages are click‑driven — nothing scary; if a button says "Merge
  pull request", that's the one.
- If a command says **"merge conflict"** in the terminal and you're stuck, run
  `git merge --abort` and ping David — no harm done.

That's it — roughly **2–3 hours total**. Ping the group chat at any step and we'll
sort it. Thanks Cameron! 🙌
