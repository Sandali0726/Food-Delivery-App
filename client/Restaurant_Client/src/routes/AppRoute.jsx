import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "../component/Login.jsx";
import SignupPage from "../component/Signup.jsx";
import OtpVerification from "../component/OtpVerification.jsx";
import LandingPage from "../pages/Landing.jsx";
import RestaurantDashboard from "../pages/Dashboard.jsx";
import Settings from "../pages/Settings.jsx";
import ProfileSetup from "../pages/ProfileSetup.jsx";
import ForgotPasswordPage from "../pages/ForgotPassword.jsx";
import OrderDetails from "../pages/OrderDetails.jsx";
import MenuPage from "../pages/Menu.jsx";
import OrdersPage from "../pages/Orders.jsx";
import DeliveryTaskList from "../pages/DeliveryTaskList.jsx";
import DeliveryTaskDetails from "../pages/DeliveryTaskDetails.jsx";
import AboutUs from "../pages/AboutUs.jsx";
import Support from "../pages/Support.jsx";
import TermsOfService from "../pages/TermsOfService.jsx";
import PrivacyPolicy from "../pages/PrivacyPolicy.jsx";

const AppRoute = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <SignupPage /> },
      { path: "/verify-otp", element: <OtpVerification /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      {path: "/", element: <LandingPage />},
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/profile-setup", element: <ProfileSetup /> },
      { 
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <RestaurantDashboard /> },
          { path: "/settings", element: <Settings /> },
          { path: "/menu", element: <MenuPage /> },
          { path: "/orders", element: <OrdersPage /> },
          { path: "/orders/:id", element: <OrderDetails /> },
          { path: "/deliver-now", element: <DeliveryTaskList /> },
          { path: "/deliver-now/:orderId", element: <DeliveryTaskDetails /> },
          { path: "/about-us", element: <AboutUs /> },
          { path: "/support", element: <Support /> },
          { path: "/terms-of-service", element: <TermsOfService /> },
          { path: "/privacy-policy", element: <PrivacyPolicy /> },
        ],
      },
    ],
  }


]);
export default AppRoute;