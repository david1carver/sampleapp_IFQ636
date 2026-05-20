// frontend/src/App.js
// React Router entry point for the Restaurant Review Platform.
// Each page renders its own Mesa Navbar + Footer, so App.js only handles routing.

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
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

        {/* Auth routes (starter pages, will be restyled on Day 3) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />

        {/* Placeholder routes - pages added on Day 3 */}
        <Route path="/my-reviews" element={<Navigate to="/login" replace />} />
        <Route path="/restaurants/:slug/review" element={<Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;