// Mesa diner-facing top navigation. Reads auth state from AuthContext to show:
//   - Browse always
//   - My Reviews only when logged in
//   - "Hi {name}" + Logout button when logged in
//   - Login link when logged out
// Click Logout -> clears auth, redirects to /.

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

function cn(...c) {
  return c.filter(Boolean).join(' ');
}

export default function Navbar({ activeLink, showOwnerBadge = false }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  // Build links list based on auth state.
  const links = [{ to: '/', label: 'Browse', key: 'browse' }];
  if (isAuthenticated) {
    links.push({ to: '/my-reviews', label: 'My Reviews', key: 'my-reviews' });
  }
  if (isAdmin) {
    links.push({ to: '/admin/restaurants', label: 'Admin', key: 'admin' });
  }

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 h-16 bg-card transition-shadow duration-200',
        hasScrolled && 'shadow-[0_4px_12px_rgba(31,26,18,0.06)]'
      )}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        <div className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              className={cn(
                'text-[15px] font-medium transition-colors relative py-1',
                activeLink === link.key
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              )}
            >
              {link.label}
              {activeLink === link.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">
                Hi, <span className="font-semibold text-foreground">{user.name}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[15px] font-medium text-foreground hover:text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={cn(
                'text-[15px] font-medium transition-colors relative py-1',
                activeLink === 'login'
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              )}
            >
              Login
              {activeLink === 'login' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          )}

          {showOwnerBadge && (
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                Owner view
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}