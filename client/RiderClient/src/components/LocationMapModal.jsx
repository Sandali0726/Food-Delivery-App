import React, { useEffect, useRef, useState } from 'react';
import { MdClose, MdMyLocation, MdLocationOn, MdSearch, MdDirections, MdNavigation, MdAccessTime, MdRoute } from 'react-icons/md';
import { searchPlaces, getDirections, getCurrentLocation } from '../api/location';

const LocationMapModal = ({ isOpen, onClose, location, address }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const routeLayerRef = useRef(null);
    
    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [originSearch, setOriginSearch] = useState('');
    const [originResults, setOriginResults] = useState([]);
    const [showOriginResults, setShowOriginResults] = useState(false);
    const [destinationSearch, setDestinationSearch] = useState('');
    const [destinationResults, setDestinationResults] = useState([]);
    const [showDestinationResults, setShowDestinationResults] = useState(false);
    const [origin, setOrigin] = useState(null);
    const [originAddress, setOriginAddress] = useState('');
    const [destination, setDestination] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState('');
    const [routeInfo, setRouteInfo] = useState(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(location);
    const [travelMode, setTravelMode] = useState('driving'); // driving, walking, cycling
    const [showDirections, setShowDirections] = useState(false);
    const [showRoutePanel, setShowRoutePanel] = useState(false); // Mobile route panel
    const [showRouteSummary, setShowRouteSummary] = useState(false); // Mobile route summary

    // Clear markers helper
    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    // Clear route helper
    const clearRoute = () => {
        if (mapRef.current && routeLayerRef.current) {
            if (mapRef.current.getLayer('route')) {
                mapRef.current.removeLayer('route');
            }
            if (mapRef.current.getSource('route')) {
                mapRef.current.removeSource('route');
            }
            routeLayerRef.current = null;
        }
        setRouteInfo(null);
    };

    // Search places
    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const proximity = currentLocation ? { lng: currentLocation.lng, lat: currentLocation.lat } : null;
            const results = await searchPlaces(query, proximity);
            setSearchResults(results);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    // Search for origin
    const handleOriginSearch = async (query) => {
        if (!query.trim()) {
            setOriginResults([]);
            setShowOriginResults(false);
            return;
        }

        try {
            const proximity = currentLocation ? { lng: currentLocation.lng, lat: currentLocation.lat } : null;
            const results = await searchPlaces(query, proximity);
            setOriginResults(results);
            setShowOriginResults(true);
        } catch (error) {
            console.error('Origin search failed:', error);
        }
    };

    // Search for destination
    const handleDestinationSearch = async (query) => {
        if (!query.trim()) {
            setDestinationResults([]);
            setShowDestinationResults(false);
            return;
        }

        try {
            const proximity = currentLocation ? { lng: currentLocation.lng, lat: currentLocation.lat } : null;
            const results = await searchPlaces(query, proximity);
            setDestinationResults(results);
            setShowDestinationResults(true);
        } catch (error) {
            console.error('Destination search failed:', error);
        }
    };

    // Select a search result
    const handleSelectPlace = (place) => {
        const [lng, lat] = place.center;
        
        setShowSearchResults(false);
        setSearchQuery('');
        
        // Fly to location
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 15,
                duration: 2000
            });

            // Add marker
            const marker = new window.mapboxgl.Marker({ color: '#3b82f6' })
                .setLngLat([lng, lat])
                .setPopup(
                    new window.mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                            <div class="p-2">
                                <h3 class="font-semibold text-gray-800 mb-1">${place.text}</h3>
                                <p class="text-xs text-gray-600">${place.place_name}</p>
                            </div>
                        `)
                )
                .addTo(mapRef.current);

            markersRef.current.push(marker);
        }
    };

    // Get address from coordinates
    const getAddressFromCoords = async (lng, lat) => {
        try {
            const { reverseGeocode } = await import('../api/location');
            const address = await reverseGeocode(lng, lat);
            return address;
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    };

    // Get current location
    const handleGetCurrentLocation = async () => {
        try {
            const pos = await getCurrentLocation();
            const newLocation = { 
                lat: pos.latitude, 
                lng: pos.longitude, 
                accuracy: pos.accuracy 
            };
            setCurrentLocation(newLocation);

            if (mapRef.current) {
                mapRef.current.flyTo({
                    center: [newLocation.lng, newLocation.lat],
                    zoom: 15,
                    duration: 1000
                });
            }
        } catch (error) {
            alert('Failed to get your location: ' + error.message);
        }
    };

    // Set origin from current location
    const handleSetOriginFromCurrentLocation = async () => {
        if (!currentLocation) {
            alert('Current location not available');
            return;
        }
        setOrigin(currentLocation);
        const address = await getAddressFromCoords(currentLocation.lng, currentLocation.lat);
        setOriginAddress(address);
        setOriginSearch('');
    };

    // Select origin from search
    const handleSelectOrigin = async (place) => {
        const [lng, lat] = place.center;
        setOrigin({ lng, lat });
        setOriginAddress(place.place_name);
        setOriginSearch('');
        setShowOriginResults(false);

        // Update map
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 15,
                duration: 1000
            });
        }
    };

    // Select destination from search
    const handleSelectDestination = async (place) => {
        const [lng, lat] = place.center;
        setDestination({ lng, lat });
        setDestinationAddress(place.place_name);
        setDestinationSearch('');
        setShowDestinationResults(false);

        // Remove old destination marker
        const oldDestMarker = markersRef.current.find(m => m._color === '#ef4444');
        if (oldDestMarker) {
            oldDestMarker.remove();
            markersRef.current = markersRef.current.filter(m => m !== oldDestMarker);
        }

        // Add new destination marker
        const marker = new window.mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat([lng, lat])
            .setPopup(
                new window.mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                        <div class="p-2">
                            <h3 class="font-semibold text-gray-800 mb-1">Destination</h3>
                            <p class="text-xs text-gray-600">${place.place_name}</p>
                        </div>
                    `)
            )
            .addTo(mapRef.current);

        markersRef.current.push(marker);

        // Update map
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 15,
                duration: 1000
            });
        }
    };

    // Calculate and display route
    const handleGetDirections = async () => {
        if (!origin || !destination) {
            alert('Please set both origin and destination');
            return;
        }

        setIsLoadingRoute(true);
        clearRoute();

        try {
            const directions = await getDirections(origin, destination, travelMode);
            setRouteInfo(directions);

            // Add route to map
            if (mapRef.current && directions.geometry) {
                // Add the route as a layer
                mapRef.current.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: directions.geometry
                    }
                });

                mapRef.current.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#f97316',
                        'line-width': 5,
                        'line-opacity': 0.8
                    }
                });

                routeLayerRef.current = true;

                // Fit map to route bounds
                const coordinates = directions.geometry.coordinates;
                const bounds = coordinates.reduce((bounds, coord) => {
                    return bounds.extend(coord);
                }, new window.mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

                mapRef.current.fitBounds(bounds, {
                    padding: 50
                });

                setShowDirections(true);
                setShowRoutePanel(false); // Close route panel on mobile
                setShowRouteSummary(true); // Show route summary on mobile
            }
        } catch (error) {
            alert('Failed to get directions: ' + error.message);
        } finally {
            setIsLoadingRoute(false);
        }
    };

    // Set origin or destination
    const handleSetPoint = (type) => {
        if (type === 'origin') {
            if (currentLocation) {
                setOrigin(currentLocation);
            } else {
                alert('Current location not available');
            }
        }
    };

    // Format duration
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} min`;
    };

    // Format distance
    const formatDistance = (meters) => {
        const km = meters / 1000;
        if (km >= 1) {
            return `${km.toFixed(1)} km`;
        }
        return `${meters.toFixed(0)} m`;
    };

    useEffect(() => {
        if (!isOpen || !window.mapboxgl) return;

        // Initialize map
        mapRef.current = new window.mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: location ? [location.lng, location.lat] : [80.7718, 7.8731], // Sri Lanka center as default
            zoom: location ? 15 : 7.5, // Zoom level appropriate for Sri Lanka
            // accessToken: import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw"
            accessToken: import.meta.env.VITE_MAPBOX_TOKEN
        });

        // Add marker for current location if provided
        if (location) {
            const marker = new window.mapboxgl.Marker({
                color: '#f97316',
                scale: 1.2
            })
                .setLngLat([location.lng, location.lat])
                .setPopup(
                    new window.mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                            <div class="p-2">
                                <h3 class="font-semibold text-gray-800 mb-1">Your Location</h3>
                                <p class="text-xs text-gray-600">${address || 'Current Position'}</p>
                            </div>
                        `)
                )
                .addTo(mapRef.current);

            markersRef.current.push(marker);
            setCurrentLocation(location);
        }

        // Add navigation controls
        mapRef.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

        // Add geolocate control
        const geolocateControl = new window.mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });
        
        mapRef.current.addControl(geolocateControl, 'top-right');

        // Listen for geolocate events
        geolocateControl.on('geolocate', (e) => {
            setCurrentLocation({
                lat: e.coords.latitude,
                lng: e.coords.longitude,
                accuracy: e.coords.accuracy
            });
        });

        // Add click handler to set destination
        mapRef.current.on('click', async (e) => {
            const { lng, lat } = e.lngLat;
            setDestination({ lng, lat });

            // Get address for the clicked location
            const { reverseGeocode } = await import('../api/location');
            const address = await reverseGeocode(lng, lat);
            setDestinationAddress(address);

            // Remove old destination marker
            const oldDestMarker = markersRef.current.find(m => m._color === '#ef4444');
            if (oldDestMarker) {
                oldDestMarker.remove();
                markersRef.current = markersRef.current.filter(m => m !== oldDestMarker);
            }

            // Add new destination marker
            const marker = new window.mapboxgl.Marker({ color: '#ef4444' })
                .setLngLat([lng, lat])
                .setPopup(
                    new window.mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                            <div class="p-2">
                                <h3 class="font-semibold text-gray-800 mb-1">Destination</h3>
                                <p class="text-xs text-gray-600">${address}</p>
                            </div>
                        `)
                )
                .addTo(mapRef.current);

            markersRef.current.push(marker);
        });

        return () => {
            clearMarkers();
            clearRoute();
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full h-full md:h-[90vh] md:max-w-6xl md:m-4 flex flex-col md:flex-row overflow-hidden">
                
                {/* Desktop Sidebar - Hidden on Mobile */}
                <div className="hidden md:flex md:w-96 border-r border-gray-200 flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <MdLocationOn className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Map Assistant</h2>
                                <p className="text-xs text-gray-600">Sri Lanka • Search & Navigate</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <MdClose className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Search Bar */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search places in Sri Lanka..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                                />
                            </div>

                            {/* Search Results */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute z-10 mt-2 w-[calc(24rem-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectPlace(result)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <MdLocationOn className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{result.text}</p>
                                                    <p className="text-xs text-gray-600 truncate">{result.place_name}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Route Controls */}
                        <div className="p-4 border-b border-gray-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800">Get Directions</h3>
                                <MdDirections className="h-5 w-5 text-gray-400" />
                            </div>

                            {/* Travel Mode */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setTravelMode('driving')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                        travelMode === 'driving'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    🚗 Drive
                                </button>
                                <button
                                    onClick={() => setTravelMode('walking')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                        travelMode === 'walking'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    🚶 Walk
                                </button>
                                <button
                                    onClick={() => setTravelMode('cycling')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                        travelMode === 'cycling'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    🚴 Bike
                                </button>
                            </div>

                            {/* Origin */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700">From (Origin)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search origin location..."
                                        value={originSearch}
                                        onChange={(e) => {
                                            setOriginSearch(e.target.value);
                                            handleOriginSearch(e.target.value);
                                        }}
                                        className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                    />
                                    {/* Origin Search Results */}
                                    {showOriginResults && originResults.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {originResults.map((result, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSelectOrigin(result)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="flex items-start space-x-2">
                                                        <MdLocationOn className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-800 truncate">{result.text}</p>
                                                            <p className="text-xs text-gray-600 truncate">{result.place_name}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {origin ? (
                                    <div className="text-xs text-gray-700 bg-blue-50 p-2.5 rounded-lg flex items-start justify-between">
                                        <div className="flex items-start space-x-2 flex-1 min-w-0">
                                            <MdLocationOn className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <span className="break-words">{originAddress}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setOrigin(null);
                                                setOriginAddress('');
                                                setOriginSearch('');
                                            }}
                                            className="text-red-500 hover:text-red-700 ml-2"
                                        >
                                            <MdClose className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSetOriginFromCurrentLocation}
                                        disabled={!currentLocation}
                                        className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <MdMyLocation className="h-4 w-4" />
                                        <span>Use My Location</span>
                                    </button>
                                )}
                            </div>

                            {/* Destination */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700">To (Destination)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search destination..."
                                        value={destinationSearch}
                                        onChange={(e) => {
                                            setDestinationSearch(e.target.value);
                                            handleDestinationSearch(e.target.value);
                                        }}
                                        className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                                    />
                                    {/* Destination Search Results */}
                                    {showDestinationResults && destinationResults.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {destinationResults.map((result, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSelectDestination(result)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="flex items-start space-x-2">
                                                        <MdLocationOn className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-800 truncate">{result.text}</p>
                                                            <p className="text-xs text-gray-600 truncate">{result.place_name}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {destination ? (
                                    <div className="text-xs text-gray-700 bg-red-50 p-2.5 rounded-lg flex items-start justify-between">
                                        <div className="flex items-start space-x-2 flex-1 min-w-0">
                                            <MdLocationOn className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className="break-words">{destinationAddress}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setDestination(null);
                                                setDestinationAddress('');
                                                setDestinationSearch('');
                                                // Remove destination marker
                                                const destMarker = markersRef.current.find(m => m._color === '#ef4444');
                                                if (destMarker) {
                                                    destMarker.remove();
                                                    markersRef.current = markersRef.current.filter(m => m !== destMarker);
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 ml-2"
                                        >
                                            <MdClose className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded text-center">
                                        Search or click on map
                                    </div>
                                )}
                            </div>

                            {/* Get Directions Button */}
                            <button
                                onClick={handleGetDirections}
                                disabled={!origin || !destination || isLoadingRoute}
                                className="w-full py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {isLoadingRoute ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <MdNavigation className="h-4 w-4" />
                                        <span>Get Directions</span>
                                    </>
                                )}
                            </button>

                            {/* Clear Route */}
                            {routeInfo && (
                                <button
                                    onClick={() => {
                                        clearRoute();
                                        setShowDirections(false);
                                    }}
                                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                    Clear Route
                                </button>
                            )}
                        </div>

                        {/* Route Info & Directions */}
                        {routeInfo && (
                            <div className="border-b border-gray-200">
                                {/* Route Summary */}
                                <div className="p-4 bg-orange-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <MdRoute className="h-5 w-5 text-orange-600" />
                                            <h3 className="font-semibold text-gray-800">Route Summary</h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-2 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <MdNavigation className="h-4 w-4 text-gray-500" />
                                                <span className="text-xs text-gray-600">Distance</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800">{formatDistance(routeInfo.distance)}</p>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <MdAccessTime className="h-4 w-4 text-gray-500" />
                                                <span className="text-xs text-gray-600">Duration</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800">{formatDuration(routeInfo.duration)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Turn-by-turn Directions */}
                                {showDirections && routeInfo.steps && (
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-800">Turn-by-Turn Directions</h3>
                                            <button
                                                onClick={() => setShowDirections(false)}
                                                className="text-xs text-gray-500 hover:text-gray-700"
                                            >
                                                Hide
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {routeInfo.steps.map((step, index) => (
                                                <div key={index} className="flex space-x-3">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-600">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-800">{step.maneuver.instruction}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {formatDistance(step.distance)}
                                                            {step.name && ` • ${step.name}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!showDirections && routeInfo.steps && (
                                    <div className="p-4">
                                        <button
                                            onClick={() => setShowDirections(true)}
                                            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            Show Turn-by-Turn Directions
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick Actions */}
                        {!routeInfo && (
                            <div className="p-4 border-t border-gray-200">
                                <button
                                    onClick={handleGetCurrentLocation}
                                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                                >
                                    <MdMyLocation className="h-4 w-4" />
                                    <span>Find My Location</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative">
                    <div 
                        ref={mapContainerRef} 
                        className="w-full h-full md:rounded-r-2xl"
                    />
                    
                    {/* Loading overlay */}
                    {!window.mapboxgl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 md:rounded-r-2xl">
                            <div className="text-center">
                                <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-600">Loading map...</p>
                            </div>
                        </div>
                    )}

                    {/* Mobile Controls */}
                    <div className="md:hidden">
                        {/* Mobile Header with Close and Search */}
                        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/50 to-transparent">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg"
                                >
                                    <MdClose className="h-5 w-5 text-gray-700" />
                                </button>
                                
                                {/* Mobile Search Bar */}
                                <div className="flex-1 relative">
                                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search places..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            handleSearch(e.target.value);
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full shadow-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                    />
                                    
                                    {/* Mobile Search Results */}
                                    {showSearchResults && searchResults.length > 0 && (
                                        <div className="absolute z-30 mt-2 w-full bg-white rounded-2xl shadow-xl max-h-64 overflow-y-auto">
                                            {searchResults.map((result, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSelectPlace(result)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <MdLocationOn className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">{result.text}</p>
                                                            <p className="text-xs text-gray-600 truncate">{result.place_name}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Floating Buttons */}
                        <div className="absolute bottom-6 right-4 flex flex-col space-y-3">
                            {/* Get Directions Button */}
                            <button
                                onClick={() => setShowRoutePanel(true)}
                                className="w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
                            >
                                <MdDirections className="h-6 w-6 text-white" />
                            </button>
                            
                            {/* My Location Button */}
                            <button
                                onClick={handleGetCurrentLocation}
                                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <MdMyLocation className="h-6 w-6 text-blue-600" />
                            </button>
                        </div>

                        {/* Mobile Route Planning Panel (Bottom Sheet) */}
                        {showRoutePanel && (
                            <div className="absolute inset-0 z-40 flex items-end">
                                <div 
                                    className="absolute inset-0 bg-black/50"
                                    onClick={() => setShowRoutePanel(false)}
                                ></div>
                                <div className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
                                    {/* Panel Header */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">Get Directions</h3>
                                            <button
                                                onClick={() => setShowRoutePanel(false)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                            >
                                                <MdClose className="h-5 w-5 text-gray-500" />
                                            </button>
                                        </div>
                                        
                                        {/* Travel Mode */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setTravelMode('driving')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                                    travelMode === 'driving'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                🚗 Drive
                                            </button>
                                            <button
                                                onClick={() => setTravelMode('walking')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                                    travelMode === 'walking'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                🚶 Walk
                                            </button>
                                            <button
                                                onClick={() => setTravelMode('cycling')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                                    travelMode === 'cycling'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                🚴 Bike
                                            </button>
                                        </div>
                                    </div>

                                    {/* Panel Content */}
                                    <div className="p-4 space-y-4">
                                        {/* Origin */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">From</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search origin..."
                                                    value={originSearch}
                                                    onChange={(e) => {
                                                        setOriginSearch(e.target.value);
                                                        handleOriginSearch(e.target.value);
                                                    }}
                                                    className="w-full pl-3 pr-3 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                />
                                                {showOriginResults && originResults.length > 0 && (
                                                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                        {originResults.map((result, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleSelectOrigin(result)}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                            >
                                                                <p className="text-sm font-medium text-gray-800 truncate">{result.text}</p>
                                                                <p className="text-xs text-gray-600 truncate">{result.place_name}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {origin ? (
                                                <div className="bg-blue-50 p-3 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-start space-x-2 flex-1 min-w-0">
                                                        <MdLocationOn className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700 break-words">{originAddress}</span>
                                                    </div>
                                                    <button onClick={() => {
                                                        setOrigin(null);
                                                        setOriginAddress('');
                                                        setOriginSearch('');
                                                    }} className="ml-2 text-red-500">
                                                        <MdClose className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handleSetOriginFromCurrentLocation}
                                                    disabled={!currentLocation}
                                                    className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm disabled:opacity-50"
                                                >
                                                    <MdMyLocation className="h-5 w-5" />
                                                    <span>Use My Location</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Destination */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">To</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search destination..."
                                                    value={destinationSearch}
                                                    onChange={(e) => {
                                                        setDestinationSearch(e.target.value);
                                                        handleDestinationSearch(e.target.value);
                                                    }}
                                                    className="w-full pl-3 pr-3 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                                                />
                                                {showDestinationResults && destinationResults.length > 0 && (
                                                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                        {destinationResults.map((result, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleSelectDestination(result)}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                            >
                                                                <p className="text-sm font-medium text-gray-800 truncate">{result.text}</p>
                                                                <p className="text-xs text-gray-600 truncate">{result.place_name}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {destination ? (
                                                <div className="bg-red-50 p-3 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-start space-x-2 flex-1 min-w-0">
                                                        <MdLocationOn className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700 break-words">{destinationAddress}</span>
                                                    </div>
                                                    <button onClick={() => {
                                                        setDestination(null);
                                                        setDestinationAddress('');
                                                        setDestinationSearch('');
                                                        const destMarker = markersRef.current.find(m => m._color === '#ef4444');
                                                        if (destMarker) {
                                                            destMarker.remove();
                                                            markersRef.current = markersRef.current.filter(m => m !== destMarker);
                                                        }
                                                    }} className="ml-2 text-red-500">
                                                        <MdClose className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 text-center py-2">
                                                    Search or tap on map
                                                </div>
                                            )}
                                        </div>

                                        {/* Get Directions Button */}
                                        <button
                                            onClick={handleGetDirections}
                                            disabled={!origin || !destination || isLoadingRoute}
                                            className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                                        >
                                            {isLoadingRoute ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <MdNavigation className="h-5 w-5" />
                                                    <span>Get Directions</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile Route Summary (Bottom Sheet) */}
                        {showRouteSummary && routeInfo && (
                            <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl">
                                <div className="p-4 space-y-3">
                                    {/* Drag Handle */}
                                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2"></div>
                                    
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-800">Route Summary</h3>
                                        <button
                                            onClick={() => {
                                                clearRoute();
                                                setShowRouteSummary(false);
                                            }}
                                            className="text-sm text-red-500 font-medium"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-orange-50 p-3 rounded-xl">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <MdNavigation className="h-4 w-4 text-orange-600" />
                                                <span className="text-xs text-gray-600">Distance</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-800">{formatDistance(routeInfo.distance)}</p>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-xl">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <MdAccessTime className="h-4 w-4 text-orange-600" />
                                                <span className="text-xs text-gray-600">Duration</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-800">{formatDuration(routeInfo.duration)}</p>
                                        </div>
                                    </div>

                                    {routeInfo.steps && (
                                        <button
                                            onClick={() => setShowDirections(!showDirections)}
                                            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
                                        >
                                            {showDirections ? 'Hide' : 'Show'} Turn-by-Turn Directions
                                        </button>
                                    )}

                                    {/* Turn-by-turn (collapsible) */}
                                    {showDirections && routeInfo.steps && (
                                        <div className="max-h-48 overflow-y-auto space-y-2 pt-2">
                                            {routeInfo.steps.map((step, index) => (
                                                <div key={index} className="flex space-x-3 p-2 bg-gray-50 rounded-lg">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-800">{step.maneuver.instruction}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{formatDistance(step.distance)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationMapModal;