// Mesa-styled registration screen. POSTs to /api/auth/register via axiosInstance.
// On success the backend returns { id, name, email, token } - we immediately call
// AuthContext.login() with that payload so the new user lands on the site logged in,
// rather than being asked to log in again as the starter did.
//
// Maps to SysML R001 (Signup), R002 (Authentication Process).

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Navbar from '../components/mesa/Navbar';
import Footer from '../components/mesa/Footer';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const res = await axiosInstance.post('/api/auth/register', formData);
      login(res.data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activeLink="login" />

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Join Mesa</h1>
          <p className="text-muted-foreground mb-6">Create an account to write reviews and follow restaurants.</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}