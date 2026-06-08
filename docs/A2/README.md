# IFQ636 Assignment 2 — Deliverables Index

This folder contains the Assignment 2 artefacts for the **Restaurant Review
Platform** (extended from Assignment 1). The application code lives in
`backend/` and `frontend/` at the repo root.

> **New repository required.** A2 must be submitted as a **new** GitHub repo with
> commits from **every** team member, ≥2 resolved merge conflicts, PRs, and code
> reviews (Step 4 + rubric). This content is ready to drop into that new repo;
> the per-member commit history must be created by the team — it cannot be
> generated automatically.

## Map of deliverables → assignment steps

| A2 Step / Criterion | Artefact |
|---|---|
| Step 2 — SRS (2.1–2.11) | [`SRS.md`](./SRS.md) |
| Step 3 — Design patterns & OOP (3.1 matrix, 3.2 OOP) | [`report-section-3.md`](./report-section-3.md) + code under `backend/` |
| Step 5 — Functional (unit) testing + test-case table | [`functional-test-cases.md`](./functional-test-cases.md); run `cd backend && npm test` (44 passing) |
| Step 6 — API testing (Postman) | [`RestaurantReview.postman_collection.json`](./RestaurantReview.postman_collection.json) |
| Step 7 — CI/CD (EC2) | [`cicd-runbook.md`](./cicd-runbook.md); `.github/workflows/ci.yml`; `scripts/ec2-setup.sh`; `scripts/nginx/restaurant-review.conf` |

## Design patterns implemented (Step 3)
Singleton, Factory Method, Builder, Repository, Decorator, Facade, Strategy,
Observer — see the matrix in `report-section-3.md`. New functionality: in-app
**Notifications** subsystem (`/api/notifications`).

## Still required from the team (cannot be automated)
- Create the new GitHub repo; real commits from each member; ≥2 merge conflicts (Step 4).
- Team collaboration statement (4.1) and meeting log (4.2).
- GenAI disclosure (Step 9) — Claude (Anthropic) was used; disclose prompts/tasks.
- Video demonstration (Part B) and Declaration of Contribution (Part C).
- Run the Postman collection live and capture screenshots (Step 6 evidence).
- Provision EC2 per the runbook and capture pipeline/pm2/live-URL screenshots (Step 7 evidence).
