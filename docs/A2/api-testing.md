# A2 Step 6 — API Testing (Postman / Thunder Client)

API testing was performed against the running backend (`http://localhost:5001`)
using a REST client, exercising success paths and error handling. The exported
collection is `docs/A2/RestaurantReview.postman_collection.json`.

| # | Request | Method / Endpoint | Auth | Expected | Actual |
|---|---|---|---|---|---|
| 1 | Login (diner) | POST /api/auth/login | – | 200 + JWT token | 200 OK |
| 2 | List restaurants | GET /api/restaurants | – | 200 paginated list | 200 OK |
| 3 | Create review | POST /api/restaurants/:id/reviews | diner | 201 created | 201 Created |
| 4 | Duplicate review (same diner) | POST /api/restaurants/:id/reviews | diner | 409 conflict | 409 |
| 5 | Missing rating/text | POST /api/restaurants/:id/reviews | diner | 400 validation | 400 |
| 6 | Create review without token | POST /api/restaurants/:id/reviews | none | 401 unauthorized | 401 |
| 7 | Create restaurant as diner | POST /api/restaurants | diner | 403 forbidden | 403 |

The mix of 2xx and 4xx (400/401/403/409) responses demonstrates correct success
behaviour **and** robust error handling. Insert the request/response screenshots
into report §6.1.
