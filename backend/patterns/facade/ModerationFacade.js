// backend/patterns/facade/ModerationFacade.js
//
// PATTERN: Facade.
// WHY: The admin moderation workflow touches several subsystems — the Review
// model, the Restaurant aggregate recompute (Observer), and the audit Logger.
// The Facade hides that complexity behind three plain methods so the
// controller reads like the business intent ("list, remove, respond") rather
// than orchestration detail.
//
// JUSTIFICATION: if moderation later needs extra steps (notify the author,
// flag the account), they go inside the facade and every caller benefits with
// no controller changes. The controller depends on one clean interface.

const Review = require('../../models/Review');
const Logger = require('../singleton/Logger');
const { reviewSubject } = require('../observer/ReviewSubject');

class ModerationFacade {
  // Paginated list of every review with author + restaurant populated.
  async listAllReviews({ page = 1, limit = 50 } = {}) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Review.find({})
        .populate('restaurantId', 'name slug')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Review.countDocuments({}),
    ]);

    return {
      items,
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  // Remove a review as a moderator, then recompute the restaurant aggregate
  // (delegated to the Observer subject) and audit the action.
  async removeReview(reviewId, actorId) {
    const review = await Review.findById(reviewId);
    if (!review) return { ok: false, status: 404, message: 'Review not found' };

    const restaurantId = review.restaurantId;
    await review.deleteOne();
    await reviewSubject.notify({ type: 'deleted', restaurantId, reviewId, actorId });
    Logger.getInstance().audit('moderator removed review', { reviewId, actorId });
    return { ok: true, id: reviewId };
  }

  // Attach an owner/admin response to a review.
  async respond(reviewId, responseText) {
    if (!responseText || !responseText.trim()) {
      return { ok: false, status: 400, message: 'response text is required' };
    }
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { ownerResponse: responseText.trim(), ownerResponseAt: new Date() },
      { new: true }
    );
    if (!review) return { ok: false, status: 404, message: 'Review not found' };
    return { ok: true, review };
  }
}

module.exports = ModerationFacade;
