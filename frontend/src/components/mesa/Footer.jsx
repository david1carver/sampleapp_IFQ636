// frontend/src/components/mesa/Footer.jsx
// Ported from mesa-app/components/mesa/footer.tsx

import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo linkTo="/" />

          <nav className="flex items-center gap-8">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              to="/guidelines"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Guidelines
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Mesa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
