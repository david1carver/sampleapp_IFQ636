// backend/test/reviews.test.js
// Unit tests for reviewController.createReview, using sinon to stub Mongoose methods.
// Covers happy path (201), duplicate-prevention path (409), and restaurant-not-found (404).
// No database connection required.

const chai = require('chai');
const sinon = require('sinon');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Notification = require('../models/Notification');
const { createReview } = require('../controllers/reviewController');

const expect = chai.expect;

describe('reviewController.createReview (unit tests, sinon)', () => {
  afterEach(() => {
    sinon.restore();
  });

  // --- Test 5: createReview happy path ---
  it('returns 201 when a valid review is created', async () => {
    const fakeRestaurant = { _id: '507f191e810c19729de860ea', name: 'Saigon & Smoke' };
    const fakeReview = {
      _id: 'rev1',
      restaurantId: '507f191e810c19729de860ea',
      userId: 'user1',
      rating: 5,
      text: 'Excellent food and service.',
    };

    sinon.stub(Restaurant, 'findById').resolves(fakeRestaurant);
    sinon.stub(Review, 'create').resolves(fakeReview);
    // recomputeAggregates internally calls Review.aggregate() then Restaurant.findByIdAndUpdate().
    // Stub both so the test doesn't try to hit the real database.
    sinon.stub(Review, 'aggregate').resolves([{ _id: '507f191e810c19729de860ea', average: 5, count: 1 }]);
    sinon.stub(Restaurant, 'findByIdAndUpdate').resolves(fakeRestaurant);
    // The NotificationObserver now fires on review creation; stub the persist call.
    sinon.stub(Notification, 'create').resolves({ _id: 'n1' });

    const req = {
      params: { id: '507f191e810c19729de860ea' },
      body: { rating: 5, text: 'Excellent food and service.' },
      user: { _id: 'user1' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createReview(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal(fakeReview);
  });

  // --- Test 6: createReview duplicate-prevention path ---
  it('returns 409 when the same user reviews the same restaurant twice', async () => {
    const fakeRestaurant = { _id: '507f191e810c19729de860ea', name: 'Saigon & Smoke' };
    sinon.stub(Restaurant, 'findById').resolves(fakeRestaurant);
    // Review.create rejects with a Mongo duplicate-key error (compound unique index hit).
    sinon.stub(Review, 'create').rejects({ code: 11000 });

    const req = {
      params: { id: '507f191e810c19729de860ea' },
      body: { rating: 3, text: 'Second attempt should be blocked.' },
      user: { _id: 'user1' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createReview(req, res);

    expect(res.status.calledWith(409)).to.be.true;
    const body = res.json.firstCall.args[0];
    expect(body).to.have.property('message');
    expect(body.message.toLowerCase()).to.include('already');
  });

  // --- Test 7: createReview restaurant-not-found path ---
  it('returns 404 when the restaurant does not exist', async () => {
    sinon.stub(Restaurant, 'findById').resolves(null);

    const req = {
      params: { id: 'does-not-exist' },
      body: { rating: 5, text: 'Trying to review a missing restaurant.' },
      user: { _id: 'user1' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message');
  });
});