import api from './axios';

export const fetchDeliveryRequestById = (requestId) =>
  api.get(`/api/delivery-requests/${requestId}`);

export const fetchDeliveryRequestsByOrder = (orderId) =>
  api.get('/api/delivery-requests', { params: { orderId } });

export const fetchDeliveryRequestsByRestaurant = (restaurantEmail) =>
  api.get('/api/delivery-requests', { params: { restaurantEmail } });

export const fetchDeliveryRequestsByRestaurantPath = (restaurantEmail) =>
  api.get(`/api/delivery-requests/restaurant/${encodeURIComponent(restaurantEmail)}`);

export const fetchDeliveryRequestsForCurrentRestaurant = (options = {}) => {
  const pageValue = Number(options.page);
  const sizeValue = Number(options.size);
  const params = {
    page: Number.isFinite(pageValue) ? Math.max(0, pageValue) : 0,
    size: Number.isFinite(sizeValue) ? Math.max(1, sizeValue) : 20,
  };
  return api.get('/api/delivery-requests/restaurant', { params });
};
