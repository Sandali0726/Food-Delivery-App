import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const SuccessModal = ({ isOpen, onClose, message = 'Success!', autoCloseDuration = 2000 }) => {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after modal appears
      setTimeout(() => setShowCheck(true), 100);

      // Auto close after duration
      if (autoCloseDuration > 0) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDuration);

        return () => clearTimeout(timer);
      }
    } else {
      setShowCheck(false);
    }
  }, [isOpen, onClose, autoCloseDuration]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm mx-4 p-8 shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        {/* Animated Checkmark */}
        <div className="flex justify-center mb-6">
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
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Success!
          </h3>
          <p className="text-gray-600 text-base">
            {message}
          </p>
        </div>
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
      `}</style>
    </div>
  );
};

export default SuccessModal;

