// Mesa-styled login screen. POSTs to /api/auth/login via axiosInstance,
// stores the returned user + JWT in AuthContext (which persists to localStorage),
// then redirects to ?next= if provided, otherwise to /.
//
// Maps to SysML R003 (Login), R002 (Authentication Process).

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Navbar from '../components/mesa/Navbar';
import Footer from '../components/mesa/Footer';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const res = await axiosInstance.post('/api/auth/login', formData);
      login(res.data);
      navigate(decodeURIComponent(next), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activeLink="login" />

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-6">Log in to write reviews and manage your account.</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            New to Mesa?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}