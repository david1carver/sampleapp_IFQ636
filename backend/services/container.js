// backend/services/container.js
// Composition root. Instantiates the single set of repositories (each wrapped
// by the logging Decorator) and wires the Observer subject to its observers.
// Services import the shared instances from here, keeping object construction in
// one place (a lightweight dependency-injection container).

const RestaurantRepository = require('../repositories/RestaurantRepository');
const ReviewRepository = require('../repositories/ReviewRepository');
const UserRepository = require('../repositories/UserRepository');
const NotificationRepository = require('../repositories/NotificationRepository');
const LoggingRepositoryDecorator = require('../repositories/decorators/LoggingRepositoryDecorator');

const { ReviewSubject } = require('../events/ReviewSubject');
const RatingRecalculationObserver = require('../events/observers/RatingRecalculationObserver');
const NotificationObserver = require('../events/observers/NotificationObserver');
const AuditLogObserver = require('../events/observers/AuditLogObserver');

// Repositories — concrete repos decorated transparently with logging.
const restaurantRepo = new LoggingRepositoryDecorator(new RestaurantRepository(), 'RestaurantRepository');
const reviewRepo = new LoggingRepositoryDecorator(new ReviewRepository(), 'ReviewRepository');
const userRepo = new LoggingRepositoryDecorator(new UserRepository(), 'UserRepository');
const notificationRepo = new LoggingRepositoryDecorator(new NotificationRepository(), 'NotificationRepository');

// Observer wiring — attach the three observers to the review subject.
const reviewSubject = new ReviewSubject();
reviewSubject
  .subscribe(new RatingRecalculationObserver(reviewRepo, restaurantRepo)) // critical: data integrity
  .subscribe(new NotificationObserver(notificationRepo)) // non-critical: notifications
  .subscribe(new AuditLogObserver()); // cross-cutting: audit trail

module.exports = {
  restaurantRepo,
  reviewRepo,
  userRepo,
  notificationRepo,
  reviewSubject,
};
