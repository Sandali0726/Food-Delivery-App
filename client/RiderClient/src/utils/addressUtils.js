/**
 * Utility functions for handling address display and formatting
 */

/**
 * Format address for display with different levels of detail
 * @param {string} fullAddress - Complete address from geocoding
 * @param {string} type - Type of formatting ('short', 'medium', 'full')
 * @returns {string} - Formatted address
 */
export const formatAddressForDisplay = (fullAddress, type = 'medium') => {
    if (!fullAddress) return 'Address not available';
    
    const parts = fullAddress.split(', ');
    
    switch (type) {
        case 'short':
            // Return just street and number
            return parts[0] || fullAddress;
        
        case 'medium':
            // Return street and locality
            return parts.slice(0, 2).join(', ') || fullAddress;
        
        case 'full':
        default:
            return fullAddress;
    }
};

/**
 * Get distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} - Radians
 */
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Estimate delivery time based on distance and traffic conditions
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} trafficCondition - Traffic condition ('light', 'moderate', 'heavy')
 * @returns {number} - Estimated time in minutes
 */
export const estimateDeliveryTime = (distanceKm, trafficCondition = 'moderate') => {
    const speedMap = {
        light: 40,    // km/h in light traffic
        moderate: 25, // km/h in moderate traffic
        heavy: 15     // km/h in heavy traffic
    };
    
    const speed = speedMap[trafficCondition] || speedMap.moderate;
    const timeHours = distanceKm / speed;
    const timeMinutes = Math.round(timeHours * 60);
    
    // Add buffer time for pickup/delivery
    return Math.max(timeMinutes + 5, 10); // Minimum 10 minutes
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - Whether coordinates are valid
 */
export const isValidCoordinates = (lat, lng) => {
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
};

/**
 * Get address type icon based on location type
 * @param {string} type - Location type ('restaurant', 'customer', 'driver')
 * @returns {string} - Icon name for the location type
 */
export const getAddressTypeIcon = (type) => {
    const iconMap = {
        restaurant: 'MdRestaurant',
        customer: 'MdPerson',
        driver: 'MdDeliveryDining'
    };
    
    return iconMap[type] || 'MdLocationOn';
};