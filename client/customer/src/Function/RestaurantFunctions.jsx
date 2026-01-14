import { RestaurantAPI } from '../services/RestaurantApi';
import {orderAPI,ratingAPI} from "../services/api";

export const fetchAllRestaurants = async (params) => {
  try {
    const response = await RestaurantAPI.getAll(params);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};
export const fetchMenuByRestaurantEmail = async (email, options = {}) => {
  try {
    const response = await RestaurantAPI.getMenuByRestaurantEmail(email, options);
    return response.data;
  } catch (error) {
    console.error('Error fetching menu by restaurant email:', error);
    throw error;
  }
};
export const fetchCategorybyRestaurantEmail = async (email) => {
    try {
        const response = await RestaurantAPI.getCategoriesByRestaurantEmail(email);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching category by Email:', error);
        throw error;
    }
}
export const getRestaurantDetails = async (email) => {
    try {
        const response = await RestaurantAPI.getRestaurantDetails(email);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching restaurant details:', error);
        throw error;
    }
}
export const fetchRestaurntReviewsByEmail = async (email) => {
    try {
        const response = await orderAPI.getRestaurantReviewbyEmail(email);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching restaurant reviews by Email:', error);
        throw error;
    }
}
export const getRestaurantRating  = async(email) =>{
    try {
        const response = await ratingAPI.getAverageRating(email)
        return response.data;
    }
    catch (error) {
        console.error('Error calculating average rating:', error);
        throw error;
    }
}
export  const checkIfRestaurantOpen = async (email) => {
    try {
        const response = await RestaurantAPI.getRestaurantDetails(email);
        if(response.data.open){
            return true;
        }
    }
    catch (error) {
        console.error('Error checking restaurant open status:', error);
        throw error;
    }
}
export const fetchFoodImage = async (id) => {
    try {
        const response = await RestaurantAPI.getFoodImg(id);
        console.log(response.data);
        return response.data;

    }
    catch (error) {
        console.error('Error fetching food image:', error);
        throw error;
    }
}


