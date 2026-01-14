import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import { MdArrowBack, MdMyLocation, MdDirections, MdCheckCircle, MdError, MdRefresh, MdLocationOn, MdTimer, MdPlayArrow, MdStop, MdPause } from 'react-icons/md';
import { updateOrderStatus, selectActiveOrder, selectStatusUpdateLoading, setActiveOrder } from '../features/ordersSlice';
import { DELIVERY_STATUS } from '../api/delivery';
import { updateCurrentLocation } from '../api/location';
import OTPModal from './OTPModal';
import LocationPermissionModal from './LocationPermissionModal';
import ConfirmationModal from './ConfirmationModal';
import { connectSocket, subscribeSafe, disconnectSocket } from '../api/ws';
import { locationSubscribe } from '../socketSubscribers/LocationSubscriber';
import useLocationTracking from '../hooks/useLocationTracking';
import 'mapbox-gl/dist/mapbox-gl.css';

// mapboxgl.accessToken = "pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DeliveryMap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { order, mapType } = location.state || {};
  const activeOrder = useSelector(selectActiveOrder);
  const isUpdatingStatus = useSelector(selectStatusUpdateLoading);
  const { rider } = useSelector((state) => state.auth);
  const currentOrder = order || activeOrder;

  console.log(currentOrder);
  
  const locationTracking = useLocationTracking();
  
  // Refs for map and markers
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarker = useRef(null);
  const destinationMarker = useRef(null);
  const wsSubscription = useRef(null);
  const initialBoundsSet = useRef(false);
  
  // State
  const [mapReady, setMapReady] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [error, setError] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showPickupConfirmModal, setShowPickupConfirmModal] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [locationSource, setLocationSource] = useState('browser');
  
  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const simulationIntervalRef = useRef(null);
  const currentRouteRef = useRef(null);

  // Get destination based on map type
  const destination = mapType === 'pickup' 
    ? {
        lat: currentOrder?.pickup_lat,
        lng: currentOrder?.pickup_lng,
        name: currentOrder?.restaurant?.name,
        address: currentOrder?.pickupAddress,
        type: 'Restaurant'
      }
    : {
        lat: currentOrder?.drop_lat,
        lng: currentOrder?.drop_lng,
        name: currentOrder?.customer?.name,
        address: currentOrder?.deliveryAddress,
        type: 'Customer'
      };

  // Initialize map only once
  useEffect(() => {
    if (!currentOrder || map.current) return;

    console.log('🗺️ Initializing map...');
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [79.8612, 6.9271], // Default to Colombo
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on('load', () => {
      console.log('✅ Map loaded');
      setMapReady(true);
    });

    return () => {
      console.log('🧹 Cleaning up map...');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (driverMarker.current) {
        driverMarker.current.remove();
        driverMarker.current = null;
      }
      if (destinationMarker.current) {
        destinationMarker.current.remove();
        destinationMarker.current = null;
      }
    };
  }, [currentOrder]);

  // Create markers only once when map is ready
  useEffect(() => {
    if (!mapReady || !destination || driverMarker.current || destinationMarker.current) return;

    console.log('🎯 Creating markers for the first time...');

    // Create destination marker
    const destEl = document.createElement('div');
    destEl.className = 'destination-marker';
    const destColor = mapType === 'pickup' ? '#10B981' : '#EF4444';
    const destIcon = mapType === 'pickup' ? '🏪' : '🏠';
    
    destEl.style.cssText = `
      width: 40px;
      height: 40px;
      background: ${destColor};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      z-index: 1000;
    `;
    destEl.innerHTML = destIcon;

    destinationMarker.current = new mapboxgl.Marker(destEl)
      .setLngLat([destination.lng, destination.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="font-semibold">${destination.name}</div>
        <div class="text-sm text-gray-600">${destination.address}</div>
      `))
      .addTo(map.current);

    // Create driver marker (will be positioned when we get location)
    const driverEl = document.createElement('div');
    driverEl.className = 'driver-marker';
    driverEl.style.cssText = `
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      transition: all 0.3s ease;
      z-index: 1001;
    `;
    driverEl.innerHTML = '🏍️';

    driverMarker.current = new mapboxgl.Marker(driverEl)
      .setLngLat([79.8612, 6.9271]) // Start at default position
      .setPopup(new mapboxgl.Popup().setHTML('<div class="font-semibold">Your Location</div>'))
      .addTo(map.current);

    console.log('✅ Markers created successfully');
  }, [mapReady, destination, mapType]);

  // Update driver marker position smoothly
  const updateDriverPosition = (lat, lng, source) => {
    if (!driverMarker.current) return;

    console.log(`📍 Updating driver position: [${lng}, ${lat}] from ${source}`);
    
    // Smooth position update
    driverMarker.current.setLngLat([lng, lat]);

    // Update marker style based on source
    const markerEl = driverMarker.current.getElement();
    if (markerEl) {
      if (source === 'simulation') {
        markerEl.style.fontSize = '40px';
        markerEl.innerHTML = '🎬'; // Movie camera emoji for simulation
      } else {
        markerEl.style.fontSize = '30px';
        markerEl.innerHTML = '🏍️'; // Motorcycle for normal
      }
    }

    // Update popup
    const popup = driverMarker.current.getPopup();
    if (popup) {
      let popupContent;
      if (source === 'simulation') {
        popupContent = '<div class="font-semibold">Simulated Position 🎬</div>';
      } else if (source === 'websocket') {
        popupContent = '<div class="font-semibold">Your Location <span class="text-green-500">🔴 Live</span></div>';
      } else {
        popupContent = '<div class="font-semibold">Your Location</div>';
      }
      popup.setHTML(popupContent);
    }
  };

  // Get and draw route
  const updateRoute = async (startLat, startLng, endLat, endLng) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) throw new Error('Failed to get route');

      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Store route data for simulation
        currentRouteRef.current = data;
        setRouteCoordinates(route.geometry.coordinates);
        
        // Update route info
        setEstimatedTime(Math.round(route.duration / 60));
        setDistance((route.distance / 1000).toFixed(1));

        // Draw route on map
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        map.current.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: route.geometry },
        });

        map.current.addLayer({
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
    } catch (error) {
      console.error('❌ Error updating route:', error);
    }
  };

  // Handle location update from any source
  const handleLocationUpdate = (lat, lng, source) => {
    console.log(`📍 Location update: [${lat}, ${lng}] from ${source}`);
    
    setDriverLocation({ lat, lng });
    setLocationSource(source);
    setIsLoadingLocation(false);
    setError(null);

    // Update marker position
    updateDriverPosition(lat, lng, source);

    // Update route
    if (destination) {
      updateRoute(lat, lng, destination.lat, destination.lng);
    }

    // Fit bounds on first location or significant changes
    if (map.current && destination && !estimatedTime) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([lng, lat]);
      bounds.extend([destination.lng, destination.lat]);
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      initialBoundsSet.current = true;
    }
  };

  // Custom function to update location during simulation
  const updateSimulationLocationToServer = async (lat, lng) => {
    if (!rider?.email) return;

    try {
      const locationData = {
        email: rider.email,
        current_lat: lat,
        current_lng: lng
      };

      await updateCurrentLocation(locationData);
      console.log('🎯 Simulation location updated:', locationData);
    } catch (error) {
      console.error('❌ Failed to update simulation location:', error);
    }
  };

  // Simulation functions
  const startSimulation = () => {
    if (routeCoordinates.length === 0) {
      setError('No route available for simulation');
      return;
    }

    console.log('🎬 Starting route simulation - Backend will send coordinates via WebSocket');
    setIsSimulating(true);
    setSimulationPaused(false);
    setSimulationProgress(0);

    // Stop live location tracking during simulation
    locationTracking.stopLocationTracking();

    // Start simulation interval (send coordinates to backend every 2 seconds)
    simulationIntervalRef.current = setInterval(() => {
      setSimulationProgress(prev => {
        const nextProgress = prev + 1;
        
        if (nextProgress >= routeCoordinates.length) {
          // Simulation completed
          console.log('🎬 Simulation completed successfully!');
          setError('Simulation completed! You have reached the destination.');
          setTimeout(() => setError(null), 5000); // Clear message after 5 seconds
          stopSimulation();
          return prev;
        }

        const [lng, lat] = routeCoordinates[nextProgress];
        
        // Send to backend first - frontend will be updated via WebSocket
        console.log(`📤 Sending simulation coordinates to backend: [${lat}, ${lng}]`);
        updateSimulationLocationToServer(lat, lng);

        return nextProgress;
      });
    }, 2000); // Send coordinates every 2 seconds
  };

  const pauseSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setSimulationPaused(true);
    console.log('⏸️ Simulation paused');
  };

  const resumeSimulation = () => {
    if (!isSimulating || !simulationPaused) return;

    console.log('▶️ Resuming simulation');
    setSimulationPaused(false);

    simulationIntervalRef.current = setInterval(() => {
      setSimulationProgress(prev => {
        const nextProgress = prev + 1;
        
        if (nextProgress >= routeCoordinates.length) {
          console.log('🎬 Simulation completed successfully!');
          setError('Simulation completed! You have reached the destination.');
          setTimeout(() => setError(null), 5000); // Clear message after 5 seconds
          stopSimulation();
          return prev;
        }

        const [lng, lat] = routeCoordinates[nextProgress];
        
        // Send to backend first - frontend will be updated via WebSocket
        console.log(`📤 Sending simulation coordinates to backend: [${lat}, ${lng}]`);
        updateSimulationLocationToServer(lat, lng);

        return nextProgress;
      });
    }, 2000);
  };

  const stopSimulation = () => {
    console.log('⏹️ Stopping simulation - Resuming live location tracking');
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    setIsSimulating(false);
    setSimulationPaused(false);
    setSimulationProgress(0);

    // Re-enable live location tracking with delay to ensure clean transition
    setTimeout(() => {
      console.log('🔄 Restarting live location tracking...');
      locationTracking.startLocationTracking();
    }, 1000);
  };

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // Setup WebSocket location tracking
  useEffect(() => {
    if (!rider?.email || !mapReady) return;

    console.log('🔌 Setting up WebSocket connection...');
    
    // Only start location tracking if not simulating
    if (!isSimulating) {
      locationTracking.startLocationTracking();
    }

    const setupWebSocket = async () => {
      try {
        await connectSocket((client) => {
          console.log('✅ WebSocket connected');
          setWsConnected(true);

          subscribeSafe((stompClient) => {
            wsSubscription.current = locationSubscribe(stompClient, (data) => {
              if (data.type === 'LOCATION_UPDATE' && data.payload?.email === rider.email) {
                const { current_lat, current_lng } = data.payload;
                const source = isSimulating ? 'simulation' : 'websocket';
                console.log(`📡 WebSocket location received: [${current_lat}, ${current_lng}] - Source: ${source}`);
                handleLocationUpdate(
                  parseFloat(current_lat),
                  parseFloat(current_lng),
                  source
                );
              }
            });
          });
        });
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        setWsConnected(false);
      }
    };

    setupWebSocket();

    return () => {
      console.log('🧹 Cleaning up WebSocket...');
      if (wsSubscription.current) {
        wsSubscription.current.unsubscribe();
        wsSubscription.current = null;
      }
      if (wsConnected) {
        disconnectSocket();
        setWsConnected(false);
      }
      if (!isSimulating) {
        locationTracking.stopLocationTracking();
      }
    };
  }, [rider?.email, mapReady]);

  // Get initial browser location
  useEffect(() => {
    if (!mapReady || isSimulating) return;

    console.log('📍 Getting initial browser location...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Only use browser location if we don't have a WebSocket location yet
          if (!driverLocation || locationSource !== 'websocket') {
            handleLocationUpdate(latitude, longitude, 'browser');
          }
        },
        (error) => {
          console.error('❌ Browser geolocation error:', error);
          setError('Unable to get your location');
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    }
  }, [mapReady, isSimulating]);

  // Manual refresh handler
  const handleRefresh = () => {
    if (isSimulating) return; // Don't refresh during simulation
    
    console.log('🔄 Manual refresh triggered');
    locationTracking.updateLocationToServer();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationUpdate(position.coords.latitude, position.coords.longitude, 'browser');
        },
        (error) => console.error('❌ Refresh error:', error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  // Status update handlers
  const handleStatusUpdate = async (newStatus) => {
    if (!currentOrder) return;
    try {
      const result = await dispatch(updateOrderStatus({
        orderId: currentOrder.orderId,
        status: newStatus,
        currentOrder
      })).unwrap();
      const updatedOrder = result?.enhancedOrder || currentOrder;
      
      // Set this order as active since its status was just updated
      dispatch(setActiveOrder(updatedOrder));
      
      setTimeout(() => navigate('/dashboard', { state: { activeTab: 'orders' } }), 1000);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleActionButton = () => {
    if (mapType === 'pickup') {
      setShowPickupConfirmModal(true);
    } else {
      setShowOTPModal(true);
    }
  };

  const handlePickupConfirm = async () => {
    await handleStatusUpdate(DELIVERY_STATUS.PICKED_UP);
    setShowPickupConfirmModal(false);
  };

  const handleOTPSubmit = async (otp) => {
    console.log('OTP validated:', otp);
    try {
      await handleStatusUpdate(DELIVERY_STATUS.DELIVERED);
      setShowOTPModal(false);
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    }
  };

  // Redirect if no order
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MdError className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order data is missing or invalid.</p>
          <button
            onClick={() => navigate('/dashboard', { state: { activeTab: 'orders' } })}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard', { state: { activeTab: 'orders' } })}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition duration-200"
          >
            <MdArrowBack className="h-6 w-6" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-800">
              Navigate to {mapType === 'pickup' ? 'Pickup' : 'Customer'}
            </h1>
            <p className="text-sm text-gray-600">Order #{currentOrder.orderId}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Simulation Controls */}
            {routeCoordinates.length > 0 && !isSimulating && (
              <button
                onClick={startSimulation}
                className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                title="Start Route Simulation"
              >
                <MdPlayArrow className="h-5 w-5" />
                <span className="text-sm font-medium">Simulate</span>
              </button>
            )}
            
            {isSimulating && (
              <div className="flex items-center space-x-2">
                {simulationPaused ? (
                  <button
                    onClick={resumeSimulation}
                    className="flex items-center space-x-1 px-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                    title="Resume Simulation"
                  >
                    <MdPlayArrow className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={pauseSimulation}
                    className="flex items-center space-x-1 px-2 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
                    title="Pause Simulation"
                  >
                    <MdPause className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={stopSimulation}
                  className="flex items-center space-x-1 px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                  title="Stop Simulation"
                >
                  <MdStop className="h-4 w-4" />
                </button>
                <div className="text-xs text-gray-600">
                  {simulationProgress}/{routeCoordinates.length}
                </div>
              </div>
            )}
            
            {!isSimulating && (
              <button
                onClick={handleRefresh}
                className="text-orange-500 hover:text-orange-600 transition duration-200"
                disabled={isLoadingLocation}
                title="Refresh location"
              >
                {isLoadingLocation ? (
                  <MdRefresh className="h-6 w-6 animate-spin" />
                ) : (
                  <MdMyLocation className="h-6 w-6" />
                )}
              </button>
            )}
            
            {/* Status indicators */}
            {!isSimulating && wsConnected && locationSource === 'websocket' && (
              <div className="flex items-center space-x-1 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Live</span>
              </div>
            )}
            
            {!isSimulating && locationSource === 'browser' && (
              <div className="flex items-center space-x-1 text-blue-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium">GPS</span>
              </div>
            )}
            
            {isSimulating && (
              <div className="flex items-center space-x-1 text-purple-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">
                  {simulationPaused ? 'Paused' : wsConnected ? 'Simulating via WebSocket' : 'Simulating (Offline)'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Loading overlay */}
        {isLoadingLocation && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <MdRefresh className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Getting your location...</p>
              {wsConnected && (
                <p className="text-sm text-green-500 mt-2">🔴 Live tracking active</p>
              )}
            </div>
          </div>
        )}

        {/* Error/Success overlay */}
        {error && (
          <div className={`absolute top-4 left-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            error.includes('completed') || error.includes('success') ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <div className="flex items-center space-x-2">
              {error.includes('completed') || error.includes('success') ? (
                <MdCheckCircle className="h-5 w-5" />
              ) : (
                <MdError className="h-5 w-5" />
              )}
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Route info */}
        {estimatedTime && distance && (
          <div className="absolute top-4 left-4 right-4 md:right-auto md:max-w-xs bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <MdTimer className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{estimatedTime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <MdDirections className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{distance} km</span>
              </div>
            </div>
            
            {/* Simulation progress */}
            {isSimulating && (
              <div className="mt-3 border-t pt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Simulation Progress</span>
                  <span>{Math.round((simulationProgress / routeCoordinates.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(simulationProgress / routeCoordinates.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span className="truncate">{simulationProgress} / {routeCoordinates.length} points</span>
                  <span className={`ml-2 flex-shrink-0 ${simulationPaused ? 'text-yellow-600' : 'text-purple-600'}`}>
                    {simulationPaused ? 'Paused' : 'Active'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                mapType === 'pickup' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <MdLocationOn className={`h-5 w-5 ${
                  mapType === 'pickup' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{destination.name}</h3>
                <p className="text-sm text-gray-600">{destination.address}</p>
                {mapType === 'pickup' && (
                  <p className="text-sm text-green-600 font-medium">{destination.type}</p>
                )}
                {mapType === 'delivery' && (
                  <p className="text-sm text-blue-600 font-medium">
                    Customer: {currentOrder.customer.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleActionButton}
            disabled={isUpdatingStatus}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition duration-200 ${
              isUpdatingStatus
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : mapType === 'pickup'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isUpdatingStatus ? (
              <MdRefresh className="h-5 w-5 animate-spin" />
            ) : (
              <MdCheckCircle className="h-5 w-5" />
            )}
            <span>
              {isUpdatingStatus 
                ? 'Updating...' 
                : mapType === 'pickup' 
                  ? 'Confirm Pickup' 
                  : 'Confirm Delivery'}
            </span>
          </button>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onSubmit={handleOTPSubmit}
        orderId={currentOrder?.orderId}
      />

      <LocationPermissionModal
        isOpen={locationTracking.showPermissionModal}
        onAllow={locationTracking.handleAllowLocation}
        onDeny={locationTracking.handleDenyLocation}
        onClose={locationTracking.handleCloseModal}
      />

      <ConfirmationModal
        isOpen={showPickupConfirmModal}
        onClose={() => setShowPickupConfirmModal(false)}
        onConfirm={handlePickupConfirm}
        title="Confirm Pickup"
        message="Are you sure you have picked up the order from the restaurant? This action will update the order status to 'Picked Up' and notify the customer."
        confirmText="Yes, Picked Up"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default DeliveryMap;