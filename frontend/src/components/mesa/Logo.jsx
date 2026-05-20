// frontend/src/components/mesa/Logo.jsx
// Ported from mesa-app/components/mesa/logo.tsx — next/link → react-router-dom Link, TS removed.

import { Link } from 'react-router-dom';

const SIZE_CLASSES = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export default function Logo({ size = 'md', linkTo = '/' }) {
  const content = (
    <span className={`font-serif font-bold ${SIZE_CLASSES[size]}`}>
      Mesa<span className="text-primary">.</span>
    </span>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
