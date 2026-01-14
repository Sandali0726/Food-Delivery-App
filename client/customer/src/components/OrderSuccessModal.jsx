import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const OrderSuccessModal = ({ isOpen, onClose, orderId = null }) => {
  const [showCheck, setShowCheck] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger checkmark animation
      setTimeout(() => setShowCheck(true), 100);
      // Trigger arrow animation after checkmark
      setTimeout(() => setShowArrow(true), 600);
    } else {
      setShowCheck(false);
      setShowArrow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 p-8 shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        {/* Animated Checkmark with Arrow */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative">
            <CheckCircleIcon
              className={`w-24 h-24 text-green-500 transition-all duration-500 ${
                showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            />
            {/* Animated Circle */}
            <svg
              className="absolute inset-0 w-24 h-24 -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeDasharray="283"
                strokeDashoffset={showCheck ? '0' : '283'}
                className="transition-all duration-700 ease-out"
                style={{
                  strokeLinecap: 'round',
                }}
              />
            </svg>
          </div>

          {/* Animated Arrow */}
          <div
            className={`absolute -bottom-8 transition-all duration-500 ${
              showArrow ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-bounce"
            >
              <path
                d="M20 10 L20 30 M20 30 L14 24 M20 30 L26 24"
                stroke="#FF8C00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </h3>
          <p className="text-gray-600 text-base mb-4">
            Your order has been confirmed and is being processed.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-semibold text-primary">{orderId}</span>
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          View Orders
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessModal;
