import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MdLocationOn,
    MdAttachMoney,
    MdTimer,
    MdCheckCircle,
    MdCancel,
    MdStraighten,
    MdRestaurant,
    MdPerson,
    MdDirections,
    MdExpandMore,
    MdExpandLess
} from 'react-icons/md';
import { 
    acceptAvailableOrder,
    removeAvailableOrder,
    selectAcceptOrderError
} from '../features/availableOrdersSlice';
import { rejectOrder } from '../api/delivery';
import { useNotification } from '../contexts/NotificationContext';

const AvailableOrderCard = ({ order }) => {
    const dispatch = useDispatch();
    const acceptError = useSelector(selectAcceptOrderError);
    const { rider } = useSelector((state) => state.auth);
    const { showSuccessNotification, showErrorNotification, navigationCallbacks } = useNotification();
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isAcceptingOrder, setIsAcceptingOrder] = useState(false);
    const [rejectError, setRejectError] = useState(null);

    const handleAcceptOrder = async () => {
        try {
            setIsAcceptingOrder(true);
            console.log('🎯 Accepting order from card:', order);
            
            // Pass the complete order object with distance and time data
            await dispatch(acceptAvailableOrder(order)).unwrap();
            
            console.log('✅ Order accepted successfully');
            
            // Set the accepted order as active in dashboard
            if (navigationCallbacks.onOrderAccepted) {
                navigationCallbacks.onOrderAccepted(order);
            }
            
            // Show success notification
            showSuccessNotification(
                `✅ Order #${order.orderId} accepted! Switched to "My Orders" tab.`,
                5000
            );
            
            // Wait a moment for data to refresh, then navigate
            setTimeout(() => {
                if (navigationCallbacks.onNavigateToOrders) {
                    navigationCallbacks.onNavigateToOrders();
                }
            }, 500);
            
            // Vibration feedback for success
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }
            
        } catch (error) {
            console.error('❌ Error accepting order:', error);
            showErrorNotification(
                `Failed to accept order: ${error.message || 'Please try again'}`,
                5000
            );
        } finally {
            setIsAcceptingOrder(false);
        }
    };

    const handleRejectOrder = async () => {
        try {
            setIsRejecting(true);
            setRejectError(null);
            
            console.log('🚫 Rejecting order from card:', order.orderId);
            
            // Call the API to reject the order
            await rejectOrder(order.orderId, rider?.email);
            
            console.log('✅ Order rejected successfully');
            
            // Remove from available orders list
            dispatch(removeAvailableOrder(order.orderId));
            
            // Show success notification
            showSuccessNotification(
                `❌ Order #${order.orderId} has been rejected.`,
                3000
            );
            
            // Vibration feedback
            if ('vibrate' in navigator) {
                navigator.vibrate([100]);
            }
            
        } catch (error) {
            console.error('❌ Error rejecting order:', error);
            setRejectError(error.message || 'Failed to reject order');
            showErrorNotification(
                `Failed to reject order: ${error.message || 'Please try again'}`,
                5000
            );
        } finally {
            setIsRejecting(false);
        }
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 mb-4">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <MdRestaurant className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Order #{order.orderId}</h3>
                            <p className="text-gray-600 text-sm">New delivery request</p>
                        </div>
                    </div>
                    
                    {/* Delivery Price - Prominent */}
                    <div className="text-right">
                        <div className="bg-green-100 rounded-lg p-3">
                            <div className="flex items-center space-x-1 text-green-600">
                                <MdAttachMoney className="h-6 w-6" />
                                <span className="text-2xl font-bold">
                                    {typeof order.deliveryPrice === 'number' 
                                        ? order.deliveryPrice.toFixed(2) 
                                        : order.deliveryPrice || '250.00'}
                                </span>
                            </div>
                            <p className="text-xs text-green-600 font-medium">Delivery fee</p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Distance TO PICKUP - Highlighted */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MdStraighten className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-blue-600">
                                {order.distance || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">To Pickup</p>
                        </div>
                    </div>

                    {/* Time TO PICKUP - Highlighted */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MdTimer className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-orange-600">
                                {order.estimatedTime || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">To Pickup</p>
                        </div>
                    </div>

                    {/* Order Price */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MdAttachMoney className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">
                                {order.orderPrice ? order.orderPrice.toFixed(2) : '0.00'}
                            </p>
                            <p className="text-xs text-gray-500">Order value</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Details */}
            <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Location */}
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <MdLocationOn className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">Pickup</span>
                        </div>
                        <div className="ml-6">
                            <p className="text-sm font-medium text-gray-900">
                                {order.pickupAddress || 'Loading address...'}
                                
                            </p>
                            <p className="text-xs text-gray-600">
                                {order.restaurantEmail || 'Restaurant'}
                            </p>
                        </div>
                    </div>

                    {/* Delivery Location */}
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <MdLocationOn className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Delivery</span>
                        </div>
                        <div className="ml-6">
                            <p className="text-sm font-medium text-gray-900">
                                {order.deliveryAddress || 'Loading address...'}
                                
                            </p>
                            <p className="text-xs text-gray-600">
                                {order.customerEmail || 'Customer'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Details Button */}
                <button
                    onClick={toggleExpanded}
                    className="mt-4 text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1 transition duration-200"
                >
                    <MdDirections className="h-4 w-4" />
                    <span>{isExpanded ? 'Hide details' : 'View details'}</span>
                    {isExpanded ? <MdExpandLess className="h-4 w-4" /> : <MdExpandMore className="h-4 w-4" />}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {/* <div>
                                <p className="font-medium text-gray-700 mb-1">Pickup Coordinates</p>
                                <p className="text-gray-600">
                                    {order.pickupLat?.toFixed(6)}, {order.pickupLng?.toFixed(6)}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700 mb-1">Delivery Coordinates</p>
                                <p className="text-gray-600">
                                    {order.dropLat?.toFixed(6)}, {order.dropLng?.toFixed(6)}
                                </p>
                            </div> */}
                            <div>
                                <p className="font-medium text-gray-700 mb-1">Distance to Pickup</p>
                                <p className="text-gray-600 font-mono text-lg font-semibold">{order.pickupDistance || order.distance || 'N/A'} km</p>
                            </div>
                            {order.pickupToDropDistance && (
                                <div>
                                    <p className="font-medium text-gray-700 mb-1">Pickup to Delivery</p>
                                    <p className="text-gray-600 font-mono text-lg font-semibold ">{order.pickupToDropDistance} km</p>
                                </div>
                            )}
                            {order.pickupToDropTime && (
                                <div>
                                    <p className="font-medium text-gray-700 mb-1">Delivery Time</p>
                                    <p className="text-gray-600 font-mono text-lg font-semibold">{order.pickupToDropTime} min</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-6">
                <div className="flex space-x-4">
                    {/* Accept Button */}
                    <button
                        onClick={handleAcceptOrder}
                        disabled={isAcceptingOrder || isRejecting}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                        {isAcceptingOrder ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Accepting...
                            </>
                        ) : (
                            <>
                                <MdCheckCircle className="h-5 w-5 mr-2" />
                                Accept Order
                            </>
                        )}
                    </button>

                    {/* Reject Button */}
                    <button
                        onClick={handleRejectOrder}
                        disabled={isAcceptingOrder || isRejecting}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                        {isRejecting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <MdCancel className="h-5 w-5 mr-2" />
                                Reject
                            </>
                        )}
                    </button>
                </div>

                {/* Error Display */}
                {(acceptError || rejectError) && (
                    <div className="mt-3 text-center text-sm text-red-600">
                        {typeof acceptError === 'string' ? acceptError : 
                         typeof rejectError === 'string' ? rejectError : 
                         'An error occurred'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableOrderCard;