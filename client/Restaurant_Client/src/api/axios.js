import axios from "axios";

// Use empty baseURL in development to leverage Vite proxy (same-origin for cookies)
// In production, use the actual API URL
const baseURL = "http://localhost:8081";

const api = axios.create({
  baseURL,
  withCredentials: true, // Ensures cookies are sent with every request
  // Give the backend a more realistic time to respond
  timeout: 10000,
});

// Dedicated client so refresh requests bypass response interceptors.
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

let refreshRequest = null;

// Shared promise so multiple callers wait on a single auth check/refresh
let ensureAuthRequest = null;

export const refreshSession = async () => {
  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post("/api/auth/refresh")
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
};

// Helper to decide
// 

 //which URLs should bypass the pre-flight auth check
const isAuthEndpoint = (url = "") => {
  return (
    url.startsWith("/api/auth/login") ||
    url.startsWith("/api/auth/register") ||
    url.startsWith("/api/auth/refresh") ||
    url.startsWith("/api/auth/check") ||
    url.startsWith("/api/auth/forgot-password") ||
    url.startsWith("/api/auth/reset-password") ||
    url.startsWith("/api/auth/verify-otp") ||
    url.startsWith("/api/auth/resend-otp")
  );
};

// Ensure that the current session is valid before sending protected requests.
// Uses cookies only; the frontend never reads tokens directly.
const ensureAuthenticated = async () => {
  if (!ensureAuthRequest) {
    ensureAuthRequest = (async () => {
      try {
        // Ask backend if current access token (in cookie) is valid
        await refreshClient.get("/api/auth/check");
        return true;
      } catch (error) {
        const status = error?.response?.status;

        // If we're unauthorized, try to refresh using the refresh-token cookie
        if (status === 401) {
          await refreshSession();
          return true;
        }

        // For network errors / timeouts, just bubble up. The calling
        // request (e.g. ProtectedRoute) can decide how to handle it.
        throw error;
      } finally {
        ensureAuthRequest = null;
      }
    })();
  }

  return ensureAuthRequest;
};

// Request interceptor: before every non-auth API call, make sure the
// authentication status is valid (or refresh using the refresh cookie).
api.interceptors.request.use(
  async (config) => {
    const url = config?.url || "";

    // Skip auth check for auth endpoints themselves
    if (!isAuthEndpoint(url)) {
      await ensureAuthenticated();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) {
      return Promise.reject(error);
    }

    const isUnauthorized = response.status === 401;
    const alreadyRetried = config?.__isRetryRequest;
    const isRefreshCall = config?.url?.includes("/api/auth/refresh");

    if (!isUnauthorized || alreadyRetried || isRefreshCall) {
      return Promise.reject(error);
    }

    try {
      await refreshSession();
      // Retry the original request - cookies will be sent automatically
      const retryConfig = { ...config, __isRetryRequest: true };
      return api(retryConfig);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
