import api from './axios';

export const fetchCustomerByEmail = (email) => {
  if (!email) {
    return Promise.reject(new Error('Customer email is required'));
  }
  return api.get('/api/customers', { params: { email } });
};
