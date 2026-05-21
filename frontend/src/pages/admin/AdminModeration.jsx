// frontend/src/pages/admin/AdminModeration.jsx
// Screen 7 - Admin Review Moderation. Lists every review across all restaurants
// with author, restaurant, rating, text, date and a Delete action.
// Restricted to authenticated admins via ProtectedRoute requireAdmin.
//
// Wires to GET /api/reviews?limit=100 (admin-only) and DELETE /api/reviews/:id
// (admin OR author - the deleteReview controller checks both).
//
// Maps to SysML R024 (Moderate Content), R025 (Remove Inappropriate Review).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/mesa/AdminNavbar';
import Footer from '../../components/mesa/Footer';
import StarRating from '../../components/mesa/StarRating';

export default function AdminModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get('/api/reviews?limit=100');
        if (!cancelled) setReviews(res.data.items || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load reviews');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(review) {
    const restaurantName = review.restaurantId?.name || 'this restaurant';
    const authorName = review.userId?.name || 'a user';
    const confirmed = window.confirm(
      `Remove this ${review.rating}-star review by ${authorName} on ${restaurantName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(review._id);
      await axiosInstance.delete(`/api/reviews/${review._id}`);
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavbar activeLink="reviews" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">Review Moderation</h1>
          <p className="text-muted-foreground">
            All reviews across the platform. {reviews.length} total.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No reviews on the platform yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const restaurantName = r.restaurantId?.name || '(deleted restaurant)';
              const restaurantSlug = r.restaurantId?.slug;
              const authorName = r.userId?.name || '(deleted user)';
              const authorEmail = r.userId?.email;
              return (
                <article
                  key={r._id}
                  className="bg-card border border-border rounded-lg p-5"
                >
                  <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {restaurantSlug ? (
                          <Link
                            to={`/restaurants/${restaurantSlug}`}
                            className="text-lg font-semibold text-foreground hover:text-primary transition"
                          >
                            {restaurantName}
                          </Link>
                        ) : (
                          <span className="text-lg font-semibold text-foreground">{restaurantName}</span>
                        )}
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by <span className="font-semibold text-foreground">{authorName}</span>
                        {authorEmail && <> &middot; {authorEmail}</>}
                        {' '}&middot;{' '}
                        {new Date(r.createdAt).toLocaleDateString('en-AU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(r)}
                      disabled={deletingId === r._id}
                      className="px-3 py-1.5 border border-destructive text-destructive rounded-md text-sm font-semibold hover:bg-destructive/10 transition disabled:opacity-50 self-start"
                    >
                      {deletingId === r._id ? 'Removing...' : 'Remove'}
                    </button>
                  </header>

                  <p className="text-foreground leading-relaxed">{r.text}</p>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}