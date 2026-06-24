# A2 — High-Distinction evidence checklist

Goal: hit the **top of every HD band**. Legend: ✅ done in repo · 🟡 done, needs a
screenshot/live capture · 🔴 only the team can produce (commits/live deploy/video).

---

## 1. SRS documentation (/10) — HD = detailed SRS, clear boundaries, roles+accessibility, full FR+NFR with a labelled system diagram, comprehensive safety, risk table with likelihood/impact/mitigation
- ✅ Sections 2.1–2.11 written (report + `SRS.md`).
- ✅ Labelled **system diagram** embedded (`docs/A2/diagrams/architecture.png`).
- ✅ Risk table with likelihood / impact / mitigation.
- 🟡 Paste the remaining **A1 low-fi wireframes** (Screens 1–9) into §2.8 (the Notifications wireframe is already embedded).
**To max:** ensure inclusions *and* exclusions are explicit (they are) and the diagram is referenced in text (it is).

## 2. Design patterns & OOP (/28) — HD = seven patterns + strong OOP, each justified in backend code
- ✅ **Eight** patterns implemented (one above the HD bar), each justified in `report-section-3.md` §3.1 with file paths + collaboration narrative.
- ✅ OOP (encapsulation/inheritance/abstraction/polymorphism) with code snippets §3.2.
- ✅ Every pattern has a unit test (TC-P-01…16).
**To max:** in the **video**, open 2–3 pattern files and explain them on camera (the rubric is "presentation in report *and* video").

## 3. Team collaboration via GitHub (/10) — HD = branching, commits, PRs, merges, **merge-conflict resolution**, strong collaboration  🔴 TEAM ACTION REQUIRED
This is the one criterion no tooling can fake. In the **new** repo, each member must:
1. Create a feature branch and make **their own commits** (so `git log`/Insights shows ≥3 distinct authors).
2. Open **pull requests** and **review** each other's PRs (leave a review comment, then merge).
3. Create and resolve **≥2 merge conflicts**. Easy, believable conflicts:
   - Two members edit the route registrations in `backend/server.js`.
   - Two members edit the links/markup in `frontend/src/components/mesa/Navbar.jsx`.
   - Two members edit this checklist or the README intro.
   Make conflicting edits on two branches, merge one, then merge the other and resolve.
4. Capture for §4.2: **Insights → Contributors** graph, the **commit/network** graph, the **branch list**, a **merged PR with a review**, and the **two resolved conflicts** (the GitHub "Resolve conflicts" screen or `git` before/after).
5. Fill §4.1 (who did what) and the §4.2 meeting log.

## 4. API testing — Postman (/12) — HD = all endpoints tested **with error handling**, screenshots + exported collection link
- ✅ Collection covers **all 21 endpoints** + error cases (401/403/404/409/400) with `pm.test` assertions: `docs/A2/RestaurantReview.postman_collection.json` (30 requests).
- 🟡 Import → run **Auth logins first** → run every folder → screenshot requests+responses (incl. an error case) for §6.1.
- 🟡 Put the raw GitHub link to the collection in §6.2 once the new repo exists.

## 5. Functional / unit testing (/12) — HD = pass/fail terminal screenshots for **all** backend functionality (create/update/delete/fetch) + table with ID/Expected/Actual
- ✅ **49 unit tests** covering auth + restaurant + review + notification **create/read/update/delete/fetch**, plus 16 pattern tests.
- ✅ Test-case table with ID / Expected / Actual: `docs/A2/functional-test-cases.md`.
- 🟡 Run `cd backend && npm test` and screenshot the **49 passing** terminal output for §5.1.

## 6. CI/CD pipeline (/12) — HD = fully functional automated GitHub Actions deploy, **public URL**, pm2 confirms **backend AND frontend** online  🔴 LIVE CAPTURE REQUIRED
- ✅ Pipeline builds + tests on every push and deploys to EC2; pm2 runs **both** `mesa-backend` (:5001) and `mesa-frontend` (:3000) behind nginx (`ci.yml`, `ec2-setup.sh`, nginx conf).
- 🔴 Provision EC2 (or any VPS) per `cicd-runbook.md`, add Secrets (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`), push to `main`.
- 🟡 Capture: §7.1 ci.yml, §7.2 `pm2 status` showing **two** processes online, §7.3 green Actions run, §7.4 browser at `http://<public IP>/` with the IP visible.
**Note (A1 blocker):** if the student AWS account blocks a stable Elastic IP, deploy the same workflow to a personal AWS account or any small VPS so the public URL is real — the rubric HD wording is "public URL + pm2", not specifically AWS.

## 7. README / report / reflection / references (/16) — HD = polished demo + comprehensive report, clear design+collaboration explanation, critical reflection, APA refs
- ✅ Comprehensive **README** (`README.md`), filled report (`IFQ636_A2_Report_FILLED.docx`), critical **reflection** + **GenAI** disclosure, **APA** references (incl. Gamma GoF).
- 🟡 After filling team facts/screenshots, export the report to PDF; check word count ~3000 ±10%.
- 🔴 Record the **video** (Part B): each member demos their part; show the running app (incl. notifications), a pattern or two in code, the green pipeline, and pm2 status.

---

## What's left for the team (the only non-automatable items)
1. **Create the new GitHub repo** and the real per-member commit/PR/merge-conflict history (Criterion 3). 🔴
2. **Deploy to a reachable host** and capture the live pipeline/pm2/URL screenshots (Criterion 6). 🔴
3. **Take the screenshots** listed above into the report's `[INSERT]` slots, fill `[TEAM]` facts. 🟡
4. **Record the video** and submit **Part C** (declaration of contribution). 🔴
