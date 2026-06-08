// backend/repositories/BaseRepository.js
// DESIGN PATTERN: Repository (structural / data-access).
// Abstracts persistence behind a stable interface so the service layer never
// talks to Mongoose directly. Concrete repositories inherit the shared CRUD
// implementation and may add domain-specific queries.
//
// OOP principles demonstrated:
//   - Abstraction: the rest of the app depends on this interface, not on Mongoose.
//   - Inheritance: RestaurantRepository/ReviewRepository/etc. extend this class.
//   - Encapsulation: the underlying model (#model) is private; subclasses use
//     the protected accessor model().
//   - Polymorphism: every repository is substitutable wherever a BaseRepository
//     is expected (used by the LoggingRepositoryDecorator and the services).

class BaseRepository {
  #model;

  constructor(model) {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository is abstract and cannot be instantiated directly');
    }
    if (!model) {
      throw new Error('A Mongoose model must be supplied to the repository');
    }
    this.#model = model;
  }

  // Protected accessor for subclasses that need the raw model (e.g. aggregations).
  get model() {
    return this.#model;
  }

  async findById(id) {
    return this.#model.findById(id);
  }

  async findOne(filter = {}) {
    return this.#model.findOne(filter);
  }

  // Flexible read that supports populate/sort/skip/limit while preserving the
  // exact Mongoose call chain (find().sort().skip().limit()) the rest of the
  // codebase relies on.
  async find(filter = {}, opts = {}) {
    let query = this.#model.find(filter);
    if (opts.populate) {
      for (const p of [].concat(opts.populate)) {
        query = query.populate(p.path, p.select);
      }
    }
    if (opts.sort) query = query.sort(opts.sort);
    if (opts.skip !== undefined) query = query.skip(opts.skip);
    if (opts.limit !== undefined) query = query.limit(opts.limit);
    return query;
  }

  async count(filter = {}) {
    return this.#model.countDocuments(filter);
  }

  async create(data) {
    return this.#model.create(data);
  }

  async updateById(id, patch, options = { new: true, runValidators: true }) {
    return this.#model.findByIdAndUpdate(id, patch, options);
  }

  async deleteById(id) {
    return this.#model.findByIdAndDelete(id);
  }

  async deleteMany(filter = {}) {
    return this.#model.deleteMany(filter);
  }
}

module.exports = BaseRepository;
