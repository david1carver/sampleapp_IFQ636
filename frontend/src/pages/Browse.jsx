// frontend/src/pages/Browse.jsx
// Screen 1 â€” Browse / Landing. Diner-facing restaurant grid with search + cuisine filter + pagination.
// Wires to GET /api/restaurants on the backend.
//
// Maps to SysML R007 (Browse Restaurants), R008 (View Restaurant List), R009 (Search Restaurants).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/mesa/Navbar';
import Footer from '../components/mesa/Footer';
import StarRating from '../components/mesa/StarRating';

const API_BASE = process.env.REACT_APP_API_URL || '';

const CUISINES = [
  'All',
  'Vietnamese BBQ',
  'Japanese Italian',
  'Korean Australian',
  'Indian Levantine',
  'Modern Cantonese',
  'Wood-fired Pizza',
];

export default function Browse() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 6 };
      if (q.trim()) params.q = q.trim();
      if (cuisine && cuisine !== 'All') params.cuisine = cuisine;
      const res = await axios.get(`${API_BASE}/api/restaurants`, { params });
      setRestaurants(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on filter / page changes
  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, cuisine]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activeLink="browse" />

      {/* Hero */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-12 pb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">
          Discover great places to eat
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Honest reviews from real diners across Australia. Find your next favourite restaurant.
        </p>
      </section>

      {/* Search + Filter row */}
      <section className="max-w-7xl mx-auto w-full px-6 pb-8">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3 bg-card border border-border rounded-lg p-4"
        >
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants, cuisines, or locations..."
            className="flex-1 px-4 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={cuisine}
            onChange={(e) => {
              setCuisine(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto w-full px-6 pb-12 flex-1">
        {loading && (
          <p className="text-muted-foreground text-center py-12">Loading restaurants...</p>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-4 mb-6">
            Failed to load restaurants: {error}
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <p className="text-muted-foreground text-center py-12">
            No restaurants match those filters.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <Link
              key={r._id}
              to={`/restaurants/${r.slug}`}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-serif text-xl font-bold text-foreground mb-1">{r.name}</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  {r.cuisine} &middot; {r.location}
                </p>
                <StarRating
                  rating={r.averageRating || 0}
                  size="sm"
                  showValue
                  reviewCount={r.reviewCount || 0}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-border rounded-md text-foreground disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const n = idx + 1;
              const active = n === page;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={
                    'px-3 py-1 rounded-md ' +
                    (active
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground hover:bg-muted')
                  }
                >
                  {n}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-border rounded-md text-foreground disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

