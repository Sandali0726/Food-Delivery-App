import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import { loadRider } from "./features/auth/authSlice";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationContainer from "./components/NotificationContainer";

function App() {
  const dispatch = useDispatch();
  const { performTokenRefresh } = useTokenRefresh();

  useEffect(() => {
    // Check if user is authenticated on app load using stored email
    dispatch(loadRider());
    // Request browser notification permission early so OS can play sounds
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
  }, [dispatch]);

  return (
    <NotificationProvider>
      <RouterProvider router={router} />
      <NotificationContainer />
    </NotificationProvider>
  );
}

export default App;
