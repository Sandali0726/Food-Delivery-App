import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 1000000, // Request timeout
    withCredentials: true, // Send cookies with requests
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = () => {
    refreshSubscribers.forEach(callback => callback());
    refreshSubscribers = [];
};

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Check if error is 401 (Unauthorized) and not already retried
        if (error.response?.status === 403 && !originalRequest._retry) {
            // Don't try to refresh token for login, register, or refresh endpoints
            if (originalRequest.url?.includes('/auth/login') || 
                originalRequest.url?.includes('/auth/register') ||
                originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }
            
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => {
                        resolve(api(originalRequest));
                    });
                });
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                // Attempt to refresh token
                const response = await api.post('/auth/refresh');
                
                if (response.status === 200) {
                    // Token refreshed successfully
                    isRefreshing = false;
                    onTokenRefreshed();
                    
                    // Retry original request
                    return api(originalRequest);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                isRefreshing = false;
                refreshSubscribers = [];
                
                // Clear any stored auth data
                localStorage.removeItem('rider');
                
                // Redirect to login page
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// Manual token refresh utility
export const refreshTokenManually = async () => {
    try {
        const response = await api.post('/auth/refresh');
        return response.status === 200;
    } catch (error) {
        console.error('Manual token refresh failed:', error);
        return false;
    }
};

export default api;