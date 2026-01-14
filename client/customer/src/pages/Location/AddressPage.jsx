import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinIcon, MagnifyingGlassIcon, GlobeAltIcon, ArrowLeftIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import SetOnMap from "./SetOnMap";

export default function AddressPage() {
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const currentLocation = () => {
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          try {
            // Use OpenStreetMap Nominatim to reverse geocode coordinates to a plain address
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=25&addressdetails=1`,
                { headers: { "User-Agent": "PickMe-Clone" } }
            );
            const data = await res.json();
            const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

            // Save current location info in localStorage
            localStorage.setItem("userLocationLat", lat);
            localStorage.setItem("userLocationLng", lng);
            localStorage.setItem("userLocationAddress", address);

            navigate(-1);
          } catch (error) {
            console.error("Geocoding failed:", error);
            alert("Failed to get address from your location");
            navigate(-1);
          }
        },
        (error) => {
          console.error("Geolocation failed:", error);
          alert("Unable to get your current location. Please enable location services.");
        }
    );
  };

  const handleSavedAddresses = () => {
    navigate("/saved-addresses");
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="w-full bg-gradient-to-r from-primary to-orange-500 shadow-lg">
          <div className="flex items-center justify-between px-4 py-4">
            <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Select Location</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-4">

          {/* Current Location Card */}
          <div
              onClick={currentLocation}
              className="bg-white rounded-xl shadow-sm border border-gray-400 p-5 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-98"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Your Current Location</h3>
                <p className="text-sm text-gray-500">Use GPS to detect your current location</p>
              </div>
            </div>
          </div>

          {/* Set on Map Card */}
          <div
              onClick={() => setIsMapOpen(true)}
              className="bg-white rounded-xl shadow-sm border border-gray-400 p-5 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-98"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <GlobeAltIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Set on Map</h3>
                <p className="text-sm text-gray-500">Choose your location on an interactive map</p>
              </div>
            </div>
          </div>

          {/* Saved Addresses Card */}
          <div
              onClick={handleSavedAddresses}
              className="bg-white rounded-xl shadow-sm border border-gray-400 p-5 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-98"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookmarkIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Saved Addresses</h3>
                <p className="text-sm text-gray-500">Choose from your saved locations</p>
              </div>
            </div>
          </div>

          {/* Search Address Card */}
          <div
              onClick={() => navigate("/search-address")}
              className="bg-white rounded-xl shadow-sm border border-gray-400 p-5 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-98"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Search Address</h3>
                <p className="text-sm text-gray-500">Type to search for a specific address</p>
              </div>
            </div>
          </div>

        </div>

        {/* Map Modal */}
        {isMapOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-5xl h-[80vh] relative">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Select Location on Map</h3>
                  <button onClick={() => setIsMapOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="w-full h-[calc(80vh-56px)]">
                  <SetOnMap onSelectLocation={(lat, lng, address) => {
                    // you can save to localStorage or state
                    localStorage.setItem("userLocationLat", lat);
                    localStorage.setItem("userLocationLng", lng);
                    localStorage.setItem("userLocationAddress", address);
                    setIsMapOpen(false);
                    // navigate(-1);
                  }} />
                </div>
              </div>
            </div>
        )}

        <div className="h-20"></div>
      </div>
  );
}
