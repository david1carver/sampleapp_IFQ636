// backend/test/controllers.extra.test.js
// Additional controller unit tests covering the update/delete/list paths that
// the original suite did not exercise. sinon stubs all Mongoose access.

const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;

const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

const {
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const {
  updateReview,
  deleteReview,
  listAllReviews,
} = require('../controllers/reviewController');

function mockRes() {
  return { status: sinon.stub().returnsThis(), json: sinon.spy() };
}

const admin = { _id: 'admin1', role: 'admin' };

describe('restaurantController update/delete (sinon)', () => {
  afterEach(() => sinon.restore());

  it('updateRestaurant returns 200 with the updated restaurant (admin via Proxy)', async () => {
    const updated = { _id: 'r1', name: 'Renamed Bistro' };
    sinon.stub(Restaurant, 'findByIdAndUpdate').resolves(updated);

    const req = { params: { id: 'r1' }, body: { name: 'Renamed Bistro' }, user: admin };
    const res = mockRes();
    await updateRestaurant(req, res);

    expect(res.json.firstCall.args[0]).to.deep.equal(updated);
  });

  it('updateRestaurant returns 404 when the id is unknown', async () => {
    sinon.stub(Restaurant, 'findByIdAndUpdate').resolves(null);
    const req = { params: { id: 'nope' }, body: { name: 'x' }, user: admin };
    const res = mockRes();
    await updateRestaurant(req, res);
    expect(res.status.calledWith(404)).to.equal(true);
  });

  it('updateRestaurant returns 403 when a diner attempts it (Proxy denies)', async () => {
    const spy = sinon.stub(Restaurant, 'findByIdAndUpdate').resolves({});
    const req = { params: { id: 'r1' }, body: { name: 'x' }, user: { _id: 'd1', role: 'diner' } };
    const res = mockRes();
    await updateRestaurant(req, res);
    expect(res.status.calledWith(403)).to.equal(true);
    expect(spy.called).to.equal(false); // real service never reached
  });

  it('deleteRestaurant returns 200 and cascades review deletion', async () => {
    sinon.stub(Restaurant, 'findByIdAndDelete').resolves({ _id: 'r1' });
    const cascade = sinon.stub(Review, 'deleteMany').resolves({ deletedCount: 3 });

    const req = { params: { id: 'r1' }, body: {}, user: admin };
    const res = mockRes();
    await deleteRestaurant(req, res);

    expect(cascade.calledOnce).to.equal(true);
    expect(res.json.firstCall.args[0]).to.include({ message: 'Restaurant deleted' });
  });

  it('deleteRestaurant returns 404 when the id is unknown', async () => {
    sinon.stub(Restaurant, 'findByIdAndDelete').resolves(null);
    const req = { params: { id: 'nope' }, body: {}, user: admin };
    const res = mockRes();
    await deleteRestaurant(req, res);
    expect(res.status.calledWith(404)).to.equal(true);
  });
});

describe('reviewController update/delete/list (sinon)', () => {
  afterEach(() => sinon.restore());

  function fakeReview(overrides = {}) {
    return Object.assign(
      {
        _id: 'rev1',
        userId: 'user1',
        restaurantId: '507f191e810c19729de860ea',
        rating: 3,
        text: 'old',
        save: sinon.stub().resolvesThis ? sinon.stub().resolves() : sinon.stub().resolves(),
      },
      overrides
    );
  }

  it('updateReview lets the author edit and recomputes via Observer', async () => {
    const review = fakeReview();
    review.save = sinon.stub().resolves();
    sinon.stub(Review, 'findById').resolves(review);
    sinon.stub(Review, 'aggregate').resolves([{ _id: review.restaurantId, average: 4, count: 1 }]);
    sinon.stub(Restaurant, 'findByIdAndUpdate').resolves({});

    const req = { params: { id: 'rev1' }, body: { rating: 4, text: 'new' }, user: { _id: 'user1' } };
    const res = mockRes();
    await updateReview(req, res);

    expect(review.save.calledOnce).to.equal(true);
    expect(res.json.firstCall.args[0]).to.have.property('rating', 4);
  });

  it('updateReview returns 403 when a non-author tries to edit', async () => {
    const review = fakeReview({ userId: 'someone-else' });
    sinon.stub(Review, 'findById').resolves(review);
    const req = { params: { id: 'rev1' }, body: { text: 'hax' }, user: { _id: 'user1' } };
    const res = mockRes();
    await updateReview(req, res);
    expect(res.status.calledWith(403)).to.equal(true);
  });

  it('deleteReview lets an admin delete any review', async () => {
    const review = fakeReview({ userId: 'author', deleteOne: sinon.stub().resolves() });
    sinon.stub(Review, 'findById').resolves(review);
    sinon.stub(Review, 'aggregate').resolves([]);
    sinon.stub(Restaurant, 'findByIdAndUpdate').resolves({});

    const req = { params: { id: 'rev1' }, body: {}, user: { _id: 'admin1', role: 'admin' } };
    const res = mockRes();
    await deleteReview(req, res);

    expect(review.deleteOne.calledOnce).to.equal(true);
    expect(res.json.firstCall.args[0]).to.include({ message: 'Review deleted' });
  });

  it('deleteReview returns 403 for a non-author, non-admin', async () => {
    const review = fakeReview({ userId: 'author' });
    sinon.stub(Review, 'findById').resolves(review);
    const req = { params: { id: 'rev1' }, body: {}, user: { _id: 'intruder', role: 'diner' } };
    const res = mockRes();
    await deleteReview(req, res);
    expect(res.status.calledWith(403)).to.equal(true);
  });

  it('listAllReviews returns a paginated payload (Facade)', async () => {
    const chain = {
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      limit: sinon.stub().resolves([{ _id: 'rev1' }]),
    };
    sinon.stub(Review, 'find').returns(chain);
    sinon.stub(Review, 'countDocuments').resolves(1);

    const req = { query: {} };
    const res = mockRes();
    await listAllReviews(req, res);

    const body = res.json.firstCall.args[0];
    expect(body).to.have.property('total', 1);
    expect(body.items).to.have.lengthOf(1);
  });
});
