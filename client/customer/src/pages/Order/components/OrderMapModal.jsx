import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import socketService from '../../../services/socket';
// Set Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';
const OrderMapModal = ({ isOpen, onClose, order }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const orderId = order?.orderId || order?.id;
  const deliveryLat = order?.deliveryLat;
  const deliveryLng = order?.deliveryLng;
  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || mapRef.current) return;
    // Check if delivery coordinates are valid
    if (!deliveryLat || !deliveryLng) {
      console.error('Invalid delivery coordinates');
      return;
    }
    // Initialize Mapbox map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [deliveryLng, deliveryLat],
      zoom: 14,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('load', () => {
      console.log('Map loaded successfully');
      // Add destination marker
      const destinationEl = document.createElement('div');
      destinationEl.className = 'destination-marker';
      destinationEl.style.width = '40px';
      destinationEl.style.height = '40px';
      destinationEl.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
      destinationEl.style.backgroundSize = 'cover';
      destinationEl.style.cursor = 'pointer';
      const destinationMarker = new mapboxgl.Marker(destinationEl)
        .setLngLat([deliveryLng, deliveryLat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Delivery Location</h3>'))
        .addTo(map);
      destinationMarkerRef.current = destinationMarker;
      // Add route source and layer (will be updated when rider location is available)
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.75
        }
      });
      routeLayerRef.current = 'route';
    });
    mapRef.current = map;
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen, deliveryLat, deliveryLng]);
  // Subscribe to rider location updates
  useEffect(() => {
    if (!isOpen || !orderId || !mapRef.current) return;
    console.log(`Setting up rider tracking for order ${orderId}`);
    const handleLocationUpdate = (locationData) => {
      console.log('Received rider location update:', locationData);
      if (locationData && locationData.lat && locationData.lng) {
        setRiderLocation({
          lat: locationData.lat,
          lng: locationData.lng
        });
      }
    };
    // Subscribe to rider location updates
    socketService.subscribeToRiderLocation(orderId, handleLocationUpdate);
    // Start tracking
    const started = socketService.startRiderTracking(orderId);
    if (started) {
      setIsTracking(true);
      console.log(`Started tracking rider for order ${orderId}`);
    }
    return () => {
      console.log(`Cleaning up rider tracking for order ${orderId}`);
      socketService.unsubscribeFromRiderLocation(orderId);
      setIsTracking(false);
    };
  }, [isOpen, orderId]);
  // Update rider marker when location changes
  useEffect(() => {
    if (!mapRef.current || !riderLocation) return;
    const map = mapRef.current;
    const { lat, lng } = riderLocation;
    // Create or update rider marker
    if (!riderMarkerRef.current) {
      // Create rider marker element
      const riderEl = document.createElement('div');
      riderEl.className = 'rider-marker';
      riderEl.style.width = '40px';
      riderEl.style.height = '40px';
      riderEl.style.borderRadius = '50%';
      riderEl.style.backgroundColor = '#3b82f6';
      riderEl.style.border = '3px solid white';
      riderEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
      riderEl.innerHTML = '<div style="color: white; text-align: center; line-height: 34px; font-size: 20px;">🏍️</div>';
      const riderMarker = new mapboxgl.Marker(riderEl)
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Rider Location</h3>'))
        .addTo(map);
      riderMarkerRef.current = riderMarker;
    } else {
      // Update existing marker position with smooth animation
      riderMarkerRef.current.setLngLat([lng, lat]);
    }
    // Fetch and draw route from rider to destination
    if (deliveryLng && deliveryLat) {
      fetchAndDrawRoute(map, lng, lat, deliveryLng, deliveryLat);
    }
    // Fit map bounds to show both rider and destination
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([lng, lat]);
    bounds.extend([deliveryLng, deliveryLat]);
    map.fitBounds(bounds, { padding: 100, maxZoom: 15 });
  }, [riderLocation, deliveryLng, deliveryLat]);
  // Fetch and draw route using Mapbox Directions API
  const fetchAndDrawRoute = async (map, riderLng, riderLat, destLng, destLat) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${riderLng},${riderLat};${destLng},${destLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;
        // Update route source
        map.getSource('route').setData({
          type: 'Feature',
          properties: {},
          geometry: route
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-11/12 max-w-4xl h-5/6 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Track Order #{orderId}
            </h3>
            {isTracking && (
              <p className="text-sm text-green-600 flex items-center gap-2 mt-1">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Live tracking active
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 font-semibold text-2xl px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>
        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="w-full h-full rounded-b-lg" />
          {/* Info overlay */}
          {riderLocation && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Rider Location</p>
                  <p className="text-xs text-gray-600">
                    {riderLocation.lat.toFixed(6)}, {riderLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Delivery Location</p>
                  <p className="text-xs text-gray-600">
                    {deliveryLat.toFixed(6)}, {deliveryLng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
          {!riderLocation && isTracking && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-md">
              <p className="text-sm font-medium">Waiting for rider location...</p>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Rider: {order?.riderEmail || 'Not assigned'}</p>
              <p>Restaurant: {order?.restaurantName || 'N/A'}</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderMapModal;
