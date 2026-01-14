import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const DeleteSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-11/12 max-w-md p-6">
        <div className="flex items-center mb-4">
          <CheckCircleIcon className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-lg font-bold text-gray-800">Order Cancelled</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          The order has been cancelled successfully.
        </p>
        <div className="flex">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSuccessModal;

