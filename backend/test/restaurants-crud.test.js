// backend/test/restaurants-crud.test.js
// Unit tests for restaurant UPDATE and DELETE (cascade) controller paths.
// Pure unit tests — Mongoose statics stubbed with sinon, no DB connection.

const chai = require('chai');
const sinon = require('sinon');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
const { updateRestaurant, deleteRestaurant } = require('../controllers/restaurantController');

const expect = chai.expect;

const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

describe('restaurantController UPDATE / DELETE (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  // TC-R-04
  it('updateRestaurant returns 200 with the updated restaurant', async () => {
    const updated = { _id: 'r1', name: 'Renamed Bistro', cuisine: 'Thai', location: 'Sydney' };
    sinon.stub(Restaurant, 'findByIdAndUpdate').resolves(updated);

    const req = { params: { id: 'r1' }, body: { name: 'Renamed Bistro' } };
    const res = mockRes();
    await updateRestaurant(req, res);

    expect(res.json.firstCall.args[0]).to.deep.equal(updated);
  });

  // TC-R-05
  it('updateRestaurant returns 404 when the restaurant does not exist', async () => {
    sinon.stub(Restaurant, 'findByIdAndUpdate').resolves(null);
    const req = { params: { id: 'nope' }, body: { name: 'x' } };
    const res = mockRes();
    await updateRestaurant(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  // TC-R-06
  it('deleteRestaurant returns 200 and cascades review deletion', async () => {
    sinon.stub(Restaurant, 'findByIdAndDelete').resolves({ _id: 'r1' });
    const cascade = sinon.stub(Review, 'deleteMany').resolves({ deletedCount: 3 });

    const req = { params: { id: 'r1' } };
    const res = mockRes();
    await deleteRestaurant(req, res);

    expect(cascade.calledOnceWith({ restaurantId: 'r1' })).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'Restaurant deleted', id: 'r1' });
  });

  // TC-R-07
  it('deleteRestaurant returns 404 when the restaurant does not exist', async () => {
    sinon.stub(Restaurant, 'findByIdAndDelete').resolves(null);
    const req = { params: { id: 'nope' } };
    const res = mockRes();
    await deleteRestaurant(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });
});
