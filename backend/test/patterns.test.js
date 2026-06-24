// backend/test/patterns.test.js
// Unit tests that verify each design pattern in isolation. No DB connection;
// Mongoose statics are stubbed with sinon where a repository touches the model.

const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;

const logger = require('../core/Logger');
const { Logger } = require('../core/Logger');
const database = require('../core/Database');
const { Database } = require('../core/Database');

const BaseRepository = require('../repositories/BaseRepository');
const RestaurantRepository = require('../repositories/RestaurantRepository');
const LoggingRepositoryDecorator = require('../repositories/decorators/LoggingRepositoryDecorator');

const RestaurantQueryBuilder = require('../builders/RestaurantQueryBuilder');
const {
  SortStrategy,
  resolveSortStrategy,
} = require('../strategies/SortStrategy');
const NotificationFactory = require('../factories/NotificationFactory');
const { ReviewSubject } = require('../events/ReviewSubject');
const Observer = require('../events/observers/Observer');
const { AppError, NotFound } = require('../core/errors');

const Restaurant = require('../models/Restaurant');

describe('Design patterns (unit tests)', () => {
  afterEach(() => sinon.restore());

  // ---- Singleton ----
  describe('Singleton (Logger, Database)', () => {
    it('Logger: getInstance() and new Logger() return the one shared instance', () => {
      expect(Logger.getInstance()).to.equal(logger);
      expect(new Logger()).to.equal(logger);
    });

    it('Database: getInstance() and new Database() return the one shared instance', () => {
      expect(Database.getInstance()).to.equal(database);
      expect(new Database()).to.equal(database);
    });
  });

  // ---- Repository ----
  describe('Repository', () => {
    it('BaseRepository is abstract and cannot be instantiated directly', () => {
      expect(() => new BaseRepository({})).to.throw(/abstract/);
    });

    it('RestaurantRepository.findBySlug lowercases the slug and queries the model', async () => {
      const stub = sinon.stub(Restaurant, 'findOne').resolves({ slug: 'saigon-smoke' });
      const repo = new RestaurantRepository();
      const result = await repo.findBySlug('SAIGON-Smoke');
      expect(stub.calledOnceWith({ slug: 'saigon-smoke' })).to.be.true;
      expect(result).to.deep.equal({ slug: 'saigon-smoke' });
    });
  });

  // ---- Factory Method ----
  describe('Factory Method (NotificationFactory)', () => {
    it('produces a correctly shaped OWNER_RESPONSE notification', () => {
      const n = NotificationFactory.ownerResponse('u1', 'Saigon & Smoke');
      expect(n).to.include({ userId: 'u1', type: 'OWNER_RESPONSE', channel: 'inapp' });
      expect(n.message).to.match(/responded/i);
    });

    it('create() dispatches by kind and throws on unknown kind', () => {
      const n = NotificationFactory.create('SYSTEM', { userId: 'u1', message: 'hi' });
      expect(n.type).to.equal('SYSTEM');
      expect(() => NotificationFactory.create('NOPE')).to.throw(/Unknown notification kind/);
    });
  });

  // ---- Builder ----
  describe('Builder (RestaurantQueryBuilder)', () => {
    it('assembles filter, pagination, and a default rating sort', () => {
      const q = new RestaurantQueryBuilder()
        .withCuisine('Thai')
        .withMinRating(4)
        .withSearch('spicy')
        .withPagination(2, 10)
        .build();

      expect(q.filter.cuisine).to.be.instanceOf(RegExp);
      expect(q.filter.averageRating).to.deep.equal({ $gte: 4 });
      expect(q.filter.$or).to.have.length(3);
      expect(q).to.include({ page: 2, limit: 10, skip: 10 });
      expect(q.sort).to.deep.equal({ averageRating: -1, reviewCount: -1 });
    });

    it('withSort swaps in the chosen strategy sort', () => {
      const q = new RestaurantQueryBuilder().withSort('name').build();
      expect(q.sort).to.deep.equal({ name: 1 });
    });
  });

  // ---- Strategy ----
  describe('Strategy (SortStrategy)', () => {
    it('resolves the correct concrete strategy per key', () => {
      expect(resolveSortStrategy('newest').toMongoSort()).to.deep.equal({ createdAt: -1 });
      expect(resolveSortStrategy('name').toMongoSort()).to.deep.equal({ name: 1 });
      expect(resolveSortStrategy('rating').toMongoSort()).to.deep.equal({
        averageRating: -1,
        reviewCount: -1,
      });
      // Unknown key falls back to rating.
      expect(resolveSortStrategy('zzz').toMongoSort()).to.deep.equal({
        averageRating: -1,
        reviewCount: -1,
      });
    });

    it('the abstract SortStrategy cannot be instantiated', () => {
      expect(() => new SortStrategy()).to.throw(/abstract/);
    });
  });

  // ---- Decorator ----
  describe('Decorator (LoggingRepositoryDecorator)', () => {
    it('transparently forwards calls and results, and logs around them', async () => {
      const fakeRepo = {
        async create(x) {
          return { ok: x };
        },
        async findBySlug(s) {
          return s; // domain-specific method must also be forwarded
        },
      };
      const before = logger.getEntries().length;
      const decorated = new LoggingRepositoryDecorator(fakeRepo, 'FakeRepo');

      expect(await decorated.create(5)).to.deep.equal({ ok: 5 });
      expect(await decorated.findBySlug('abc')).to.equal('abc');
      expect(logger.getEntries().length).to.be.greaterThan(before);
    });

    it('re-throws (and logs) errors from the wrapped repository', async () => {
      const fakeRepo = {
        async boom() {
          throw new Error('kaboom');
        },
      };
      const decorated = new LoggingRepositoryDecorator(fakeRepo, 'FakeRepo');
      let threw = false;
      try {
        await decorated.boom();
      } catch (e) {
        threw = true;
        expect(e.message).to.equal('kaboom');
      }
      expect(threw).to.be.true;
    });
  });

  // ---- Observer ----
  describe('Observer (ReviewSubject)', () => {
    it('notifies every observer; one failing observer does not stop the others', async () => {
      const calls = [];
      const subject = new ReviewSubject();
      subject
        .subscribe({ async update() { calls.push('o1'); } })
        .subscribe({ async update() { throw new Error('boom'); } })
        .subscribe({ async update() { calls.push('o3'); } });

      await subject.notify({ type: 'TEST' });
      expect(calls).to.deep.equal(['o1', 'o3']);
    });

    it('unsubscribe removes an observer', async () => {
      const calls = [];
      const subject = new ReviewSubject();
      const obs = { async update() { calls.push('x'); } };
      subject.subscribe(obs);
      subject.unsubscribe(obs);
      await subject.notify({ type: 'TEST' });
      expect(calls).to.have.length(0);
    });

    it('the abstract Observer cannot be instantiated', () => {
      expect(() => new Observer()).to.throw(/abstract/);
    });
  });

  // ---- Typed errors (OOP inheritance) ----
  describe('Typed exceptions', () => {
    it('NotFound is an AppError carrying a 404 status code', () => {
      const err = NotFound('missing');
      expect(err).to.be.instanceOf(AppError);
      expect(err).to.be.instanceOf(Error);
      expect(err.statusCode).to.equal(404);
      expect(err.message).to.equal('missing');
    });
  });
});
