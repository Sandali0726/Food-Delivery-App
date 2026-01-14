import { customerAPI } from '../services/api';

export const UserDetails = async (email) => {
    try {
        const response = await customerAPI.getProfile(email);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}

