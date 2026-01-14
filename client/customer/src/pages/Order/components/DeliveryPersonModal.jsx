import React from 'react';
import { XMarkIcon, UserCircleIcon, PhoneIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const DeliveryPersonModal = ({ isOpen, onClose, deliveryPerson, onReviewClick }) => {
  if (!isOpen) return null;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => {
      if (index < Math.floor(rating)) {
        return <StarIconSolid key={index} className="w-4 h-4 text-yellow-400" />;
      }
      return <StarIcon key={index} className="w-4 h-4 text-gray-300" />;
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Delivery Person</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          {deliveryPerson.profileImage ? (
            <img
              src={deliveryPerson.profileImage}
              alt={deliveryPerson.name}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserCircleIcon className="w-16 h-16 text-primary" />
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {deliveryPerson.name || 'Delivery Person'}
          </h3>

          {deliveryPerson.rating !== undefined && deliveryPerson.rating !== null && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-0.5">
                {renderStars(deliveryPerson.rating)}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {Number(deliveryPerson.rating).toFixed(1)}
              </span>
            </div>
          )}
          {deliveryPerson.totalDeliveries !== undefined && (
            <div className="text-sm text-gray-500 mb-2">
              ({deliveryPerson.totalDeliveries} deliveries)
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          {deliveryPerson.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <PhoneIcon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                <p className="text-sm font-semibold text-gray-800">
                  {deliveryPerson.phone}
                </p>
              </div>
            </div>
          )}

          {/* Vehicle Type - always show, default to Motorcycle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">🛵</span>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Vehicle</p>
              <p className="text-sm font-semibold text-gray-800">
                {deliveryPerson.vehicleType || 'Motorcycle'}
              </p>
            </div>
          </div>

          {deliveryPerson.vehicleNumber && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">🔢</span>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Vehicle Number</p>
                <p className="text-sm font-semibold text-gray-800">
                  {deliveryPerson.vehicleNumber}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Review Button */}
        <button
          onClick={() => {
            onReviewClick();
            onClose();
          }}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Add Review
        </button>
      </div>
    </div>
  );
};

export default DeliveryPersonModal;
