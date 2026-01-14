import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { profileAPI } from "../api/profileApi";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [profileExists, setProfileExists] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated) {
        setCheckingProfile(false);
        return;
      }

      try {
        const response = await profileAPI.checkExists();
        setProfileExists(response.data);
      } catch (error) {
        console.error("Failed to check profile:", error);
        setProfileExists(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [isAuthenticated]);

  if (loading || checkingProfile) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If profile doesn't exist and user is not on profile-setup page, redirect to profile setup
  if (profileExists === false && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
