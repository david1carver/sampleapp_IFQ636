// backend/patterns/chain/ReviewValidation.js
//
// PATTERN: Chain of Responsibility.
// WHY: Validating review input is a sequence of independent checks (rating
// present & in range, text present, text not too long). Each check is a
// handler that either rejects the request or passes it to the next handler.
// This mirrors how request middleware pipelines work and keeps each rule
// small and single-purpose.
//
// JUSTIFICATION: rules can be reordered, inserted, or removed by changing the
// chain wiring — not by editing one tangled if-block. Each handler is unit
// testable on its own.
//
// OOP: ReviewHandler is an ABSTRACT base providing the shared setNext()/handle()
// plumbing; concrete handlers OVERRIDE check() — POLYMORPHISM.

class ReviewHandler {
  #next = null;

  setNext(handler) {
    this.#next = handler;
    return handler; // enables fluent chaining: a.setNext(b).setNext(c)
  }

  // Runs this handler's check, then delegates to the next. Returns either
  // { ok: true } or { ok: false, status, message }.
  handle(payload) {
    const result = this.check(payload);
    if (result && result.ok === false) return result; // short-circuit on failure
    if (this.#next) return this.#next.handle(payload);
    return { ok: true };
  }

  // Subclasses override. Return falsy / { ok: true } to pass, or a failure object.
  check() {
    throw new Error('ReviewHandler.check() must be implemented by a subclass');
  }
}

class RatingPresentHandler extends ReviewHandler {
  check({ rating }) {
    if (rating === undefined || rating === null) {
      return { ok: false, status: 400, message: 'rating and text are required' };
    }
    return { ok: true };
  }
}

class RatingRangeHandler extends ReviewHandler {
  check({ rating }) {
    if (rating < 1 || rating > 5) {
      return { ok: false, status: 400, message: 'rating must be 1–5' };
    }
    return { ok: true };
  }
}

class TextPresentHandler extends ReviewHandler {
  check({ text }) {
    if (!text || !String(text).trim()) {
      return { ok: false, status: 400, message: 'rating and text are required' };
    }
    return { ok: true };
  }
}

class TextLengthHandler extends ReviewHandler {
  check({ text }) {
    if (text && String(text).length > 2000) {
      return { ok: false, status: 400, message: 'text must be 2000 characters or fewer' };
    }
    return { ok: true };
  }
}

// Build the default validation chain and return its head.
function buildReviewValidationChain() {
  const ratingPresent = new RatingPresentHandler();
  const textPresent = new TextPresentHandler();
  const ratingRange = new RatingRangeHandler();
  const textLength = new TextLengthHandler();

  // Order: presence checks first (so a missing field reads "required"),
  // then range/length validity.
  ratingPresent.setNext(textPresent).setNext(ratingRange).setNext(textLength);
  return ratingPresent;
}

module.exports = {
  ReviewHandler,
  RatingPresentHandler,
  RatingRangeHandler,
  TextPresentHandler,
  TextLengthHandler,
  buildReviewValidationChain,
};
