import { useEffect } from 'react';
import { RouterProvider } from "react-router-dom";
import { useDispatch } from 'react-redux';
import AppRoute from './routes/AppRoute.jsx';
import { setInitialized } from './features/authSlice.js';
import { checkAuth } from './api/authApi.js';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const validateSession = async () => {
      try {
        await checkAuth();
        dispatch(setInitialized(true));
      } catch (error) {
        // If 401, try refresh and then check again
        if (error?.response?.status === 401) {
          try {
            const { refreshSession } = await import('./api/axios');
            await refreshSession();
            await checkAuth();
            dispatch(setInitialized(true));
            return;
          } catch (refreshError) {
            // If refresh fails, fall through to set false
          }
        }
        console.log('Session invalid:', error?.response?.status);
        dispatch(setInitialized(false));
      }
    };

    validateSession();
  }, [dispatch]);

  return <RouterProvider router={AppRoute} />;
}

export default App
