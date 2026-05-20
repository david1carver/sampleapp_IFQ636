// Screen 3 - Review Form. Handles BOTH create (POST) and edit (PATCH) modes.
//
// Create mode (default):  /restaurants/:slug/review
//   POST /api/restaurants/:id/reviews with { rating, text }
//
// Edit mode:              /restaurants/:slug/review?edit=<reviewId>
//   GET  /api/reviews/me to find the existing review, pre-populate form
//   PATCH /api/reviews/:id with { rating, text }
//
// Maps to SysML R012 (Create Review), R013 (Submit Review), R014 (Edit Review).

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/mesa/Navbar';
import Footer from '../components/mesa/Footer';
import StarRating from '../components/mesa/StarRating';

export default function ReviewForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const editId = params.get('edit'); // undefined for create mode
  const isEditMode = !!editId;

  const [restaurant, setRestaurant] = useState(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Always need the restaurant for context (title, _id for create POST).
        const restRes = await axiosInstance.get(`/api/restaurants/${slug}`);
        if (cancelled) return;
        setRestaurant(restRes.data);

        // Edit mode: also fetch the user's reviews and find the one being edited.
        if (isEditMode) {
          const reviewsRes = await axiosInstance.get('/api/reviews/me');
          if (cancelled) return;
          const existing = (reviewsRes.data || []).find((r) => r._id === editId);
          if (existing) {
            setRating(existing.rating);
            setText(existing.text);
          } else {
            setError('Could not find that review. It may have been deleted.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug, editId, isEditMode]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (rating < 1) {
      setError('Please select a rating from 1 to 5.');
      return;
    }
    if (text.trim().length < 10) {
      setError('Please write at least 10 characters in your review.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isEditMode) {
        await axiosInstance.patch(`/api/reviews/${editId}`, {
          rating,
          text: text.trim(),
        });
      } else {
        await axiosInstance.post(
          `/api/restaurants/${restaurant._id}/reviews`,
          { rating, text: text.trim() }
        );
      }

      // Both paths redirect to the detail page where changes are visible.
      navigate(`/restaurants/${slug}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save review');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar activeLink="browse" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar activeLink="browse" />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-muted-foreground text-center">{error || 'Restaurant not found.'}</p>
          <Link to="/" className="text-primary underline font-semibold">Back to browse</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activeLink={isEditMode ? 'my-reviews' : 'browse'} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <Link
          to={isEditMode ? '/my-reviews' : `/restaurants/${slug}`}
          className="inline-block text-muted-foreground hover:text-primary mb-4 text-sm"
        >
          &larr; {isEditMode ? 'Back to My Reviews' : `Back to ${restaurant.name}`}
        </Link>

        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {isEditMode ? 'Edit Review' : 'Write a Review'}
          </h1>
          <p className="text-muted-foreground mb-2">
            for {restaurant.name} &middot; {restaurant.cuisine}
          </p>
          {user && (
            <p className="text-sm text-muted-foreground mb-6">
              Posting as <span className="font-semibold text-foreground">{user.name}</span>
            </p>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Your rating
              </label>
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Click a star to set your rating (1 = poor, 5 = excellent)
              </p>
            </div>

            <div>
              <label htmlFor="review-text" className="block text-sm font-semibold text-foreground mb-2">
                Your review
              </label>
              <textarea
                id="review-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Tell other diners what stood out. The food, the room, the service - whatever made the experience memorable."
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {text.trim().length} characters (10 minimum)
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting
                  ? (isEditMode ? 'Saving...' : 'Submitting...')
                  : (isEditMode ? 'Save Changes' : 'Submit Review')}
              </button>
              <Link
                to={isEditMode ? '/my-reviews' : `/restaurants/${slug}`}
                className="px-5 py-2 border border-border text-foreground rounded-md hover:bg-muted transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}