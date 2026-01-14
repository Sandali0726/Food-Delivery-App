import axios from 'axios';

//const API_RESTAURANT_URL = process.env.REACT_APP_RESTAURANT_URL;
const API_RESTAURANT_URL = process.env.REACT_APP_RESTAURANT_URL;
const restaurantApi = axios.create({
  baseURL: API_RESTAURANT_URL,
  withCredentials: true
});

export const RestaurantAPI = {
  getAll: (params) => restaurantApi.get('/profile/p-restaurant', { params }),
  getMenuByRestaurantEmail: (email, { page = 0, size = 20 } = {}) =>
    restaurantApi.get('/foods/p-foods', {
      params: { email, page, size },
    }),
  getCategoriesByRestaurantEmail: (email) => restaurantApi.get('/menu/p-getcategories', { params: { email } }),
  getRestaurantDetails: (email) => restaurantApi.get('/profile/p-restaurantdetails', { params: { email } }),
  getFoodImg: (id) => restaurantApi.get('/foods/image', { params: { id } }),
};
