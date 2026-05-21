// backend/test/restaurants.test.js
// Integration tests for the public restaurant API.
// Hits the real Express app + Atlas via chai-http in-process (no HTTP socket).

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /api/restaurants', function () {
  this.timeout(15000); // Atlas can be slow on cold start.

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
  });

  after(async () => {
    // Leave the connection open if the dev server is also using it; only close
    // if this test process opened it itself. mongoose.connection.close() would
    // disrupt a parallel dev server.
  });

  it('returns the seeded catalogue with the expected shape', async () => {
    const res = await chai.request(app).get('/api/restaurants');

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('items').that.is.an('array');
    expect(res.body).to.have.property('total').that.is.a('number');
    expect(res.body).to.have.property('page', 1);
    expect(res.body).to.have.property('totalPages').that.is.a('number');
    expect(res.body.items.length).to.be.at.least(6);

    const sample = res.body.items[0];
    expect(sample).to.have.property('_id');
    expect(sample).to.have.property('name');
    expect(sample).to.have.property('slug');
    expect(sample).to.have.property('cuisine');
    expect(sample).to.have.property('location');
    expect(sample).to.have.property('averageRating');
    expect(sample).to.have.property('reviewCount');
  });

  it('filters by cuisine when ?cuisine=Vietnamese BBQ is provided', async () => {
    const res = await chai.request(app)
      .get('/api/restaurants')
      .query({ cuisine: 'Vietnamese BBQ' });

    expect(res).to.have.status(200);
    expect(res.body.items).to.be.an('array').that.is.not.empty;
    res.body.items.forEach((r) => {
      expect(r.cuisine.toLowerCase()).to.equal('vietnamese bbq');
    });
  });

  it('returns the right restaurant when fetched by slug', async () => {
    const res = await chai.request(app).get('/api/restaurants/saigon-smoke');

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('slug', 'saigon-smoke');
    expect(res.body).to.have.property('name', 'Saigon & Smoke');
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await chai.request(app).get('/api/restaurants/does-not-exist');

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('message');
  });
});