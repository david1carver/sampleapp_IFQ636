// React Router entry point for the Restaurant Review Platform.
// AuthProvider is mounted one level up in index.js (wraps the whole app), so
// any component in the route tree can call useAuth() to read user + JWT state.
// /restaurants/:slug/review, /my-reviews and /profile are gated by ProtectedRoute -
// unauthenticated users get bounced to /login with the original path preserved in ?next=.

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
import ReviewForm from './pages/ReviewForm';
import MyReviews from './pages/MyReviews';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
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
          path="/my-reviews"
          element={
            <ProtectedRoute>
              <MyReviews />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;