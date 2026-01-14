import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";

import Landing from "../pages/Landing.jsx";
import Login from "../pages/auth/login.jsx";
import Register from "../pages/auth/register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import Dashboard from "../pages/dashbord.jsx";
import Profile from "../pages/profile.jsx";
import DeliveryHistory from "../pages/DeliveryHistory.jsx";
import Map from "../pages/auth/map.jsx";
import DeliveryMap from "../components/DeliveryMap.jsx";
import OrderProgress from "../pages/OrderProgress.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/map", element:<Map /> },
  

  {
    element: <ProtectedRoute />,
    children: [
      { path: "/profile", element: <Profile /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/history", element: <DeliveryHistory /> },
      { path: "/delivery-map", element: <DeliveryMap /> },
      { path: "/order-progress/:orderId", element: <OrderProgress /> },
    ],
  },
]);

export default router;
