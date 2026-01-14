import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    MdExpandMore,
    MdExpandLess,
    MdCheckCircle,
    MdTimer,
    MdPhone,
    MdDirections,
    MdDeliveryDining,
    MdRestaurant,
    MdPerson,
    MdRefresh,
    MdCancel,
    MdError,
    MdCheck
} from 'react-icons/md';
import { 
    updateOrderStatus, 
    selectStatusUpdateLoading,
    setActiveOrder
} from '../features/ordersSlice';
import { DELIVERY_STATUS } from '../api/delivery';
import OTPModal from './OTPModal';
import FailureReasonModal from './FailureReasonModal';
import ConfirmationModal from './ConfirmationModal';

const OrderCard = ({ order, isActiveOrder = false, onStatusUpdate }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isUpdatingStatus = useSelector(selectStatusUpdateLoading);
    
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [showPickupConfirmModal, setShowPickupConfirmModal] = useState(false);

    if (!order) return null;


    const getStatusColor = (status) => {
        switch (status) {
            case DELIVERY_STATUS.ACCEPTED:
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case DELIVERY_STATUS.GO_TO_PICKUP:
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case DELIVERY_STATUS.PICKED_UP:
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case DELIVERY_STATUS.ON_THE_WAY:
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case DELIVERY_STATUS.DELIVERED:
                return 'bg-green-100 text-green-800 border-green-200';
            case DELIVERY_STATUS.CANCELLED:
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case DELIVERY_STATUS.FAILED:
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatStatus = (status) => {
        const statusMap = {
            [DELIVERY_STATUS.ACCEPTED]: 'Order Accepted',
            [DELIVERY_STATUS.GO_TO_PICKUP]: 'Go to Pickup',
            [DELIVERY_STATUS.PICKED_UP]: 'Picked Up',
            [DELIVERY_STATUS.ON_THE_WAY]: 'On the Way',
            [DELIVERY_STATUS.DELIVERED]: 'Delivered',
            [DELIVERY_STATUS.CANCELLED]: 'Cancelled',
            [DELIVERY_STATUS.FAILED]: 'Failed'
        };
        return statusMap[status] || status;
    };

    const getProgressPercentage = () => {
        const statusOrder = [
            DELIVERY_STATUS.ACCEPTED,
            DELIVERY_STATUS.GO_TO_PICKUP,
            DELIVERY_STATUS.PICKED_UP,
            DELIVERY_STATUS.ON_THE_WAY,
            DELIVERY_STATUS.DELIVERED
        ];
        const currentIndex = statusOrder.indexOf(order.status);
        return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
    };

    const steps = [
        {
            status: DELIVERY_STATUS.ACCEPTED,
            title: 'Order Accepted',
            description: 'Order has been assigned to you',
            icon: MdCheckCircle,
            completed: true
        },
        {
            status: DELIVERY_STATUS.GO_TO_PICKUP,
            title: 'Go to Pickup',
            description: 'Navigate to restaurant',
            icon: MdDirections,
            completed: [DELIVERY_STATUS.GO_TO_PICKUP, DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.ON_THE_WAY, DELIVERY_STATUS.DELIVERED].includes(order.status)
        },
        {
            status: DELIVERY_STATUS.PICKED_UP,
            title: 'Order Picked Up',
            description: 'Collected from restaurant',
            icon: MdRestaurant,
            completed: [DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.ON_THE_WAY, DELIVERY_STATUS.DELIVERED].includes(order.status)
        },
        {
            status: DELIVERY_STATUS.ON_THE_WAY,
            title: 'On the Way',
            description: 'Delivering to customer',
            icon: MdDeliveryDining,
            completed: [DELIVERY_STATUS.ON_THE_WAY, DELIVERY_STATUS.DELIVERED].includes(order.status)
        },
        {
            status: DELIVERY_STATUS.DELIVERED,
            title: 'Delivered',
            description: 'Order completed successfully',
            icon: MdCheckCircle,
            completed: order.status === DELIVERY_STATUS.DELIVERED
        }
    ];

    const handleStatusUpdate = async (newStatus) => {
        try {
            const result = await dispatch(updateOrderStatus({ 
                orderId: order.orderId, // Use the orderId field for API calls
                status: newStatus,
                currentOrder: order
            })).unwrap();
            const updatedOrder = result?.enhancedOrder || order;
            
            // Set this order as the active order with the freshest data
            dispatch(setActiveOrder(updatedOrder));
            
            // Track this order as active since status was updated
            if (onStatusUpdate) {
                onStatusUpdate(updatedOrder);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleNavigateToMap = (mapType) => {
        // Set this order as the active order when navigating
        dispatch(setActiveOrder(order));
        navigate('/delivery-map', { 
            state: { 
                order, 
                mapType 
            } 
        });
    };

    const handleNavigateToProgress = () => {
        navigate(`/order-progress/${order.orderId}`, {
            state: { order }
        });
    };

    const handleOTPSubmit = async (otp) => {
        console.log('OTP validated successfully:', otp);
        try {
            await handleStatusUpdate(DELIVERY_STATUS.DELIVERED);
            setShowOTPModal(false);
            // Success feedback is handled by the status update
        } catch (error) {
            console.error('Failed to update delivery status:', error);
            // Error will be handled by the Redux state and shown in UI
            // Keep modal open so user can try again
        }
    };

    const handleFailureSubmit = async (reason) => {
        console.log('Failure reason:', reason);
        await handleStatusUpdate(DELIVERY_STATUS.FAILED);
        setShowFailureModal(false);
    };

    const handlePickupConfirm = async () => {
        await handleStatusUpdate(DELIVERY_STATUS.PICKED_UP);
        setShowPickupConfirmModal(false);
    };

    const getNextAction = () => {
        console.log('📊 Order status for order', order.orderId, ':', order.status);
        
        switch (order.status) {
            case DELIVERY_STATUS.ACCEPTED:
            case DELIVERY_STATUS.GO_TO_PICKUP:
                console.log('🚗 Showing Navigate to Pickup action');
                return {
                    text: 'Navigate to Pickup',
                    action: async () => {
                        // Update status to GO_TO_PICKUP when navigating to pickup
                        if (order.status === DELIVERY_STATUS.ACCEPTED) {
                            await handleStatusUpdate(DELIVERY_STATUS.GO_TO_PICKUP);
                        }
                        handleNavigateToMap('pickup');
                    },
                    icon: MdDirections,
                    color: 'bg-blue-500 hover:bg-blue-600'
                };
            case DELIVERY_STATUS.PICKED_UP:
            case DELIVERY_STATUS.ON_THE_WAY:
                console.log('🛒 Showing Navigate to Customer action');
                return {
                    text: 'Navigate to Customer',
                    action: async () => {
                        // Update status to ON_THE_WAY only if currently PICKED_UP
                        if (order.status === DELIVERY_STATUS.PICKED_UP) {
                            await handleStatusUpdate(DELIVERY_STATUS.ON_THE_WAY);
                        }
                        handleNavigateToMap('delivery');
                    },
                    icon: MdDirections,
                    color: 'bg-green-500 hover:bg-green-600'
                };
            default:
                console.log('❌ No action available for status:', order.status);
                return null;
        }
    };

    const nextAction = getNextAction();
    const progressPercentage = getProgressPercentage();
    const isCompleted = [DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.CANCELLED, DELIVERY_STATUS.FAILED].includes(order.status);

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Card Header - Always Visible */}
            <div 
                className="p-6 cursor-pointer"
                onClick={handleNavigateToProgress}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <MdDeliveryDining className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Order #{order.orderId}</h3>
                            <p className="text-gray-600">{order.restaurant.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                        </span>
                        <div className="text-sm text-gray-500 font-medium">
                            View Details →
                        </div>
                    </div>
                </div>

                {/* Quick Info Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <MdPerson className="h-4 w-4" />
                            <span>{order.customer.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {order.status === DELIVERY_STATUS.DELIVERED ? ( 
                                <>
                                    <MdCheck className="h-4 w-4" />
                                    <span>{new Date(order.delivered_at).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                                })}</span>
                                </>
                            ) : (
                                <div className="flex items-center space-x-1">
                                    <MdTimer className="h-4 w-4" />
                                    <span>
                                        {order.routeTime || order.estimatedTime}
                                        {order.distance && ` and ${order.distance}`}
                                        <span className="text-gray-500">
                                            {' '}
                                            {(order.status === DELIVERY_STATUS.ACCEPTED || order.status === DELIVERY_STATUS.GO_TO_PICKUP) 
                                                ? 'to pickup' 
                                                : 'to delivery'
                                            }
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-green-600">${order.deliveryPrice.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Delivery Fee</p>
                        {isActiveOrder && (
                            <div className="mt-2">
                                <span className="text-xs text-blue-600 font-medium flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                                    Current Order
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {!isCompleted && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Progress</span>
                            <span>{Math.round(progressPercentage)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <OTPModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                onSubmit={handleOTPSubmit}
                orderId={order.orderId}
            />

            <FailureReasonModal
                isOpen={showFailureModal}
                onClose={() => setShowFailureModal(false)}
                onSubmit={handleFailureSubmit}
                orderId={order.orderId}
            />

            <ConfirmationModal
                isOpen={showPickupConfirmModal}
                onClose={() => setShowPickupConfirmModal(false)}
                onConfirm={handlePickupConfirm}
                title="Confirm Pickup"
                message="Are you sure you have picked up the order from the restaurant? This action will update the order status to 'Picked Up' and notify the customer."
                confirmText="Yes, Picked Up"
                cancelText="Cancel"
                type="success"
            />
        </div>
    );
};

export default OrderCard;