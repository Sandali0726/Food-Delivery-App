import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmAddressPromptModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-11/12 max-w-md p-6">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-2" />
          <h2 className="text-lg font-bold text-gray-800">Confirm Your Address</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Please confirm your delivery address before placing the order. This ensures your order is delivered to the correct location.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-1/2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onConfirm}
            className="w-1/2 px-4 py-2 rounded-lg bg-black text-white hover:bg-black/90"
          >
            Confirm Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAddressPromptModal;

