import api from "./axios";

// Food items API for the authenticated restaurant
// Backend infers restaurant from session; we just send dto fields.

export const foodAPI = {
  // Create new food item
  createFood: (data) => api.post("/api/foods", data),

  // List food items for current restaurant with pagination
  getFoods: (page = 0, size = 20) =>
    api.get("/api/foods", {
      params: { page, size },
    }),

  // Fetch a food item's image URL
  getFoodImage: (id) =>
    api.get("/api/foods/image", {
      params: { id },
    }),

  // Update existing food item
  updateFood: (id, data) => api.put(`/api/foods/${id}`, data),

  // Delete food item
  deleteFood: (id) => api.delete(`/api/foods/${id}`),
};

export default foodAPI;
