# A2 Step 5 — Functional (Unit) Testing: Test Case Matrix

**Project:** Restaurant Review Platform (extended for IFQ636 Assignment 2)
**Test framework:** Mocha + Chai + Sinon (pure unit tests; Mongoose statics stubbed, no DB)
**Command:** `cd backend && npm test`
**Result at time of writing:** **44 passing**

> How to read this table: each row is one automated unit test. "Actual Output"
> records the observed result of the latest run; "Status" is PASS when Actual
> matches Expected. Capture the terminal `npm test` output as the pass/fail
> screenshot evidence required by the rubric (one screenshot covers all rows).

## 5.1 Restaurant module (Create / Read / Update / Delete)

| Test Case ID | Function / Endpoint | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-R-01 | `GET /api/restaurants` (list) | empty query | 200; `{items, page:1, total, totalPages}` | matches | PASS |
| TC-R-02 | `GET /api/restaurants/:slug` | known slug | 200; restaurant object | matches | PASS |
| TC-R-03 | `GET /api/restaurants/:slug` | unknown slug | 404; `{message}` | matches | PASS |
| TC-R-04 | `POST /api/restaurants` (admin) | valid body | 201; created restaurant | matches | PASS |
| TC-R-05 | `PATCH /api/restaurants/:id` | valid patch | 200; updated restaurant | matches | PASS |
| TC-R-06 | `PATCH /api/restaurants/:id` | unknown id | 404; `{message}` | matches | PASS |
| TC-R-07 | `DELETE /api/restaurants/:id` | known id | 200; `{message,id}` + reviews cascade-deleted | matches | PASS |
| TC-R-08 | `DELETE /api/restaurants/:id` | unknown id | 404; `{message}` | matches | PASS |

## 5.2 Review module (Create / Read / Update / Delete / Respond)

| Test Case ID | Function / Endpoint | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-V-01 | `POST /api/restaurants/:id/reviews` | valid review | 201; created review | matches | PASS |
| TC-V-02 | `POST /api/restaurants/:id/reviews` | duplicate by same diner | 409; "already reviewed" | matches | PASS |
| TC-V-03 | `POST /api/restaurants/:id/reviews` | unknown restaurant | 404; `{message}` | matches | PASS |
| TC-V-04 | `PATCH /api/reviews/:id` | author edits | 200; updated review (rating changed) | matches | PASS |
| TC-V-05 | `PATCH /api/reviews/:id` | non-author edits | 403; `{message}` | matches | PASS |
| TC-V-06 | `PATCH /api/reviews/:id` | unknown id | 404; `{message}` | matches | PASS |
| TC-V-07 | `DELETE /api/reviews/:id` | author deletes own | 200; `{message,id}` | matches | PASS |
| TC-V-08 | `DELETE /api/reviews/:id` | admin deletes other's | 200; author notified | matches | PASS |
| TC-V-09 | `DELETE /api/reviews/:id` | non-author/non-admin | 403; `{message}` | matches | PASS |
| TC-V-10 | `POST /api/reviews/:id/response` (admin) | valid response | 200; review w/ ownerResponse; author notified | matches | PASS |
| TC-V-11 | `POST /api/reviews/:id/response` | empty response | 400; `{message}` | matches | PASS |
| TC-V-12 | `GET /api/restaurants/:id/reviews` | restaurant id | 200; populated, sorted reviews | matches | PASS |
| TC-V-13 | `GET /api/reviews` (admin) | empty query | 200; paginated moderation payload | matches | PASS |

## 5.3 Notification module (new A2 functionality)

| Test Case ID | Function / Endpoint | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-N-01 | `POST /api/notifications` | `{message}` | 201; created notification | matches | PASS |
| TC-N-02 | `POST /api/notifications` | missing message | 400; `{message}` | matches | PASS |
| TC-N-03 | `GET /api/notifications` | auth user | 200; user's notifications | matches | PASS |
| TC-N-04 | `GET /api/notifications/unread/count` | auth user | 200; `{count}` | matches | PASS |
| TC-N-05 | `PUT /api/notifications/:id/read` | owner | 200; `{read:true}` | matches | PASS |
| TC-N-06 | `PUT /api/notifications/:id/read` | non-owner | 403; `{message}` | matches | PASS |
| TC-N-07 | `PUT /api/notifications/:id/read` | unknown id | 404; `{message}` | matches | PASS |

## 5.4 Design-pattern unit tests (Step 3 evidence)

| Test Case ID | Pattern under test | Expected Output | Actual | Status |
|---|---|---|---|---|
| TC-P-01 | Singleton — Logger one instance | `new Logger() === getInstance()` | matches | PASS |
| TC-P-02 | Singleton — Database one instance | same instance | matches | PASS |
| TC-P-03 | Repository — BaseRepository abstract | throws on direct `new` | matches | PASS |
| TC-P-04 | Repository — `findBySlug` lowercases + queries | calls model with lowercased slug | matches | PASS |
| TC-P-05 | Factory — OWNER_RESPONSE shape | correct payload | matches | PASS |
| TC-P-06 | Factory — dispatch + unknown kind throws | throws | matches | PASS |
| TC-P-07 | Builder — assembles filter/pagination/sort | correct descriptor | matches | PASS |
| TC-P-08 | Builder — `withSort` swaps strategy | `{name:1}` | matches | PASS |
| TC-P-09 | Strategy — resolves per key | correct sort objects | matches | PASS |
| TC-P-10 | Strategy — abstract not instantiable | throws | matches | PASS |
| TC-P-11 | Decorator — transparent forward + log | same result, logs added | matches | PASS |
| TC-P-12 | Decorator — re-throws wrapped errors | error propagated | matches | PASS |
| TC-P-13 | Observer — notifies all; one failure isolated | `['o1','o3']` | matches | PASS |
| TC-P-14 | Observer — unsubscribe | observer removed | matches | PASS |
| TC-P-15 | Observer — abstract not instantiable | throws | matches | PASS |
| TC-P-16 | Typed errors — NotFound is AppError(404) | statusCode 404 | matches | PASS |

**Totals:** 8 (Restaurant) + 13 (Review) + 7 (Notification) + 16 (Patterns) = **44 unit tests, 44 passing.**
