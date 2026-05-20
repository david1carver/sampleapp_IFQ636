// frontend/src/components/mesa/AdminNavbar.jsx
// Ported from mesa-app/components/mesa/admin-navbar.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

function cn(...c) {
  return c.filter(Boolean).join(' ');
}

export default function AdminNavbar({ activeLink }) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/admin/restaurants', label: 'Restaurants', key: 'restaurants' },
    { to: '/admin/reviews', label: 'Reviews', key: 'reviews' },
    { to: '/admin/users', label: 'Users', key: 'users' },
    { to: '/logout', label: 'Logout', key: 'logout' },
  ];

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
          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-10">
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
        </div>
      </div>
    </nav>
  );
}
