// frontend/src/pages/ReviewForm.jsx
// Screen 3 - Review Form. Authenticated diner submits a rating + text for a restaurant.
// Wires to POST /api/restaurants/:id/reviews with a JWT bearer token.
//
// TEMPORARY AUTH NOTE: this branch logs in as diner@mesa.test on submit so the diner
// happy path works end-to-end before the proper Login UI ships in feature/frontend-login.
// When that lands, replace loginAsTestDiner() with the token from useAuth().
//
// Maps to SysML R012 (Create Review), R013 (Submit Review).

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/mesa/Navbar';
import Footer from '../components/mesa/Footer';
import StarRating from '../components/mesa/StarRating';

const API_BASE = process.env.REACT_APP_API_URL || '';

// TEMPORARY: replaces proper auth flow until feature/frontend-login lands.
async function loginAsTestDiner() {
  // eslint-disable-next-line no-console
  console.warn('[ReviewForm] Using temporary test-diner login. Replace with useAuth() once Login UI ships.');
  const res = await axios.post(`${API_BASE}/api/auth/login`, {
    email: 'diner@mesa.test',
    password: 'diner1234',
  });
  return res.data.token;
}

export default function ReviewForm() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch restaurant on mount so we can show context + get _id for POST.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE}/api/restaurants/${slug}`);
        if (!cancelled) setRestaurant(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Restaurant not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

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

      const token = await loginAsTestDiner();

      await axios.post(
        `${API_BASE}/api/restaurants/${restaurant._id}/reviews`,
        { rating, text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Success - return to detail page where the new review now appears.
      navigate(`/restaurants/${slug}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review');
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
      <Navbar activeLink="browse" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <Link
          to={`/restaurants/${slug}`}
          className="inline-block text-muted-foreground hover:text-primary mb-4 text-sm"
        >
          &larr; Back to {restaurant.name}
        </Link>

        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">Write a Review</h1>
          <p className="text-muted-foreground mb-6">
            for {restaurant.name} &middot; {restaurant.cuisine}
          </p>

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
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <Link
                to={`/restaurants/${slug}`}
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