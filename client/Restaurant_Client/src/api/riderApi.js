import api from './axios';

export const fetchRiderByEmail = (email) => {
  if (!email) {
    return Promise.reject(new Error('Rider email is required'));
  }
  return api.get(`/api/riders/${encodeURIComponent(email)}`);
};
