import api from './axios';

// Orders API
export const fetchOrders = ({ status, page = 0, size = 6 } = {}) => {
  const params = { page, size };
  if (status) params.status = status;
  return api.get('/api/orders', { params });
};

export const fetchOrderById = (id) =>
  api.get(`/api/orders/${id}`);

export const createOrder = (data) =>
  api.post('/api/orders', data);

export const updateOrderStatus = (id, status) =>
  api.patch(`/api/orders/${id}/status`, { status });

export const deleteOrder = (id) =>
  api.delete(`/api/orders/${id}`);

export const fetchOrderCount = (restaurantEmail) =>
  api.get('/api/orders/count', { params: { restaurantEmail } });

export const fetchRevenue = (restaurantEmail) =>
  api.get('/api/orders/revenue', { params: { restaurantEmail } });

// Order Items API
export const fetchOrderItems = (orderId) =>
  api.get('/api/order-items', { params: { orderId } });

export const fetchOrderItemById = (id) =>
  api.get(`/api/order-items/${id}`);

export const createOrderItem = (data) =>
  api.post('/api/order-items', data);

export const deleteOrderItem = (id) =>
  api.delete(`/api/order-items/${id}`);
