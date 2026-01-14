import axios from 'axios';
//const API_BASE_URL = process.env.REACT_APP_CUSTOMER_URL;
const API_BASE_URL = process.env.REACT_APP_CUSTOMER_URL;
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Request interceptor to add auth token
const publicEndpoints = [
  '/customers/forgot-password',
  '/customers/verify-code',
  '/customers/reset-password',
  '/customers/login',
  '/customers/signup',
  '/promotions',
  '/files/upload',
  '/order/riderDetails'
];
api.interceptors.request.use((config) => {
  // Attach Authorization header if token exists and endpoint isn't public
  try {
    const token = localStorage.getItem('token');
    const url = config.url || '';
    const isPublic = publicEndpoints.some(prefix => url.startsWith(prefix));
    if (token && !isPublic) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (_) {
    // ignore storage access errors
  }
  return config;
});


// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
      const url = error.config?.url || '';

      const isAuthRequiredEndpoint =
          url.startsWith('/orders') ||
          url.startsWith('/addresses') ||
          url.startsWith('/profile');

      if (error.response?.status === 401 && isAuthRequiredEndpoint) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
);

// Customer API endpoints
export const customerAPI = {
  register: (data) => api.post('/customers/signup', data),
  login: (credentials) => api.post('/customers/login', credentials),
  completeProfile: (email, data) => api.put(`/customers/${encodeURIComponent(email)}/complete`, data),
  getProfile: (email) => api.get(`/customers/${encodeURIComponent(email)}`),
  updateProfile: (email, data) => api.put(`/customers/${encodeURIComponent(email)}`, data),
  sendOtp:(email) => api.put(`/customers/verify-code?email=${encodeURIComponent(email)}&code=&purpose=VERIFY_EMAIL`),
  verifyemail:(email,code,purpose) => api.post(`/customers/verify-code?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&purpose=${encodeURIComponent(purpose)}`)
};

// Auth helpers: use browser redirect for OAuth2 login
export const authAPI = {
  redirectToGoogleLogin: () => {
    window.location.href = `${API_BASE_URL.replace('/api','')}/oauth2/authorization/google`;
  }
};

// Order API endpoints
export const orderAPI = {
  getByEmail: (email) => api.get(`/order/${email}`),
  update: (id) => api.put(`/order/cancel/${id}`, { withCredentials: false }),
  create: (data) => api.post('/order/save', data),
  submitRiderReview: (data) => api.put('/customers/rider/review', data),
  getRiderDetails: (email) => api.get('/order/riderDetails', { params: { email }, withCredentials: false }),
  submitRestaurantReview: (data) => api.put('/restaurants/review', data),
  getAllRetaurantReviews : () => api.get('/restaurants/reviews'),
  getRestaurantReviewbyEmail : (email) => api.get('/restaurants/reviews/by-email', { params: { email } }),
  getRiderReviewbyOrderId: (orderId) => api.get('/customers/rider/review-by-order' , {params:{orderId}}),
  getRestaurantReviewbyOrderId: (orderId) => api.get('/restaurants/reviews/by-order' , {params:{orderId}}),

};

// Address API endpoints
export const addressAPI = {
  getByEmail: (email) => api.get(`/addresses/user/${encodeURIComponent(email)}`),
  create: (email,data) => api.post(`/addresses/user/${encodeURIComponent(email)}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
};

// File upload endpoint
export const fileAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'text'
    });
  }
};

// Password recovery API endpoints
export const passwordAPI = {
  forgotPassword: (email) => api.post(`/customers/forgot-password?email=${encodeURIComponent(email)}`),
  verifyCode: (email, code,purpose) => api.post(`/customers/verify-code?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&purpose=${encodeURIComponent(purpose)}`),
  resetPassword: (email, newPassword) => api.post(`/customers/reset-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`),
  changePassword: (email, oldPassword, newPassword) => api.post(`/customers/change-password?email=${encodeURIComponent(email)}&oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`)
};
export const ratingAPI = {
    getAverageRating: (email) => api.get(`/restaurants/reviews/avg`, { params: { email } }),
}