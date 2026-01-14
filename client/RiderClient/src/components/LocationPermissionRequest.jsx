import React, { useState } from 'react';
import { MdLocationOn, MdGpsFixed, MdCancel, MdInfo } from 'react-icons/md';

const LocationPermissionRequest = ({ onPermissionGranted, onPermissionDenied, onClose }) => {
    const [isRequesting, setIsRequesting] = useState(false);

    const requestLocationPermission = async () => {
        setIsRequesting(true);
        
        try {
            // Request permission
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // Permission granted and location obtained
                        onPermissionGranted({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                        setIsRequesting(false);
                    },
                    (error) => {
                        // Permission denied or error occurred
                        console.error('Location permission error:', error);
                        onPermissionDenied(error);
                        setIsRequesting(false);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                throw new Error('Geolocation is not supported by this browser');
            }
        } catch (error) {
            console.error('Location request failed:', error);
            onPermissionDenied(error);
            setIsRequesting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                        <MdLocationOn className="h-8 w-8 text-orange-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        Enable Location Services
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                        <p className="text-gray-600">
                            To provide the best delivery experience, Yumy needs access to your location.
                        </p>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <MdInfo className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="text-left">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Why we need your location:</h4>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Match you with nearby delivery orders</li>
                                        <li>• Provide accurate delivery time estimates</li>
                                        <li>• Help customers track their orders</li>
                                        <li>• Optimize your delivery routes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <button
                            onClick={requestLocationPermission}
                            disabled={isRequesting}
                            className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isRequesting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Requesting Permission...
                                </>
                            ) : (
                                <>
                                    <MdGpsFixed className="h-5 w-5 mr-2" />
                                    Allow Location Access
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={onClose}
                            disabled={isRequesting}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <MdCancel className="h-5 w-5 mr-2" />
                            Skip for Now
                        </button>
                    </div>
                    
                    <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-yellow-700 text-xs">
                            <strong>Note:</strong> You can change location permissions anytime in your browser settings.
                            Location data is only used for delivery services and is not shared with third parties.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionRequest;