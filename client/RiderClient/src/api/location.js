import api from "./axios";

// Update current location
export const updateCurrentLocation = (locationData) =>
    api.post('/auth/update-location', locationData);

// Get current location from browser
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 60000, // Increased to 60 seconds for better reliability
            maximumAge: 300000 // Cache for 5 minutes to reduce GPS calls
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let errorMessage = 'Failed to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timeout';
                        break;
                }
                reject(new Error(errorMessage));
            },
            options
        );
        // const watchId = navigator.geolocation.watchPosition(
        //     (position) => {
        //         const { latitude, longitude, accuracy } = position.coords;

        //         // Accept only accurate readings
        //         if (accuracy <= 50) {
        //             navigator.geolocation.clearWatch(watchId);
        //             resolve({ latitude, longitude, accuracy });
        //         }
        //     },
        //     (error) => {
        //         navigator.geolocation.clearWatch(watchId);
        //         reject(error);
        //     },
        //     options
        // );
    });
};

// Geocoding - Search for places
export const searchPlaces = async (query, proximity = null) => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    // Sri Lanka bounding box: [southwest_lng, southwest_lat, northeast_lng, northeast_lat]
    const sriLankaBounds = '79.5,5.9,81.9,9.9';
    
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=5&country=LK&bbox=${sriLankaBounds}`;
    
    // Add proximity for better results near current location (default to Colombo if not provided)
    const proximityCoords = proximity 
        ? `${proximity.lng},${proximity.lat}` 
        : '79.8612,6.9271'; // Colombo coordinates
    
    url += `&proximity=${proximityCoords}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.features;
    } catch (error) {
        console.error('Search error:', error);
        throw new Error('Failed to search places');
    }
};

// Reverse Geocoding - Get address from coordinates
export const reverseGeocode = async (lng, lat) => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
        );
        const data = await response.json();
        return data.features[0]?.place_name || 'Unknown location';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return 'Unknown location';
    }
};

// Get directions between two points
export const getDirections = async (origin, destination, profile = 'driving') => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN ;
    // profile can be: driving, driving-traffic, walking, cycling
    const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    
    try {
        const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?steps=true&geometries=geojson&access_token=${token}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            return {
                route: data.routes[0],
                distance: data.routes[0].distance, // in meters
                duration: data.routes[0].duration, // in seconds
                geometry: data.routes[0].geometry,
                steps: data.routes[0].legs[0].steps
            };
        }
        throw new Error('No route found');
    } catch (error) {
        console.error('Directions error:', error);
        throw new Error('Failed to get directions');
    }
};