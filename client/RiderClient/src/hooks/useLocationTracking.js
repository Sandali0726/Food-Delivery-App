import { useEffect, useCallback, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentLocation, updateCurrentLocation } from '../api/location';

const useLocationTracking = () => {
    const { rider, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const intervalRef = useRef(null);
    const isTrackingRef = useRef(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [permissionAsked, setPermissionAsked] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [currentAddress, setCurrentAddress] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);

    // Function to convert coordinates to address using reverse geocoding
    const reverseGeocode = useCallback(async (lat, lng) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN||"pk.eyJ1IjoiZ2F5YXNoYW4xMjM0IiwiYSI6ImNtamNiZXVpNzAxY3MzZ3ExeG1yamttZDUifQ.1oa7tQENkKEzisCyK2qzbw"}`
            );
            
            if (!response.ok) {
                throw new Error('Geocoding failed');
            }
            
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                const place = data.features[0];
                return place.place_name || place.text || 'Unknown location';
            }
            
            return 'Address not found';
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return 'Unable to get address';
        }
    }, []);

    const updateLocationToServer = useCallback(async () => {
        if (!rider?.email || !isAuthenticated) {
            return;
        }

        try {
            const location = await getCurrentLocation();
            
            const locationData = {
                email: rider.email,
                current_lat: location.latitude,
                current_lng: location.longitude
            };

            await updateCurrentLocation(locationData);
            
            // Get address from coordinates
            const address = await reverseGeocode(location.latitude, location.longitude);
            console.log('Reverse geocoded address:', address);
            
            // Update local state
            setCurrentLocation({
                lat: location.latitude,
                lng: location.longitude,
                accuracy: location.accuracy
            });
            setCurrentAddress(address);
            setLastUpdated(new Date());
            setError(null);
            
            console.log('Location updated successfully:', locationData, 'Address:', address);
        } catch (error) {
            console.error('Failed to update location:', error);
            setError(error.message);
            
            // Handle specific geolocation errors
            if (error.message.includes('timeout')) {
                console.warn('Location timeout - GPS may be slow. Will retry on next interval.');
                return; // Don't show modal for timeout, just log and continue
            }
            
            // Don't show error to user for background location updates
            // unless it's a permission error on first attempt
        }
    }, [rider?.email, isAuthenticated, reverseGeocode]);

    const startLocationTracking = useCallback(async () => {
        if (isTrackingRef.current || !rider?.email || !isAuthenticated) {
            return;
        }

        isTrackingRef.current = true;
        setIsTracking(true);
        setError(null);
        console.log('Starting location tracking for:', rider.email);

        // Initial location update with permission handling
        try {
            await updateLocationToServer();
        } catch (error) {
            console.error('Initial location update failed:', error);
            
            if (error.message.includes('denied') && !permissionAsked) {
                setShowPermissionModal(true);
                setPermissionAsked(true);
                setIsTracking(false);
                isTrackingRef.current = false;
                return;
            }
            
            if (error.message.includes('denied')) {
                console.warn('Location permission denied. Driver location will not be tracked.');
                setIsTracking(false);
                isTrackingRef.current = false;
                return;
            }
            
            if (error.message.includes('timeout')) {
                console.warn('Initial location timeout. Will continue with periodic updates.');
                // Continue with interval setup even if first location fails due to timeout
            }
        }

        // Set up periodic location updates every 2 minutes
        intervalRef.current = setInterval(() => {
            updateLocationToServer();
        }, 2 * 60 * 1000); // 2 minutes

    }, [rider?.email, isAuthenticated, updateLocationToServer, permissionAsked]);

    const stopLocationTracking = useCallback(() => {
        console.log('Stopping location tracking');
        isTrackingRef.current = false;
        setIsTracking(false);
        setCurrentLocation(null);
        setCurrentAddress(null);
        setLastUpdated(null);
        setError(null);
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Start tracking when user is authenticated
    useEffect(() => {
        if (isAuthenticated && rider?.email) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }

        // Cleanup on unmount
        return () => {
            stopLocationTracking();
        };
    }, [isAuthenticated, rider?.email, startLocationTracking, stopLocationTracking]);

    // Stop tracking when tab becomes hidden (optional optimization)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Optionally pause tracking when tab is not visible
                // stopLocationTracking();
            } else if (isAuthenticated && rider?.email) {
                // Resume tracking when tab becomes visible
                // startLocationTracking();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, rider?.email, startLocationTracking, stopLocationTracking]);

    // Handle permission modal responses
    const handleAllowLocation = useCallback(() => {
        setShowPermissionModal(false);
        // Try to start location tracking again
        startLocationTracking();
    }, [startLocationTracking]);

    const handleDenyLocation = useCallback(() => {
        setShowPermissionModal(false);
        setPermissionAsked(true);
        console.log('User denied location permission');
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowPermissionModal(false);
    }, []);

    return {
        updateLocationToServer,
        startLocationTracking,
        stopLocationTracking,
        showPermissionModal,
        handleAllowLocation,
        handleDenyLocation,
        handleCloseModal,
        isTracking,
        currentLocation,
        currentAddress,
        lastUpdated,
        error
    };
};

export default useLocationTracking;