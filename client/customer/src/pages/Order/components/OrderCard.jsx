import React from 'react';
import { UserCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { RiderDetails } from "../../../Function/OrderFunction";
const OrderCard = ({ order, onClick, onDeliveryPersonClick, onReviewRestaurantClick, onRequestCancel, onTrackOrderClick }) => {
  const status = (order?.status || '').toUpperCase();
  const getStatusColorClass = (s) => {
    switch ((s || '').toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-500 text-white';
      case 'PICKUP':
      case 'CONFIRM':
      case 'ACCEPTED':
        return 'bg-yellow-500 text-white';
      case 'PREPARING':
        return 'bg-orange-500 text-white';
      case 'READY':
      case 'GO_TO_PICKUP':
        return 'bg-blue-500 text-white';
      case 'PICKED_UP':
      case 'ON_THE_WAY':
        return 'bg-purple-500 text-white';
      case 'CANCEL':
        return 'bg-red-500 text-white';
      default:
        return 'bg-primary text-white';
    }
  };
  const orderId = order.id || order.orderId;
  const orderPrice = Number(order.orderPrice || 0);
  const deliveryPrice = Number(order.deliveryPrice || 0);
  const total = orderPrice + deliveryPrice;
  const deliveryOtp = order.otp;
  //console.log(order.address)
  return (
    <div
      className="bg-white/95 backdrop-blur-md rounded-xl p-4 sm:p-5 border-2 border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-primary hover:scale-[1.02] hover:bg-white group"
    >
      {/* Header: Restaurant name + Status */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-primary transition-colors">
            {order.restaurantName || 'Restaurant'}
          </h3>
          <p className="text-sm font-semibold text-gray-900">Order #{orderId}</p>
        </div>
        {/* Status Badge - More Prominent */}
        <div
          className={`inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-bold ${getStatusColorClass(status)} whitespace-normal sm:whitespace-nowrap text-center shadow-lg border-2 border-white min-h-[36px]`}
        >
          <span className="capitalize tracking-wide break-words">
            {status.replace(/_/g, ' ').toLowerCase() || 'PENDING'}
          </span>
        </div>
        {/* Cancel button for CONFIRM status */}
        {status === 'CONFIRM' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequestCancel?.(orderId);
            }}
            className="px-2.5 sm:px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-[11px] sm:text-xs font-semibold hover:bg-red-200 transition-colors flex items-center gap-1"
            title="Cancel Order"
            aria-label="Cancel Order"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m3-3h4a1 1 0 011 1v1H9V5a1 1 0 011-1z"
              />
            </svg>
            Cancel
          </button>
        )}
      </div>
      {/* OTP Display - Without Icon */}
      {deliveryOtp && (
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 border-2 border-indigo-300">
          <span className="text-sm font-bold text-gray-900">OTP: <span className="text-indigo-700 tracking-widest">{String(deliveryOtp)}</span></span>
        </div>
      )}
      {/* Total Amount - Black Color */}
      <div className="mb-4 pb-4 border-b-2 border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-gray-900 font-bold text-base">Total Amount</span>
          <span className="text-2xl font-extrabold text-gray-900 group-hover:scale-105 transition-transform">${total.toFixed(2)}</span>
        </div>
      </div>
      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        {/* Delivery Person Icon */}
        {order.riderEmail && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const identifier = order.riderEmail;
                const details = await RiderDetails(identifier);
                onDeliveryPersonClick?.({ ...details, email: identifier, riderEmail: identifier, orderId });
              } catch (err) {
                console.error('Failed to fetch rider details', err);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
            title="View delivery person"
            aria-label="View delivery person"
          >
            <UserCircleIcon className="w-7 h-7 text-gray-900" />
          </button>
        )}
      </div>
      {/* Bottom Buttons - Same Line for Delivered Orders */}
      <div className="flex gap-2 items-center justify-center">
        {/* Review Restaurant Button - Only for delivered orders */}
        {status === 'DELIVERED' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReviewRestaurantClick?.(order);
            }}
            className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-md"
          >
            <StarIcon className="w-5 h-5" />
            Review
          </button>
        )}
        {/* Track Your Order Button - Only show for orders being delivered (PICKED_UP, ON_THE_WAY) */}
        {(status === 'PICKED_UP' || status === 'ON_THE_WAY') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrackOrderClick?.(order);
            }}
            className="w-full max-w-xs px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 20l-6-6h4V6h4v8h4l-6 6z" />
            </svg>
            Track Order
          </button>
        )}
        {/* View Details Button */}
        <button
          onClick={onClick}
          className={`${status === 'DELIVERED' ? 'flex-1' : 'w-full max-w-xs'} px-4 py-2.5 bg-green-600 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          View Details
        </button>
      </div>
    </div>
  );
};
export default OrderCard;
