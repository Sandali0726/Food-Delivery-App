import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = "pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw"

export const getDistanceAndTime = async (startLat, startLng, endLat, endLng) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) throw new Error('Failed to get route data');

      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        return {
          distance: (route.distance / 1000).toFixed(1), // in km
          time: Math.round(route.duration / 60), // in minutes
          geometry: route.geometry,
          success: true
        };
      }
      
      return { success: false, error: 'No route found' };
    } catch (error) {
      console.error('❌ Error getting distance and time:', error);
      return { success: false, error: error.message };
    }
  };