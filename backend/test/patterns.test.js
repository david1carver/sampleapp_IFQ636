// backend/test/patterns.test.js
// Unit tests for the design-pattern modules and the OOP class hierarchy.
// Pure in-memory tests (sinon stubs the DB where a pattern touches Mongoose).

const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;

// --- OOP hierarchy + Factory ---
const User = require('../oop/User');
const Diner = require('../oop/Diner');
const Admin = require('../oop/Admin');
const UserFactory = require('../patterns/factory/UserFactory');

// --- Patterns ---
const Logger = require('../patterns/singleton/Logger');
const { getSortStrategy, RatingSortStrategy } = require('../patterns/strategy/SortStrategies');
const { buildReviewValidationChain } = require('../patterns/chain/ReviewValidation');
const {
  ReviewSubject,
  AggregateObserver,
} = require('../patterns/observer/ReviewSubject');
const {
  RestaurantService,
  RestaurantServiceProxy,
  AccessDeniedError,
} = require('../patterns/proxy/RestaurantServiceProxy');
const ModerationFacade = require('../patterns/facade/ModerationFacade');

const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

describe('OOP hierarchy (abstraction, inheritance, encapsulation, polymorphism)', () => {
  it('User is abstract — cannot be instantiated directly', () => {
    expect(() => new User({ id: '1', name: 'x', email: 'x@y.z', role: 'diner' })).to.throw(/abstract/);
  });

  it('Diner and Admin inherit from User and expose read-only encapsulated state', () => {
    const d = new Diner({ id: 'd1', name: 'Dee', email: 'dee@mesa.test' });
    expect(d).to.be.instanceOf(User);
    expect(d.role).to.equal('diner');
    // private state is encapsulated: a getter with no setter means external
    // assignment cannot mutate it (the write is a no-op in sloppy mode).
    try { d.role = 'admin'; } catch (_) { /* strict mode would throw; either way no mutation */ }
    expect(d.role).to.equal('diner');
  });

  it('permissions() is polymorphic — Diner and Admin differ', () => {
    const d = new Diner({ id: 'd1', name: 'Dee', email: 'dee@mesa.test' });
    const a = new Admin({ id: 'a1', name: 'Ada', email: 'ada@mesa.test' });
    expect(d.can('review:create')).to.equal(true);
    expect(d.can('restaurant:create')).to.equal(false);
    expect(a.can('restaurant:create')).to.equal(true);
    expect(a.canModerate()).to.equal(true);
  });

  it('describe() shows overloading-style behaviour via its verbose argument', () => {
    const a = new Admin({ id: 'a1', name: 'Ada', email: 'ada@mesa.test' });
    expect(a.describe()).to.equal('Ada (admin)');
    expect(a.describe(true)).to.include('ADMIN Ada');
  });
});

describe('Factory pattern (UserFactory)', () => {
  it('creates an Admin for role "admin" and a Diner for role "diner"', () => {
    expect(UserFactory.create({ id: '1', name: 'A', email: 'a@x.z', role: 'admin' })).to.be.instanceOf(Admin);
    expect(UserFactory.create({ id: '2', name: 'D', email: 'd@x.z', role: 'diner' })).to.be.instanceOf(Diner);
  });

  it('throws on an unknown role', () => {
    expect(() => UserFactory.create({ role: 'wizard' })).to.throw(/unknown role/);
  });

  it('fromDocument maps a Mongoose-style doc onto the right class', () => {
    const user = UserFactory.fromDocument({ _id: 'abc', name: 'A', email: 'a@x.z', role: 'admin' });
    expect(user).to.be.instanceOf(Admin);
    expect(user.id).to.equal('abc');
  });
});

describe('Singleton pattern (Logger)', () => {
  it('getInstance always returns the same instance', () => {
    const a = Logger.getInstance();
    const b = Logger.getInstance();
    expect(a).to.equal(b);
  });

  it('even `new Logger()` collapses to the single instance', () => {
    const a = Logger.getInstance();
    const b = new Logger();
    expect(b).to.equal(a);
  });

  it('records entries on the shared buffer', () => {
    const log = Logger.getInstance();
    log.clear();
    log.audit('test event', { x: 1 });
    expect(log.entries).to.have.lengthOf(1);
    expect(log.entries[0]).to.include({ level: 'audit', message: 'test event' });
  });
});

