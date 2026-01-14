import { orderAPI } from '../services/api';

export const RiderDetails = async (email) => {
    try {
        const response = await orderAPI.getRiderDetails(email);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching rider details:', error);
        throw error;
    }
}
export const CalculateDeliveryFee = async (distance,time) => {
    const baseFee = 5.0; // Base fee in dollars
    const perKmRate = 2.0; // Rate per kilometer in dollars
    const perMinuteRate = 0.5; // Rate per minute in dollars
    const minimumFee = 10.0; // Minimum delivery fee in dollars

    let fee = baseFee + (perKmRate * distance) + (perMinuteRate * time);
    if (fee < minimumFee) {
        fee = minimumFee;
    }
    return Number(fee.toFixed(2)); // Return fee rounded to 2 decimal places as a number

}
export const updateRoute = async (map, accessToken, startLat, startLng, endLat, endLng) => {
    try {
        const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${accessToken}`
        );

        if (!response.ok) throw new Error('Failed to get route');

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];

            // Compute route info
            const estimatedTimeMinutes = Math.round(route.duration / 60);
            const distanceKm = Number((route.distance / 1000).toFixed(1));

            // Draw route on map if a valid map instance is provided
            if (map && typeof map.getSource === 'function') {
                if (map.getSource('route')) {
                    // Clean up existing route layer/source if present
                    if (map.getLayer && map.getLayer('route')) {
                        map.removeLayer('route');
                    }
                    map.removeSource('route');
                }

                map.addSource('route', {
                    type: 'geojson',
                    data: { type: 'Feature', geometry: route.geometry },
                });

                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    paint: {
                        'line-color': '#ff7a00',
                        'line-width': 6,
                        'line-opacity': 0.8,
                    },
                });
            }

            return {
                geometry: route.geometry,
                estimatedTimeMinutes,
                distanceKm,
            };
        }

        throw new Error('No routes returned from Mapbox');
    } catch (error) {
        console.error('❌ Error updating route:', error);
        throw error;
    }
};
export const getAllReviews = async () => {
    try {
        const response = await orderAPI.getAllRetaurantReviews();
        return response.data;
    }
    catch (error) {
        console.error('Error fetching all reviews:', error);
        throw error;
    }
}