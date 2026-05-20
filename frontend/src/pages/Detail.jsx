// frontend/src/pages/Detail.jsx
// Screen 2 - Restaurant Detail. Diner-facing single-restaurant view with reviews list.
// Wires to GET /api/restaurants/:slug and GET /api/restaurants/:id/reviews.
//
// Maps to SysML R010 (View Restaurant Detail), R007 (Browse Restaurants - drill-down).

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/mesa/Navbar';
import Footer from '../components/mesa/Footer';
import StarRating from '../components/mesa/StarRating';

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function Detail() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const restRes = await axios.get(`${API_BASE}/api/restaurants/${slug}`);
        if (cancelled) return;
        setRestaurant(restRes.data);

        const reviewRes = await axios.get(`${API_BASE}/api/restaurants/${restRes.data._id}/reviews`);
        if (cancelled) return;
        const data = reviewRes.data;
        setReviews(Array.isArray(data) ? data : (data.items || []));
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load restaurant');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar activeLink="browse" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading restaurant...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar activeLink="browse" />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-muted-foreground text-center">{error || 'Restaurant not found.'}</p>
          <Link to="/" className="text-primary underline font-semibold">
            Back to browse
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activeLink="browse" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <Link to="/" className="inline-block text-muted-foreground hover:text-primary mb-4 text-sm">
          &larr; Back to browse
        </Link>

        {restaurant.imageUrl && (
          <div className="w-full h-72 md:h-96 rounded-lg overflow-hidden mb-6 bg-card">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <section className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{restaurant.name}</h1>
              <p className="text-muted-foreground">
                {restaurant.cuisine} &middot; {restaurant.location}
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <StarRating
                rating={restaurant.averageRating || 0}
                size="md"
                showValue={(restaurant.averageRating || 0) > 0}
                reviewCount={restaurant.reviewCount || 0}
              />
            </div>
          </div>
          {restaurant.description && (
            <p className="text-foreground leading-relaxed mt-4">{restaurant.description}</p>
          )}
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
            <Link
              to={`/restaurants/${restaurant.slug}/review`}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition font-semibold"
            >
              Write a Review
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to write one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <article
                  key={r._id}
                  className="bg-card border border-border rounded-lg p-5"
                >
                  <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <StarRating rating={r.rating} size="sm" />
                      <span className="font-semibold text-foreground">
                        {r.authorName || (r.userId && r.userId.name) || 'Diner'}
                      </span>
                    </div>
                    {r.createdAt && (
                      <time className="text-sm text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('en-AU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                  </header>
                  <p className="text-foreground leading-relaxed">{r.text}</p>
                  {r.ownerResponse && (
                    <div className="mt-4 ml-4 p-4 bg-background border-l-4 border-primary rounded">
                      <p className="text-sm font-semibold text-primary mb-1">Owner Response</p>
                      <p className="text-foreground">{r.ownerResponse}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}