// frontend/src/pages/admin/AdminRestaurants.jsx
// Screen 5 - Admin Restaurant Management. Lists all restaurants in a table with
// thumbnails, rating + review count, location, and a Delete action.
// Wires to GET /api/restaurants (public list endpoint, but exposed in an admin context
// for the moderation workflow) and DELETE /api/restaurants/:id (admin-only).
//
// Create / Edit forms are scoped for a later patch (feature/frontend-admin-form).
//
// Maps to SysML R020 (Create Restaurant), R021 (Update Restaurant), R022 (Delete Restaurant).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/mesa/AdminNavbar';
import Footer from '../../components/mesa/Footer';
import StarRating from '../../components/mesa/StarRating';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
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
        const res = await axiosInstance.get('/api/restaurants?limit=50');
        if (!cancelled) setRestaurants(res.data.items || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load restaurants');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(restaurant) {
    const confirmed = window.confirm(
      `Delete "${restaurant.name}"? This will also remove all reviews on this restaurant. This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(restaurant._id);
      await axiosInstance.delete(`/api/restaurants/${restaurant._id}`);
      setRestaurants((prev) => prev.filter((r) => r._id !== restaurant._id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete restaurant');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavbar activeLink="restaurants" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Restaurants</h1>
            <p className="text-muted-foreground">
              Manage the restaurant catalogue. {restaurants.length} total.
            </p>
          </div>
          {/* Future: <Link to="/admin/restaurants/new"> add restaurant </Link> */}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No restaurants in the catalogue.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left text-sm font-semibold text-foreground px-4 py-3">Restaurant</th>
                  <th className="text-left text-sm font-semibold text-foreground px-4 py-3">Cuisine</th>
                  <th className="text-left text-sm font-semibold text-foreground px-4 py-3">Location</th>
                  <th className="text-left text-sm font-semibold text-foreground px-4 py-3">Rating</th>
                  <th className="text-right text-sm font-semibold text-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r._id} className="border-b border-border last:border-b-0 hover:bg-background/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.imageUrl && (
                          <img
                            src={r.imageUrl}
                            alt={r.name}
                            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <Link
                            to={`/restaurants/${r.slug}`}
                            className="font-semibold text-foreground hover:text-primary transition"
                          >
                            {r.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">/{r.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{r.cuisine}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.averageRating} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          ({r.reviewCount || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        disabled={deletingId === r._id}
                        className="px-3 py-1.5 border border-destructive text-destructive rounded-md text-sm font-semibold hover:bg-destructive/10 transition disabled:opacity-50"
                      >
                        {deletingId === r._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}