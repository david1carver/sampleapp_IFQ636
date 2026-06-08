# A2 Step 3 — Implementation: Design Patterns & OOP

## 3.1 Design pattern selection matrix

Eight patterns were applied (the rubric's HD band requires seven). Each is used
for a real purpose in the backend and is covered by unit tests (see
`functional-test-cases.md`, TC-P-01…TC-P-16).

| # | Pattern | Type | File(s) | Problem it solves (example usage) | Test |
|---|---|---|---|---|---|
| 1 | **Singleton** | Creational | `core/Logger.js`, `core/Database.js` | Guarantee one shared logger and one Mongoose connection process-wide; prevent connection storms | TC-P-01/02 |
| 2 | **Factory Method** | Creational | `factories/NotificationFactory.js` | Build notification payloads by intent (`reviewCreated`, `ownerResponse`, `reviewRemoved`) instead of hand-assembling fields | TC-P-05/06 |
| 3 | **Builder** | Creational | `builders/RestaurantQueryBuilder.js` | Assemble the optional filter + sort + pagination for restaurant search fluently | TC-P-07/08 |
| 4 | **Repository** | Structural | `repositories/BaseRepository.js` + Restaurant/Review/User/Notification repos | Abstract persistence so services never touch Mongoose directly; storage is swappable | TC-P-03/04 |
| 5 | **Decorator** | Structural | `repositories/decorators/LoggingRepositoryDecorator.js` | Add timing/logging around any repository transparently, without editing it | TC-P-11/12 |
| 6 | **Facade** | Structural | `services/RestaurantService.js`, `ReviewService.js`, `AuthService.js`, `NotificationService.js` | Give controllers a single simple entry point that hides Builder/Strategy/Repository/Observer wiring | (exercised by all controller tests) |
| 7 | **Strategy** | Behavioural | `strategies/SortStrategy.js` | Interchangeable sort algorithms (Rating/Newest/Name) chosen at runtime from `?sort=` | TC-P-09/10 |
| 8 | **Observer** | Behavioural | `events/ReviewSubject.js` + `RatingRecalculationObserver`, `NotificationObserver`, `AuditLogObserver` | Fan a single review event out to rating-recompute, notification, and audit side-effects without coupling them | TC-P-13/14/15 |

**How they collaborate (one request path — create review):**
`POST /api/restaurants/:id/reviews` → `reviewController` (thin) → **Facade**
`ReviewService.create()` → **Repository** `reviewRepo.create()` (wrapped by the
logging **Decorator**) → `reviewSubject.notify()` (**Observer**) → the
Rating observer recomputes aggregates, the Notification observer uses the
**Factory Method** to build a payload and persist it, and the Audit observer
writes through the **Singleton** Logger.

---

## 3.2 Implementation using OOP principles

### Encapsulation
Internal state is hidden behind ES2022 private fields (`#`). Callers depend only
on public methods, never on internals.

```js
// core/Logger.js  (Singleton)
class Logger {
  static #instance = null;
  #buffer = [];                 // private — unreachable from outside
  constructor() {
    if (Logger.#instance) return Logger.#instance;  // enforce one instance
    Logger.#instance = this;
  }
  audit(action, meta) { return this.#write('audit', action, meta); }
}
```

```js
// repositories/BaseRepository.js  (Repository)
class BaseRepository {
  #model;                       // private model handle
  get model() { return this.#model; }   // controlled, read-only access
}
```

### Inheritance
A shared base supplies common behaviour; concrete classes specialise it.

```js
// repositories/RestaurantRepository.js
class RestaurantRepository extends BaseRepository {
  constructor() { super(Restaurant); }
  findBySlug(slug) { return this.findOne({ slug: String(slug).toLowerCase() }); }
}
```
The same pattern is used for `Observer` → `RatingRecalculationObserver` /
`NotificationObserver` / `AuditLogObserver`, `SortStrategy` → its three concrete
strategies, and `Error` → `AppError` → typed factory errors.

### Abstraction
Abstract base classes define a contract and refuse direct instantiation, so the
rest of the system depends on the interface, not the implementation.

```js
// strategies/SortStrategy.js
class SortStrategy {
  constructor() { if (new.target === SortStrategy) throw new Error('SortStrategy is abstract'); }
  toMongoSort() { throw new Error('toMongoSort() must be implemented'); }
}
```

### Polymorphism
Callers invoke a uniform method and the correct concrete behaviour runs, with no
type-checking conditionals.

```js
// builders/RestaurantQueryBuilder.js  uses whichever Strategy was resolved
withSort(sortKey) { this.#sort = resolveSortStrategy(sortKey).toMongoSort(); return this; }
```

```js
// events/ReviewSubject.js  treats every observer through the same update() call
async notify(event) {
  await Promise.all(this.#observers.map(async (o) => {
    try { await o.update(event); }                 // polymorphic dispatch
    catch (err) { logger.error('Observer failed', { observer: o.constructor.name }); }
  }));
}
```
The `LoggingRepositoryDecorator` is polymorphic too: because it exposes the same
interface as the repository it wraps (via a `Proxy`), services cannot tell the
difference between a plain repository and a decorated one (Liskov substitution).

### Open/Closed in practice
Adding a new side-effect (e.g. email or search re-indexing on a new review)
requires writing one `Observer` subclass and subscribing it in
`services/container.js` — **no change to `ReviewService` or the controllers**.
Likewise a new sort order is a new `SortStrategy` subclass; a new storage backend
is a new `BaseRepository` subclass.
