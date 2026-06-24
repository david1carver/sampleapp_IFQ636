# Commands cheat-sheet (copy / paste)

Repo: https://github.com/david1carver/restaurant-review-platform
Run these in a terminal (PowerShell on Windows). Full explanations are in
`CAMERON_TASKS.md`.

---

## CAMERON — setup (once)
```bash
git clone https://github.com/david1carver/restaurant-review-platform.git
cd restaurant-review-platform
git config user.name "Cameron Bruce"
git config user.email "your-github-email@example.com"
```
Create `backend/.env` (paste the MONGO_URI + JWT_SECRET David sends):
```
MONGO_URI=<from David>
JWT_SECRET=<from David>
PORT=5001
```
Install + test:
```bash
cd backend
npm install
npm test          # expect: 49 passing
```

## CAMERON — Commit #1: add the profile test
1. In VS Code, create `backend/test/profile.test.js` and paste the code from `CAMERON_TASKS.md` (step 1).
2. Then:
```bash
npm test          # expect: 52 passing
git checkout -b feature/profile-tests
git add backend/test/profile.test.js
git commit -m "test: add unit tests for the user profile endpoints"
git push -u origin feature/profile-tests
```
3. On GitHub click **Compare & pull request** -> **Create pull request**.

---

## DAVID — do this FIRST for each conflict (branch A), then tell Cameron
```bash
git checkout main
git pull origin main

# Conflict 1 - branch A
git checkout -b conflict/contrib-a
echo "# Contributors`r`n- David Carver: backend, patterns, notifications, CI/CD" | Out-File -Encoding utf8 CONTRIBUTORS.md
git add CONTRIBUTORS.md
git commit -m "docs: add David to CONTRIBUTORS"
git push -u origin conflict/contrib-a
git checkout main
git merge --no-ff conflict/contrib-a -m "Merge conflict/contrib-a"
git push origin main

# Conflict 2 - branch A
git checkout -b conflict/log-a
echo "# Meeting log`r`n- 2026-06-09 kickoff: task split (David)" | Out-File -Encoding utf8 docs/A2/meeting-log.md
git add docs/A2/meeting-log.md
git commit -m "docs: add meeting log (David)"
git push -u origin conflict/log-a
git checkout main
git merge --no-ff conflict/log-a -m "Merge conflict/log-a"
git push origin main
```
Then message Cameron: "branch A merged, go".

---

## CAMERON — your half of the conflicts (branch B), AFTER David says "go"
```bash
git fetch origin
git checkout main          # do NOT pull David's latest - that's what creates the conflict

# Conflict 1 - branch B
git checkout -b conflict/contrib-b
echo "# Contributors`r`n- Cameron Bruce: testing, Postman, documentation" | Out-File -Encoding utf8 CONTRIBUTORS.md
git add CONTRIBUTORS.md
git commit -m "docs: add Cameron to CONTRIBUTORS"
git push -u origin conflict/contrib-b

# Conflict 2 - branch B
git checkout main
git checkout -b conflict/log-b
echo "# Meeting log`r`n- 2026-06-09 kickoff: testing plan (Cameron)" | Out-File -Encoding utf8 docs/A2/meeting-log.md
git add docs/A2/meeting-log.md
git commit -m "docs: add meeting log (Cameron)"
git push -u origin conflict/log-b
```
Then for EACH of these two branches on GitHub:
**Compare & pull request** -> it shows **"This branch has conflicts"** ->
**Resolve conflicts** -> keep BOTH lines, delete the `<<<<<<<`, `=======`,
`>>>>>>>` markers -> **Mark as resolved** -> **Commit merge** -> **Merge pull request**.
Screenshot the resolve screen for each (that's the §4.2 evidence).

---

## If anything gets stuck mid-merge
```bash
git merge --abort
```
Nothing breaks — just re-run from the top of that section.

> Note: the `Out-File -Encoding utf8` lines are PowerShell (Windows). On Mac/Linux
> use, e.g.: `printf '# Contributors\n- Cameron Bruce: testing, Postman, documentation\n' > CONTRIBUTORS.md`
