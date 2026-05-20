// React Router entry point for the Restaurant Review Platform.
// Wraps the entire app in AuthProvider so any descendant component can call useAuth().
// /restaurants/:slug/review and /my-reviews are gated by ProtectedRoute - unauthenticated
// users get bounced to /login with the original path preserved in the ?next= query.

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
import ReviewForm from './pages/ReviewForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public diner-facing routes */}
          <Route path="/" element={<Browse />} />
          <Route path="/restaurants/:slug" element={<Detail />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes - require auth */}
          <Route
            path="/restaurants/:slug/review"
            element={
              <ProtectedRoute>
                <ReviewForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reviews"
            element={
              <ProtectedRoute>
                <Navigate to="/" replace />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;