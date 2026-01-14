import React from "react";

export default function FarAwayAddressModal({ isOpen, onClose, onGoHome }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 z-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Address Too Far From Restaurant
          </h2>
          <p className="text-sm text-gray-600">
            You are more than 5 km away from this restaurant. Please change your
            delivery location on the Home page and place an order from a restaurant
            near you.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onGoHome}
            className="w-full sm:w-1/2 px-4 py-3 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-1/2 px-4 py-3 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

