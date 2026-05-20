// Screen 4 - Diner Dashboard. Lists the logged-in user's reviews with edit + delete actions.
// Wires to GET /api/reviews/me (populates restaurantId with name/slug/imageUrl) and
// DELETE /api/reviews/:id. Edit navigates to /restaurants/:slug/review?edit=<reviewId>,
// which ReviewForm picks up and switches to PATCH mode.
//
// Maps to SysML R011 (Manage Reviews), R014 (Edit Review), R015 (Delete Review).

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/mesa/Navbar';
import Footer from '../components/mesa/Footer';
import StarRating from '../components/mesa/StarRating';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get('/api/reviews/me');
        if (!cancelled) setReviews(res.data || []);
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

  async function handleDelete(reviewId, restaurantName) {
    const confirmed = window.confirm(
      `Delete your review for ${restaurantName}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(reviewId);
      await axiosInstance.delete(`/api/reviews/${reviewId}`);
      // Remove the deleted review from local state without a full refetch.
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(review) {
    const slug = review.restaurantId?.slug;
    if (!slug) {
      alert('Cannot edit: restaurant link is missing.');
      return;
    }
    navigate(`/restaurants/${slug}/review?edit=${review._id}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activeLink="my-reviews" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">My Reviews</h1>
          {user && (
            <p className="text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{user.name}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading your reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-3">You haven't written any reviews yet.</p>
            <Link
              to="/"
              className="inline-block px-5 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const r_name = r.restaurantId?.name || 'Unknown restaurant';
              const r_slug = r.restaurantId?.slug;
              const r_image = r.restaurantId?.imageUrl;
              return (
                <article
                  key={r._id}
                  className="bg-card border border-border rounded-lg p-5"
                >
                  <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex items-start gap-4">
                      {r_image && (
                        <img
                          src={r_image}
                          alt={r_name}
                          className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div>
                        {r_slug ? (
                          <Link
                            to={`/restaurants/${r_slug}`}
                            className="text-lg font-semibold text-foreground hover:text-primary transition"
                          >
                            {r_name}
                          </Link>
                        ) : (
                          <span className="text-lg font-semibold text-foreground">{r_name}</span>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <StarRating rating={r.rating} size="sm" />
                          <time className="text-sm text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString('en-AU', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </header>

                  <p className="text-foreground leading-relaxed mb-4">{r.text}</p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(r)}
                      disabled={deletingId === r._id}
                      className="px-4 py-2 border border-border text-foreground rounded-md font-semibold hover:bg-muted transition disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r._id, r_name)}
                      disabled={deletingId === r._id}
                      className="px-4 py-2 border border-destructive text-destructive rounded-md font-semibold hover:bg-destructive/10 transition disabled:opacity-50"
                    >
                      {deletingId === r._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
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