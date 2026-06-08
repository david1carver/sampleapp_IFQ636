// backend/test/reviews-crud.test.js
// Unit tests for review UPDATE / DELETE / RESPOND / fetch controller paths.
// Pure unit tests — Mongoose statics stubbed with sinon, no DB connection.

const chai = require('chai');
const sinon = require('sinon');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Notification = require('../models/Notification');
const reviewController = require('../controllers/reviewController');
const { updateReview, deleteReview, respondToReview } = reviewController;

const expect = chai.expect;
const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

// Stubs shared by paths that trigger the rating-recompute observer.
function stubRecompute() {
  sinon.stub(Review, 'aggregate').resolves([{ average: 4, count: 2 }]);
  sinon.stub(Restaurant, 'findByIdAndUpdate').resolves({ _id: 'rest1' });
}

describe('reviewController UPDATE (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  // TC-V-04
  it('updateReview returns 200 when the author edits their review', async () => {
    const review = {
      _id: 'rev1',
      userId: 'user1',
      restaurantId: 'rest1',
      rating: 3,
      text: 'old',
      save: sinon.stub().resolves(),
    };
    sinon.stub(Review, 'findById').resolves(review);
    stubRecompute();

    const req = { params: { id: 'rev1' }, body: { rating: 5, text: 'updated' }, user: { _id: 'user1' } };
    const res = mockRes();
    await updateReview(req, res);

    expect(review.save.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.equal(review);
    expect(review.rating).to.equal(5);
  });

  // TC-V-05
  it('updateReview returns 403 when a non-author tries to edit', async () => {
    sinon.stub(Review, 'findById').resolves({ _id: 'rev1', userId: 'user2', restaurantId: 'rest1' });
    const req = { params: { id: 'rev1' }, body: { text: 'hack' }, user: { _id: 'user1' } };
    const res = mockRes();
    await updateReview(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  // TC-V-06
  it('updateReview returns 404 when the review does not exist', async () => {
    sinon.stub(Review, 'findById').resolves(null);
    const req = { params: { id: 'nope' }, body: {}, user: { _id: 'user1' } };
    const res = mockRes();
    await updateReview(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });
});

describe('reviewController DELETE (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  // TC-V-07
  it('deleteReview returns 200 when the author deletes their own review', async () => {
    const review = { _id: 'rev1', userId: 'user1', restaurantId: 'rest1', deleteOne: sinon.stub().resolves() };
    sinon.stub(Review, 'findById').resolves(review);
    sinon.stub(Restaurant, 'findById').resolves({ _id: 'rest1', name: 'Saigon' });
    stubRecompute();

    const req = { params: { id: 'rev1' }, user: { _id: 'user1', role: 'diner' } };
    const res = mockRes();
    await deleteReview(req, res);

    expect(review.deleteOne.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'Review deleted', id: 'rev1' });
  });

  // TC-V-08
  it('deleteReview returns 200 when an admin removes another user\'s review (notifies author)', async () => {
    const review = { _id: 'rev1', userId: 'user1', restaurantId: 'rest1', deleteOne: sinon.stub().resolves() };
    sinon.stub(Review, 'findById').resolves(review);
    sinon.stub(Restaurant, 'findById').resolves({ _id: 'rest1', name: 'Saigon' });
    stubRecompute();
    const notify = sinon.stub(Notification, 'create').resolves({ _id: 'n1' });

    const req = { params: { id: 'rev1' }, user: { _id: 'admin1', role: 'admin' } };
    const res = mockRes();
    await deleteReview(req, res);

    expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'Review deleted', id: 'rev1' });
    expect(notify.calledOnce).to.be.true; // author notified of moderator removal
  });

  // TC-V-09
  it('deleteReview returns 403 when a non-author, non-admin tries to delete', async () => {
    sinon.stub(Review, 'findById').resolves({ _id: 'rev1', userId: 'user1', restaurantId: 'rest1' });
    const req = { params: { id: 'rev1' }, user: { _id: 'user2', role: 'diner' } };
    const res = mockRes();
    await deleteReview(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });
});

describe('reviewController RESPOND (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  // TC-V-10
  it('respondToReview returns 200 and notifies the review author', async () => {
    sinon.stub(Review, 'findByIdAndUpdate').resolves({ _id: 'rev1', userId: 'user1', restaurantId: 'rest1' });
    sinon.stub(Restaurant, 'findById').resolves({ _id: 'rest1', name: 'Saigon' });
    const notify = sinon.stub(Notification, 'create').resolves({ _id: 'n1' });

    const req = { params: { id: 'rev1' }, body: { response: 'Thanks for visiting!' } };
    const res = mockRes();
    await respondToReview(req, res);

    expect(res.json.firstCall.args[0]).to.have.property('_id', 'rev1');
    expect(notify.calledOnce).to.be.true;
  });

  // TC-V-11
  it('respondToReview returns 400 when the response text is empty', async () => {
    const req = { params: { id: 'rev1' }, body: { response: '   ' } };
    const res = mockRes();
    await respondToReview(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });
});

describe('reviewController FETCH (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  // TC-V-12
  it('listForRestaurant returns the populated, sorted reviews', async () => {
    const reviews = [{ _id: 'rev1' }, { _id: 'rev2' }];
    sinon.stub(Review, 'find').returns({
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves(reviews),
    });
    const req = { params: { id: 'rest1' } };
    const res = mockRes();
    await reviewController.listReviewsForRestaurant(req, res);
    expect(res.json.firstCall.args[0]).to.deep.equal(reviews);
  });

  // TC-V-13
  it('listAllReviews returns a paginated moderation payload', async () => {
    const items = [{ _id: 'rev1' }];
    sinon.stub(Review, 'find').returns({
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      limit: sinon.stub().resolves(items),
    });
    sinon.stub(Review, 'countDocuments').resolves(1);

    const req = { query: {} };
    const res = mockRes();
    await reviewController.listAllReviews(req, res);

    const body = res.json.firstCall.args[0];
    expect(body.items).to.deep.equal(items);
    expect(body).to.include({ total: 1, page: 1 });
  });
});
