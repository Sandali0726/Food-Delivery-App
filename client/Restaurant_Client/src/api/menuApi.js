import api from "./axios";

// Menu category API for a restaurant
// Backend expects restaurant email from the authenticated user (cookie-based auth)

export const menuAPI = {
  // Create new menu category (only name is needed; backend fills email)
  createCategory: (name) =>
    api.post("/api/menu/create", { name }),

  // Get all categories for current restaurant
  getCategories: () => api.get("/api/menu/get"),

  // Update existing category by id
  updateCategory: (id, name) =>
    api.put("/api/menu/update", { id, name }),

  // Delete category by id (backend expects body in DELETE request)
  deleteCategory: (id) =>
    api.delete("/api/menu/delete", { data: { id } }),
};

export default menuAPI;
