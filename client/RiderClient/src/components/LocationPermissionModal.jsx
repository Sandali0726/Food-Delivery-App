import React from 'react';
import { 
    MdLocationOn, 
    MdGpsFixed, 
    MdSecurity, 
    MdClose,
    MdWarning
} from 'react-icons/md';

const LocationPermissionModal = ({ isOpen, onAllow, onDeny, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <MdLocationOn className="h-8 w-8 text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Allow Location Access
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition duration-200"
                        >
                            <MdClose className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Description */}
                    <div className="text-left mb-6">
                        <p className="text-gray-600 mb-4">
                            To provide you with the best delivery experience, Yumy needs access to your location to:
                        </p>
                        
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <MdGpsFixed className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Track your delivery route</p>
                                    <p className="text-xs text-gray-600">Help customers see your real-time location</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <MdLocationOn className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Find nearby delivery requests</p>
                                    <p className="text-xs text-gray-600">Get orders that are closest to you</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <MdSecurity className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Ensure driver safety</p>
                                    <p className="text-xs text-gray-600">Monitor your well-being during deliveries</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-2">
                            <MdSecurity className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <p className="text-xs text-blue-700 font-medium mb-1">Privacy Protected</p>
                                <p className="text-xs text-blue-600">
                                    Your location is only shared with customers during active deliveries and is never stored permanently.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Warning for denial */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-2">
                            <MdWarning className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <p className="text-xs text-yellow-700 font-medium mb-1">Important</p>
                                <p className="text-xs text-yellow-600">
                                    Denying location access will limit your ability to receive delivery requests and may affect your earnings.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={onAllow}
                            className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-300 font-semibold flex items-center justify-center"
                        >
                            <MdLocationOn className="h-5 w-5 mr-2" />
                            Allow Location Access
                        </button>
                        
                        <button
                            onClick={onDeny}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition duration-300 font-medium"
                        >
                            Not Now
                        </button>
                    </div>

                    {/* Help Text */}
                    <p className="text-xs text-gray-500 mt-4">
                        You can change this setting anytime in your browser settings or profile preferences.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionModal;