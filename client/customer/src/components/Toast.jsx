import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  FiX, 
  FiAlertCircle, 
  FiInfo, 
  FiXCircle 
} from 'react-icons/fi';
import { FaTruck, FaBoxOpen, FaCheckCircle } from 'react-icons/fa';
import { IoRestaurantOutline, IoNavigate } from 'react-icons/io5';
import { MdRestaurantMenu, MdCancel } from 'react-icons/md';
import notificationSound from '../assets/52pj7t0b7w3-notification-sfx-10.mp3';
const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const audioRef = useRef(null);

  // Define handleClose before it's used in effects
  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      onClose?.();
    }, 300); // Animation duration
  }, [onClose]);

  useEffect(() => {
    if (!message) return;
    // Show toast with animation
    setIsVisible(true);
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Set volume to 50%
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(hideTimer);
  }, [message, duration, handleClose]);
  const getToastConfig = (type) => {
    const configs = {
      success: {
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        icon: FaCheckCircle,
        iconColor: 'text-white',
        borderColor: 'border-green-700',
        shadowColor: 'shadow-lg shadow-green-600/30',
        progressColor: 'bg-green-800'
      },
      error: {
        bgColor: 'bg-red-600',
        textColor: 'text-white',
        icon: FiXCircle,
        iconColor: 'text-white',
        borderColor: 'border-red-700',
        shadowColor: 'shadow-lg shadow-red-600/30',
        progressColor: 'bg-red-800'
      },
      warning: {
        bgColor: 'bg-amber-500',
        textColor: 'text-white',
        icon: FiAlertCircle,
        iconColor: 'text-white',
        borderColor: 'border-amber-600',
        shadowColor: 'shadow-lg shadow-amber-500/30',
        progressColor: 'bg-amber-700'
      },
      info: {
        bgColor: 'bg-blue-600',
        textColor: 'text-white',
        icon: FiInfo,
        iconColor: 'text-white',
        borderColor: 'border-blue-700',
        shadowColor: 'shadow-lg shadow-blue-600/30',
        progressColor: 'bg-blue-800'
      },
      primary: {
        bgColor: 'bg-blue-600',
        textColor: 'text-white',
        icon: FiInfo,
        iconColor: 'text-white',
        borderColor: 'border-blue-700',
        shadowColor: 'shadow-lg shadow-blue-600/30',
        progressColor: 'bg-blue-800'
      },
      danger: {
        bgColor: 'bg-red-600',
        textColor: 'text-white',
        icon: FiXCircle,
        iconColor: 'text-white',
        borderColor: 'border-red-700',
        shadowColor: 'shadow-lg shadow-red-600/30',
        progressColor: 'bg-red-800'
      },
      general: {
        bgColor: 'bg-gray-700',
        textColor: 'text-white',
        icon: FiInfo,
        iconColor: 'text-white',
        borderColor: 'border-gray-800',
        shadowColor: 'shadow-lg shadow-gray-700/30',
        progressColor: 'bg-gray-900'
      },
      // Order status types
      cancel: {
        bgColor: 'bg-red-600',
        textColor: 'text-white',
        icon: MdCancel,
        iconColor: 'text-white',
        borderColor: 'border-red-700',
        shadowColor: 'shadow-lg shadow-red-600/30',
        progressColor: 'bg-red-800'
      },
      confirm: {
        bgColor: 'bg-blue-600',
        textColor: 'text-white',
        icon: FiInfo,
        iconColor: 'text-white',
        borderColor: 'border-blue-700',
        shadowColor: 'shadow-lg shadow-blue-600/30',
        progressColor: 'bg-blue-800'
      },
      accepted: {
        bgColor: 'bg-emerald-600',
        textColor: 'text-white',
        icon: FaCheckCircle,
        iconColor: 'text-white',
        borderColor: 'border-emerald-700',
        shadowColor: 'shadow-lg shadow-emerald-600/30',
        progressColor: 'bg-emerald-800'
      },
      preparing: {
        bgColor: 'bg-amber-600',
        textColor: 'text-white',
        icon: IoRestaurantOutline,
        iconColor: 'text-white',
        borderColor: 'border-amber-700',
        shadowColor: 'shadow-lg shadow-amber-600/30',
        progressColor: 'bg-amber-800'
      },
      ready: {
        bgColor: 'bg-purple-600',
        textColor: 'text-white',
        icon: MdRestaurantMenu,
        iconColor: 'text-white',
        borderColor: 'border-purple-700',
        shadowColor: 'shadow-lg shadow-purple-600/30',
        progressColor: 'bg-purple-800'
      },
      go_to_pickup: {
        bgColor: 'bg-indigo-600',
        textColor: 'text-white',
        icon: IoNavigate,
        iconColor: 'text-white',
        borderColor: 'border-indigo-700',
        shadowColor: 'shadow-lg shadow-indigo-600/30',
        progressColor: 'bg-indigo-800'
      },
      picked_up: {
        bgColor: 'bg-cyan-600',
        textColor: 'text-white',
        icon: FaBoxOpen,
        iconColor: 'text-white',
        borderColor: 'border-cyan-700',
        shadowColor: 'shadow-lg shadow-cyan-600/30',
        progressColor: 'bg-cyan-800'
      },
      on_the_way: {
        bgColor: 'bg-orange-600',
        textColor: 'text-white',
        icon: FaTruck,
        iconColor: 'text-white',
        borderColor: 'border-orange-700',
        shadowColor: 'shadow-lg shadow-orange-600/30',
        progressColor: 'bg-orange-800'
      },
      delivered: {
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        icon: FaCheckCircle,
        iconColor: 'text-white',
        borderColor: 'border-green-700',
        shadowColor: 'shadow-lg shadow-green-600/30',
        progressColor: 'bg-green-800'
      }
    };
    return configs[type.toLowerCase()] || configs.info;
  };
  const config = getToastConfig(type);
  const IconComponent = config.icon;
  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={notificationSound} preload="auto" />
      <div 
        className={`
          fixed top-6 right-6 z-[9999] 
          transform transition-all duration-300 ease-in-out
          ${isLeaving ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
          ${!isLeaving && isVisible ? 'animate-slide-in-from-top' : ''}
        `}
        role="status" 
        aria-live="polite"
      >
        <div 
          className={`
            toast-container
            ${config.bgColor} ${config.textColor} 
            ${config.shadowColor}
            min-w-[320px] max-w-[400px]
            px-4 py-3 pr-10
            rounded-xl
            flex items-center gap-3
            relative overflow-hidden
            hover:scale-[1.02] hover:shadow-xl
            transition-all duration-200 ease-out
            cursor-pointer
            group
          `}
          onClick={handleClose}
        >
          {/* Icon */}
          <div className="flex-shrink-0 relative z-10">
            <div className="flex items-center justify-center">
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>
          </div>
          {/* Message content */}
          <div className="flex-1 relative z-10">
            <div className="text-sm font-medium leading-snug">
              {message}
            </div>
          </div>
          {/* Enhanced close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className={`
              absolute top-1/2 -translate-y-1/2 right-3
              ${config.textColor} hover:bg-black/20 active:bg-black/30
              rounded-full p-1 transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-white/50
              hover:scale-110 active:scale-95
            `}
            aria-label="Close notification"
          >
            <FiX className="w-4 h-4" />
          </button>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden rounded-b-xl">
            <div 
              className={`h-full ${config.progressColor}`}
              style={{
                width: '100%',
                animation: `toast-progress ${duration}ms linear forwards`
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default Toast;
