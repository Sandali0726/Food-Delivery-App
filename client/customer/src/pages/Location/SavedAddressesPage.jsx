import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, TrashIcon, MapPinIcon, HomeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import SetOnMapAddress from "./SetOnMapAddress";
import {addressAPI} from "../../services/api";

export default function SavedAddressesPage() {
  const navigate = useNavigate();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    addressAPI
        .getByEmail(email)
        .then(res => {
          // Normalize API data: ensure it's always an array
          const data = res?.data;
          const list = Array.isArray(data) ? data : (data ? [data] : []);
          setSavedAddresses(list);
        })
        .catch(err => {
          console.error("Failed to load addresses", err);
          setSavedAddresses([]); // ensure array to avoid map errors
        });
  }, []);

  const selectAddress = (address) => {
      localStorage.setItem("userLocationAddress", address.address);
      localStorage.setItem("userLocationLat", address.lat);
      localStorage.setItem("userLocationLng", address.lng);
      navigate(-2);

  };

  const handleAddNew = () => setIsMapOpen(true);

  const handleDelete = (addressId) => {
    addressAPI.delete(addressId)
        .then(() => {
          setSavedAddresses(prev => (Array.isArray(prev) ? prev.filter(addr => addr.id !== addressId) : []));
        })
        .catch(err => {
          console.error("Failed to delete address", err);
        });
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="w-full bg-gradient-to-r from-primary to-orange-500 shadow-lg">
          <div className="flex items-center justify-between px-4 py-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <ArrowLeftIcon className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Saved Addresses</h1>
            <div className="w-10"></div>
              {/* Add New Address */}
              <button
                  onClick={handleAddNew}
                  className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-orange-400 text-orange-600 rounded-xl hover:bg-gradient-to-r hover:from-primary hover:to-orange-500 hover:text-white hover:border-transparent transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
              >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add New Address</span>
              </button>
          </div>
        </div>

        <div className="p-4">

          {/* Map Modal */}
          {isMapOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                <div className="bg-white w-[95vw] max-w-5xl h-[80vh] rounded-xl overflow-hidden">
                  <SetOnMapAddress
                      onSave={(newAddress) => {
                        setSavedAddresses(prev => {
                          const base = Array.isArray(prev) ? prev : [];
                          const updated = [...base, newAddress];
                          localStorage.setItem("savedAddresses", JSON.stringify(updated));
                          return updated;
                        });
                        setIsMapOpen(false);
                      }}
                      onCancel={() => setIsMapOpen(false)}
                  />
                </div>
              </div>
          )}

          {/* Saved Addresses List */}
          <div className="space-y-4 px-4">
            {(Array.isArray(savedAddresses) ? savedAddresses : []).map(address => {
              const getAddressIcon = (label) => {
                const lowerLabel = label?.toLowerCase() || '';
                if (lowerLabel.includes('home')) return HomeIcon;
                if (lowerLabel.includes('work') || lowerLabel.includes('office')) return BuildingOfficeIcon;
                return MapPinIcon;
              };

              const IconComponent = getAddressIcon(address.label);

              return (
                <div
                    key={address.id}
                    className={`group bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-orange-100 px-10 ${
                        selectedAddress?.id === address.id 
                          ? 'border-primary shadow-lg shadow-orange-100 scale-[1.02]' 
                          : 'border-gray-200 hover:border-primary/40'
                    }`}
                    onClick={() => setSelectedAddress(address)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        selectedAddress?.id === address.id 
                          ? 'bg-gradient-to-br from-primary to-orange-500 text-white'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{address.label}</h3>
                        {selectedAddress?.id === address.id && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {address.address}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address.id);
                        }}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200 group/btn"
                        title="Delete address"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          {selectedAddress && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl">
                <button
                    onClick={() => selectAddress(selectedAddress)}
                    className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Confirm Location
                </button>
              </div>
          )}
        </div>
      </div>
  );
}
