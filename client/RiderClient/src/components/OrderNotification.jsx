import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MdLocationOn,
    MdAttachMoney,
    MdTimer,
    MdStraighten,
    MdClose,
    MdCheckCircle,
    MdCancel,
    MdRestaurant,
    MdPerson,
    MdNotifications
} from 'react-icons/md';
import { acceptAvailableOrder, removeAvailableOrder } from '../features/availableOrdersSlice';
import { rejectOrder } from '../api/delivery';
import { useNotification } from '../contexts/NotificationContext';
import { playSound } from '../utils/audio';

// Global set to track shown notifications and prevent duplicates
const shownNotifications = new Set();

const OrderNotification = ({ notification }) => {
    const dispatch = useDispatch();
    const { rider } = useSelector((state) => state.auth);
    const { removeNotification, showSuccessNotification, showErrorNotification, showInfoNotification, navigationCallbacks } = useNotification();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const hasMountedRef = useRef(false);
    const dismissTimerRef = useRef(null);
    const autoDismissMs = notification?.duration ?? 8000;
    
    const { order } = notification;
    // Build a stable dedupe key from the order identifier and createdAt only.
    // Exclude `notification.id` because it may be unique for the same order and cause duplicates.
    const orderIdentifier = order?.orderId ?? order?.id ?? 'unknown';
    const createdAtStable = order?.createdAt ?? notification?.createdAt ?? '';
    const notificationKey = createdAtStable ? `${orderIdentifier}_${createdAtStable}` : `${orderIdentifier}`;

    // Check for duplicate notification on mount
    useEffect(() => {
        if (hasMountedRef.current) return;
        hasMountedRef.current = true;
        
        if (shownNotifications.has(notificationKey)) {
            console.log('⚠️ Duplicate notification detected, auto-removing:', notificationKey);
            removeNotification(notification.id);
            return;
        }
        
        // Mark as shown
        shownNotifications.add(notificationKey);
        console.log('✅ Notification registered:', notificationKey);
        
        // Attempt to play notification sound; if blocked, it will play after first interaction
        playSound('/bell.mp3', 0.7).then((ok) => {
            if (!ok) {
                console.log('Audio gated by browser; will play after user interaction.');
            }
        }).catch(e => console.log('Audio play error:', e));

        // Also show a system notification which often plays OS sound
        try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification('New Order Available!', {
                    body: `Order #${order?.orderId ?? ''} is ready to accept`,
                    icon: '/favicon.ico',
                    tag: `order-available-${order?.orderId ?? ''}`
                });
            }
        } catch {}
        
        // Auto-cleanup old notifications (keep only last 50)
        if (shownNotifications.size > 50) {
            const notificationsArray = Array.from(shownNotifications);
            shownNotifications.clear();
            notificationsArray.slice(-25).forEach(key => shownNotifications.add(key));
        }
        
        // Cleanup when component unmounts
        return () => {
            // Remove from shown set when notification is removed
            setTimeout(() => {
                shownNotifications.delete(notificationKey);
            }, 1000); // Keep for 1 second after removal to catch immediate duplicates
        };
    }, [notificationKey, notification.id, removeNotification]);

    const handleAccept = async () => {
        try {
            setIsAccepting(true);
            console.log('🎯 Accepting order from notification:', order);
            
            await dispatch(acceptAvailableOrder(order)).unwrap();
            
            // Remove this notification
            removeNotification(notification.id);
            
            // Refresh orders and navigate to My Orders tab
            console.log('🔄 Refreshing orders after acceptance');
            if (navigationCallbacks.onRefreshOrders) {
                navigationCallbacks.onRefreshOrders();
            }
            
            // Wait a moment for data to refresh, then navigate
            setTimeout(() => {
                if (navigationCallbacks.onNavigateToOrders) {
                    navigationCallbacks.onNavigateToOrders();
                }
            }, 500);
            
            // Show success notification
            showSuccessNotification(
                `✅ Order #${order.orderId} accepted! Switched to "My Orders" tab.`,
                5000
            );
            
            // Vibration feedback for success
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }
            
            // Browser notification for success
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Order Accepted!', {
                    body: `You've successfully accepted order #${order.orderId}. Check your active orders.`,
                    icon: '/favicon.ico',
                    tag: 'order-accepted'
                });
            }
            
            // Play success sound (will defer until interaction if needed)
            playSound('/notification-success.mp3', 0.7).catch(e => console.log('Audio play error:', e));
            
        } catch (error) {
            console.error('❌ Error accepting order:', error);
            if(error === "Order not found" || error === "Order already accepted by another rider"){
                showErrorNotification(
                    `Sorry! This order has been taken by another rider.`,
                    5000
                )
            }else{
            showErrorNotification(
                `Failed to accept order: ${error || 'Please try again'}`,
                5000
            );
            }
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
        try {
            setIsRejecting(true);
            console.log('🚫 Rejecting order from notification:', order.orderId);
            
            // Call the API to reject the order
            await rejectOrder(order.orderId, rider?.email);
            
            console.log('✅ Order rejected successfully from notification');
            
            // Remove from available orders list
            dispatch(removeAvailableOrder(order.orderId));
            
            // Remove this notification
            removeNotification(notification.id);
            
            // Show success notification
            showSuccessNotification(
                `❌ Order #${order.orderId} has been rejected.`,
                3000
            );
            
            // Vibration feedback
            if ('vibrate' in navigator) {
                navigator.vibrate([100]);
            }
            
            // Browser notification for rejection
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Order Rejected', {
                    body: `Order #${order.orderId} has been rejected.`,
                    icon: '/favicon.ico',
                    tag: 'order-rejected'
                });
            }
            
        } catch (error) {
            console.error('❌ Error rejecting order from notification:', error);
            showErrorNotification(
                `Failed to reject order: ${error.message || 'Please try again'}`,
                5000
            );
        } finally {
            setIsRejecting(false);
        }
    };

    const handleClose = () => {
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
            dismissTimerRef.current = null;
        }
        removeNotification(notification.id);
    };

    // Auto-dismiss after a while, pause on hover or while acting
    useEffect(() => {
        if (isAccepting || isRejecting || isHovered) {
            if (dismissTimerRef.current) {
                clearTimeout(dismissTimerRef.current);
                dismissTimerRef.current = null;
            }
            return;
        }

        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
        }

        dismissTimerRef.current = setTimeout(() => {
            removeNotification(notification.id);
        }, autoDismissMs);

        return () => {
            if (dismissTimerRef.current) {
                clearTimeout(dismissTimerRef.current);
                dismissTimerRef.current = null;
            }
        };
    }, [notification.id, autoDismissMs, isAccepting, isRejecting, isHovered, removeNotification]);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`bg-white rounded-lg shadow-xl border-l-4 border-blue-500 p-4 mb-3 transform transition-all duration-500 ${
            isRejecting ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MdNotifications className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">New Order Available!</h4>
                        <p className="text-xs text-gray-600">Order #{order.orderId}</p>
                    </div>
                </div>
                <button 
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <MdClose className="h-4 w-4" />
                </button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center space-x-2">
                    <MdStraighten className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">{order.distance}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <MdTimer className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">{order.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <MdAttachMoney className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-bold text-green-600">{order.deliveryPrice?.toFixed(2) || '250.00'}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <MdLocationOn className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-purple-600 truncate">
                        {order.pickupAddress?.split(',')[0] || 'Pickup Location'}
                    </span>
                </div>
            </div>

            {/* Addresses */}
            <div className="space-y-2 mb-4">
                <div className="flex items-start space-x-2">
                    <MdRestaurant className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 line-clamp-1">
                        <span className="font-medium">Pickup: </span>
                        {order.pickupAddress || 'Pickup address not available'}
                    </p>
                </div>
                <div className="flex items-start space-x-2">
                    <MdPerson className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 line-clamp-1">
                        <span className="font-medium">Delivery: </span>
                        {order.deliveryAddress || 'Delivery address not available'}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
                <button
                    onClick={handleAccept}
                    disabled={isAccepting || isRejecting}
                    className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isAccepting 
                            ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                            : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                    }`}
                >
                    <MdCheckCircle className="h-4 w-4" />
                    <span>{isAccepting ? 'Accepting...' : 'Accept'}</span>
                </button>
                
                <button
                    onClick={handleReject}
                    disabled={isAccepting || isRejecting}
                    className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isRejecting
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-500 text-white hover:bg-gray-600 active:scale-95'
                    }`}
                >
                    <MdCancel className="h-4 w-4" />
                    <span>{isRejecting ? 'Rejecting...' : 'Reject'}</span>
                </button>
            </div>
        </div>
    );
};

export default OrderNotification;