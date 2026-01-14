import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import socketService from '../../../services/socket';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

const OrderMapCard = ({ order }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const orderId = order?.orderId || order?.id;
  const deliveryLat = order?.deliveryLat;
  const deliveryLng = order?.deliveryLng;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!deliveryLat || !deliveryLng) {
      console.error('Invalid delivery coordinates');
      return;
    }
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [deliveryLng, deliveryLat],
      zoom: 14,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('load', () => {
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

      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        },
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.75 },
      });
    });

    mapRef.current = map;
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [deliveryLat, deliveryLng]);

  // Subscribe to rider location updates
  useEffect(() => {
    if (!orderId || !mapRef.current) return;
    const handleLocationUpdate = (locationData) => {
      if (locationData && locationData.lat && locationData.lng) {
        setRiderLocation({ lat: locationData.lat, lng: locationData.lng });
      }
    };
    socketService.subscribeToRiderLocation(orderId, handleLocationUpdate);
    const started = socketService.startRiderTracking(orderId);
    if (started) setIsTracking(true);
    return () => {
      socketService.unsubscribeFromRiderLocation(orderId);
      setIsTracking(false);
    };
  }, [orderId]);

  // Update rider marker when location changes
  useEffect(() => {
    if (!mapRef.current || !riderLocation) return;
    const map = mapRef.current;
    const { lat, lng } = riderLocation;
    if (!riderMarkerRef.current) {
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
      riderMarkerRef.current.setLngLat([lng, lat]);
    }

    // Draw route
    if (deliveryLng && deliveryLat) {
      fetchAndDrawRoute(map, lng, lat, deliveryLng, deliveryLat);
    }

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([lng, lat]);
    bounds.extend([deliveryLng, deliveryLat]);
    map.fitBounds(bounds, { padding: 100, maxZoom: 15 });
  }, [riderLocation, deliveryLng, deliveryLat]);

  const fetchAndDrawRoute = async (map, riderLng, riderLat, destLng, destLat) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${riderLng},${riderLat};${destLng},${destLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;
        map.getSource('route').setData({ type: 'Feature', properties: {}, geometry: route });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  if (!deliveryLat || !deliveryLng) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-0 shadow-2xl border-2 border-white/50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">Live Order Map</h3>
          {isTracking && (
            <p className="text-xs text-green-600 flex items-center gap-2 mt-1">
              <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Live tracking active for order #{orderId}
            </p>
          )}
        </div>
      </div>
      <div className="relative h-96">
        <div ref={mapContainerRef} className="w-full h-full" />
        {riderLocation && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Rider</p>
                <p className="text-xs text-gray-600">
                  {riderLocation.lat.toFixed(6)}, {riderLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Delivery</p>
                <p className="text-xs text-gray-600">
                  {deliveryLat.toFixed(6)}, {deliveryLng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}
        {!riderLocation && isTracking && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg shadow-md">
            <p className="text-xs font-medium">Waiting for rider location...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderMapCard;

