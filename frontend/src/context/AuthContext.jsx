// frontend/src/context/AuthContext.jsx
// Re-export shim. The real AuthContext implementation lives in index.js to guarantee
// a single module instance. This file exists so every component can keep its
// `import { useAuth } from '../context/AuthContext'` line unchanged.

export { useAuth, AuthProvider } from '../index';