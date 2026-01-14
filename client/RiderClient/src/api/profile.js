import api from "../api/axios";

export const getRiderProfile = (email) =>
    api.get(`/profile/getdetails?email=${email}`);

export const updateRiderProfile = (profileData, imageFile) => {
    const formData = new FormData();
    
    // Add profile data as JSON string
    formData.append('data', JSON.stringify(profileData));
    
    // Add image file if provided
    // Backend expects a 'file' part; append an empty Blob when no image is provided
    if (imageFile) {
        formData.append('file', imageFile);
    } else {
        formData.append('file', new Blob(), '');
    }
    
    // Let axios set the proper Content-Type including boundary
    return api.post('/profile/update', formData);
};

export const changeRiderStatus = (email) =>
    api.post(`/profile/change-status/${email}`);

export const getRiderStatus = (email) =>
    api.get(`/rider/status?email=${email}`);

export const getRiderReviews = (email) =>
    api.get(`/rider/reviews?email=${email}`);

export const getRiderStatistics = (email) =>
    api.get(`/rider/statistics?email=${email}`);