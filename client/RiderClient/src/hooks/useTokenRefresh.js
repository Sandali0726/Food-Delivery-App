import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken } from '../api/auth';
import { logoutSuccess } from '../features/auth/authSlice';

export const useTokenRefresh = () => {
    const dispatch = useDispatch();
    const { rider } = useSelector((state) => state.auth);

    const performTokenRefresh = useCallback(async () => {
        try {
            const response = await refreshToken();
            if (response.status === 200) {
                console.log('Token refreshed successfully');
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout user
            dispatch(logoutSuccess());
            return false;
        }
    }, [dispatch]);

    // Set up periodic token refresh (optional)
    useEffect(() => {
        if (!rider) return;

        // Refresh token every 10 minutes (600,000 ms)
        // This is more frequent than the 15-minute access token expiry
        const refreshInterval = setInterval(() => {
            performTokenRefresh();
        }, 10 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [rider, performTokenRefresh]);

    return { performTokenRefresh };
};