describe('Strategy pattern (sort strategies)', () => {
  it('returns the requested strategy and defaults to rating', () => {
    expect(getSortStrategy('rating')).to.be.instanceOf(RatingSortStrategy);
    expect(getSortStrategy('reviews').apply()).to.deep.equal({ reviewCount: -1, averageRating: -1 });
    expect(getSortStrategy('newest').apply()).to.deep.equal({ createdAt: -1 });
    // unknown -> default rating ordering
    expect(getSortStrategy('bogus').apply()).to.deep.equal({ averageRating: -1, reviewCount: -1 });
  });
});

describe('Chain of Responsibility (review validation)', () => {
  const chain = buildReviewValidationChain();

  it('passes a valid payload', () => {
    expect(chain.handle({ rating: 4, text: 'Great' })).to.deep.equal({ ok: true });
  });

  it('rejects a missing rating', () => {
    const r = chain.handle({ text: 'No rating' });
    expect(r.ok).to.equal(false);
    expect(r.status).to.equal(400);
    expect(r.message).to.match(/required/);
  });

  it('rejects an out-of-range rating', () => {
    const r = chain.handle({ rating: 9, text: 'Too high' });
    expect(r.ok).to.equal(false);
    expect(r.message).to.match(/1–5/);
  });

  it('rejects an over-length text', () => {
    const r = chain.handle({ rating: 5, text: 'x'.repeat(2001) });
    expect(r.ok).to.equal(false);
    expect(r.message).to.match(/2000/);
  });
});

describe('Observer pattern (ReviewSubject)', () => {
  afterEach(() => sinon.restore());

  it('notifies every subscribed observer', async () => {
    const subject = new ReviewSubject();
    const o1 = { update: sinon.spy() };
    const o2 = { update: sinon.spy() };
    subject.subscribe(o1).subscribe(o2);

    await subject.notify({ type: 'created', restaurantId: 'r1', reviewId: 'rev1' });

    expect(o1.update.calledOnce).to.equal(true);
    expect(o2.update.calledOnce).to.equal(true);
  });

  it('AggregateObserver recomputes via aggregate + findByIdAndUpdate', async () => {
    sinon.stub(Review, 'aggregate').resolves([{ _id: 'r1', average: 4.5, count: 2 }]);
    const upd = sinon.stub(Restaurant, 'findByIdAndUpdate').resolves({});

    await new AggregateObserver().update({ restaurantId: '507f191e810c19729de860ea' });

    expect(upd.calledOnce).to.equal(true);
    expect(upd.firstCall.args[1]).to.include({ averageRating: 4.5, reviewCount: 2 });
  });
});

describe('Proxy pattern (RestaurantServiceProxy)', () => {
  afterEach(() => sinon.restore());

  it('an Admin is allowed through to the real service', async () => {
    const real = new RestaurantService();
    sinon.stub(real, 'create').resolves({ _id: 'r99', name: 'New' });
    const admin = UserFactory.create({ id: 'a1', name: 'Ada', email: 'a@x.z', role: 'admin' });
    const proxy = new RestaurantServiceProxy(admin, real);

    const result = await proxy.create({ name: 'New' });
    expect(result).to.deep.equal({ _id: 'r99', name: 'New' });
    expect(real.create.calledOnce).to.equal(true);
  });

  it('a Diner is denied and the real service is never called', async () => {
    const real = new RestaurantService();
    const spy = sinon.stub(real, 'create').resolves({});
    const diner = UserFactory.create({ id: 'd1', name: 'Dee', email: 'd@x.z', role: 'diner' });
    const proxy = new RestaurantServiceProxy(diner, real);

    let error;
    try {
      await proxy.create({ name: 'Nope' });
    } catch (e) {
      error = e;
    }
    expect(error).to.be.instanceOf(AccessDeniedError);
    expect(spy.called).to.equal(false);
  });
});

describe('Facade pattern (ModerationFacade)', () => {
  afterEach(() => sinon.restore());

  it('respond() rejects empty text and updates a review otherwise', async () => {
    const facade = new ModerationFacade();
    const empty = await facade.respond('rev1', '   ');
    expect(empty.ok).to.equal(false);
    expect(empty.status).to.equal(400);

    sinon.stub(Review, 'findByIdAndUpdate').resolves({ _id: 'rev1', ownerResponse: 'Thanks' });
    const ok = await facade.respond('rev1', 'Thanks');
    expect(ok.ok).to.equal(true);
    expect(ok.review).to.have.property('ownerResponse', 'Thanks');
  });

  it('respond() returns 404 when the review does not exist', async () => {
    sinon.stub(Review, 'findByIdAndUpdate').resolves(null);
    const facade = new ModerationFacade();
    const r = await facade.respond('missing', 'Hello');
    expect(r.ok).to.equal(false);
    expect(r.status).to.equal(404);
  });
});
