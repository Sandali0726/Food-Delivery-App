import api from "./axios";

export const profileAPI = {
  // Check if profile exists
  checkExists: () => api.get('/api/profile/exists'),

  // Get profile
  getProfile: () => api.get('/api/profile'),

  // Create profile
  createProfile: (profileData) => api.post('/api/profile/create', profileData),

  // Update profile
  updateProfile: (profileData) => api.put('/api/profile/update', profileData),

  // Delete profile
  deleteProfile: () => api.delete('/api/profile/delete')
};
