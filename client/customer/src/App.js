import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import RestaurantPage from './pages/Resturant/RestaurantPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import VerifyCodePage from './pages/Auth/VerifyCodePage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import ChangePasswordPage from './pages/Auth/ChangePasswordPage';
import SignUpPage from './pages/Auth/SignUpPage';
import LoginPage from './pages/Auth/LoginPage';
import OrdersPage from './pages/Order/OrdersPage';
import OrderDetailsPage from './pages/Order/OrderDetailsPage';
import AddressPage from './pages/Location/AddressPage';
import ProfileCompletePage from './pages/Auth/ProfileCompletePage';
import ProfilePage from './pages/Auth/profilePage';
import OAuth2CallbackPage from './pages/Auth/OAuth2CallbackPage';
import SetOnMap from "./pages/Location/SetOnMap";
import SearchAddressPage from './pages/Location/SearchAddressPage';
import SavedAddressesPage from './pages/Location/SavedAddressesPage';
import CheckoutPage from './pages/Order/CheckoutPage';
import ReviewPage from "./pages/Resturant/ReviewPage";
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/restaurant/:id/reviews" element={<ReviewPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Protected Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/location"
          element={
            <ProtectedRoute>
              <AddressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <ProfileCompletePage />
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
        <Route
          path="/set-on-map"
          element={
            <ProtectedRoute>
              <SetOnMap/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search-address"
          element={
            <ProtectedRoute>
              <SearchAddressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-addresses"
          element={
            <ProtectedRoute>
              <SavedAddressesPage />
            </ProtectedRoute>
          }
        />
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
