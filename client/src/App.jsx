import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FindRidePage from './pages/FindRidePage';
import OfferRidePage from './pages/OfferRidePage';
import RideDetailPage from './pages/RideDetailPage';
import EditRidePage from './pages/EditRidePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => (
  <AuthProvider>
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rides" element={<FindRidePage />} />
          <Route path="/rides/:id" element={<RideDetailPage />} />

          {/* Protected routes */}
          <Route
            path="/offer"
            element={
              <ProtectedRoute>
                <OfferRidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rides/:id/edit"
            element={
              <ProtectedRoute>
                <EditRidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  </AuthProvider>
);

export default App;
