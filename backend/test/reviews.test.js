// backend/test/reviews.test.js
// Integration tests for the authenticated review POST path.
// Covers: 401 when no token, 201 on happy path, 409 on duplicate-review attempt.

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');

chai.use(chaiHttp);
const expect = chai.expect;

describe('POST /api/restaurants/:id/reviews', function () {
  this.timeout(20000);

  // Each test run uses a fresh user (timestamped email) so the compound unique
  // index on (restaurantId, userId) never blocks reruns.
  const stamp = Date.now();
  const testUser = {
    name: `Mocha Tester ${stamp}`,
    email: `mocha-${stamp}@test.com`,
    password: 'mochatest1234',
  };

  let token; // JWT we'll re-use across tests in this describe
  let restaurantId; // Saigon & Smoke _id, fetched once
  let createdReviewId; // captured so we can clean up after the suite

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Register the test user and grab their JWT.
    const register = await chai.request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send(testUser);
    expect(register).to.have.status(201);
    expect(register.body).to.have.property('token');
    token = register.body.token;

    // Look up Saigon & Smoke's _id so we can POST to its reviews endpoint.
    const restRes = await chai.request(app).get('/api/restaurants/saigon-smoke');
    expect(restRes).to.have.status(200);
    restaurantId = restRes.body._id;
  });

  after(async () => {
    // Clean up: delete the test review and (best-effort) the test user.
    if (token && createdReviewId) {
      await chai.request(app)
        .delete(`/api/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${token}`);
    }
    // Test users accumulate over time. Acceptable - we use a unique email per run.
  });

  it('rejects unauthenticated POST with 401', async () => {
    const res = await chai.request(app)
      .post(`/api/restaurants/${restaurantId}/reviews`)
      .send({ rating: 5, text: 'Trying without a token, should fail.' });

    expect(res).to.have.status(401);
  });

  it('accepts a valid authenticated review with 201', async () => {
    const res = await chai.request(app)
      .post(`/api/restaurants/${restaurantId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, text: 'Lemongrass beef short rib is the move.' });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('_id');
    expect(res.body).to.have.property('rating', 5);
    expect(res.body).to.have.property('text');
    createdReviewId = res.body._id;
  });

  it('rejects a second review by the same user on the same restaurant with 409', async () => {
    const res = await chai.request(app)
      .post(`/api/restaurants/${restaurantId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3, text: 'Second attempt - should hit the compound unique index.' });

    expect(res).to.have.status(409);
    expect(res.body).to.have.property('message');
    expect(res.body.message.toLowerCase()).to.include('already');
  });
});
