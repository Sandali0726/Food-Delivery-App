import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    MdCheckCircle,
    MdRadioButtonUnchecked,
    MdTimer,
    MdLocationOn,
    MdPhone,
    MdDirections,
    MdAttachMoney,
    MdStar,
    MdCancel,
    MdError,
    MdDeliveryDining,
    MdRestaurant,
    MdPerson,
    MdRefresh
} from 'react-icons/md';
import { 
    updateOrderStatus, 
    selectStatusUpdateLoading,
    setSelectedOrderForMap 
} from '../features/ordersSlice';
import { DELIVERY_STATUS } from '../api/delivery';
import OTPModal from './OTPModal';
import FailureReasonModal from './FailureReasonModal';
import ConfirmationModal from './ConfirmationModal';

const OrderProgress = ({ order }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isUpdatingStatus = useSelector(selectStatusUpdateLoading);
    
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [showPickupConfirmModal, setShowPickupConfirmModal] = useState(false);

    if (!order) return null;

    const steps = [
        {
            status: DELIVERY_STATUS.ACCEPTED,
            title: 'Order Accepted',
            description: 'Order has been assigned to you',
            completed: true
        },
        {
            status: DELIVERY_STATUS.GO_TO_PICKUP,
            title: 'Go to Pickup',
            description: 'Navigate to restaurant',
            completed: [DELIVERY_STATUS.GO_TO_PICKUP, DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.ON_THE_WAY, DELIVERY_STATUS.DELIVERED].includes(order.status)
        },
        {
            status: DELIVERY_STATUS.PICKED_UP,
            title: 'Order Picked Up',
            description: 'Collected from restaurant',
            completed: [DELIVERY_STATUS.PICKED_UP, DELIVERY_STATUS.ON_THE_WAY, DELIVERY_STATUS.DELIVERED].includes(order.status)
        },
        {
            status: DELIVERY_STATUS.ON_THE_WAY,
            title: 'On the Way',
            description: 'Delivering to customer',
            completed: [DELIVERY_STATUS.ON_THE_WAY, DELIVERY_STATUS.DELIVERED].includes(order.status)
        },
        {
            status: DELIVERY_STATUS.DELIVERED,
            title: 'Delivered',
            description: 'Order completed successfully',
            completed: order.status === DELIVERY_STATUS.DELIVERED
        }
    ];

    const handleStatusUpdate = async (newStatus) => {
        try {
            await dispatch(updateOrderStatus({ 
                orderId: order.orderId, 
                status: newStatus 
            })).unwrap();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleNavigateToMap = (mapType) => {
        navigate('/delivery-map', { 
            state: { 
                order, 
                mapType 
            } 
        });
    };

    const handleOTPSubmit = async (otp) => {
        // For now, just update status. OTP validation will be implemented later
        console.log('OTP submitted:', otp);
        await handleStatusUpdate(DELIVERY_STATUS.DELIVERED);
        setShowOTPModal(false);
    };

    const handleFailureSubmit = async (reason) => {
        // For now, just update status. Failure reason submission will be implemented later
        console.log('Failure reason:', reason);
        await handleStatusUpdate(DELIVERY_STATUS.FAILED);
        setShowFailureModal(false);
    };

    const handlePickupConfirm = async () => {
        await handleStatusUpdate(DELIVERY_STATUS.PICKED_UP);
        setShowPickupConfirmModal(false);
    };

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.status === order.status);
    };

    const getNextAction = () => {
        switch (order.status) {
            case DELIVERY_STATUS.ACCEPTED:
                return {
                    text: 'Navigate to Pickup',
                    action: () => handleNavigateToMap('pickup'),
                    icon: MdDirections,
                    color: 'bg-blue-500 hover:bg-blue-600'
                };
            case DELIVERY_STATUS.GO_TO_PICKUP:
                return {
                    text: 'Navigate to Pickup',
                    action: () => handleNavigateToMap('pickup'),
                    icon: MdDirections,
                    color: 'bg-blue-500 hover:bg-blue-600'
                };
            case DELIVERY_STATUS.PICKED_UP:
                return {
                    text: 'Navigate to Customer',
                    action: () => handleNavigateToMap('delivery'),
                    icon: MdDirections,
                    color: 'bg-green-500 hover:bg-green-600'
                };
            case DELIVERY_STATUS.ON_THE_WAY:
                return {
                    text: 'Complete Delivery',
                    action: () => setShowOTPModal(true),
                    icon: MdCheckCircle,
                    color: 'bg-orange-500 hover:bg-orange-600'
                };
            default:
                return null;
        }
    };

    const nextAction = getNextAction();

    return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
            {/* Order Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <MdDeliveryDining className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Order #{order.orderId}</h2>
                        <p className="text-gray-600 text-sm">{order.estimatedTime}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                        ${order.deliveryPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Delivery Fee</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.status} className="flex items-center space-x-4">
                            <div className="flex flex-col items-center">
                                {step.completed ? (
                                    <MdCheckCircle className="h-6 w-6 text-green-500" />
                                ) : order.status === step.status ? (
                                    <div className="h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center">
                                        <div className="h-3 w-3 bg-white rounded-full"></div>
                                    </div>
                                ) : (
                                    <MdRadioButtonUnchecked className="h-6 w-6 text-gray-300" />
                                )}
                                {index < steps.length - 1 && (
                                    <div className={`w-0.5 h-8 mt-2 ${
                                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                                    }`}></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-medium ${
                                    step.completed ? 'text-green-600' : 
                                    order.status === step.status ? 'text-orange-600' : 'text-gray-400'
                                }`}>
                                    {step.title}
                                </h4>
                                <p className="text-sm text-gray-600">{step.description}</p>
                                {order.status === step.status && (
                                    <div className="flex items-center space-x-1 mt-1">
                                        <MdTimer className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm text-orange-600 font-medium">In Progress</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Restaurant Info */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <MdRestaurant className="h-5 w-5 text-orange-500" />
                        <h4 className="font-semibold text-gray-800">Pickup Location</h4>
                    </div>
                    <div className="pl-7">
                        <p className="font-medium text-gray-800">{order.restaurant.name}</p>
                        <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                        <p className="text-sm text-gray-600">{order.restaurant.phone}</p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <MdPerson className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold text-gray-800">Customer</h4>
                    </div>
                    <div className="pl-7">
                        <p className="font-medium text-gray-800">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        <p className="text-sm text-gray-600">{order.customer.phone}</p>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                    {order.orderItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                            <span className="text-gray-700">{item}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                        <span className="font-medium text-gray-800">Order Total:</span>
                        <span className="font-semibold text-gray-800">${order.order_price.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                {/* Primary Action */}
                {nextAction && order.status !== DELIVERY_STATUS.DELIVERED && order.status !== DELIVERY_STATUS.CANCELLED && order.status !== DELIVERY_STATUS.FAILED && (
                    <button
                        onClick={nextAction.action}
                        disabled={isUpdatingStatus}
                        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-white transition duration-200 ${nextAction.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isUpdatingStatus ? (
                            <MdRefresh className="h-5 w-5 animate-spin" />
                        ) : (
                            <nextAction.icon className="h-5 w-5" />
                        )}
                        <span>{isUpdatingStatus ? 'Updating...' : nextAction.text}</span>
                    </button>
                )}

                {/* Secondary Actions */}
                {order.status !== DELIVERY_STATUS.DELIVERED && order.status !== DELIVERY_STATUS.CANCELLED && order.status !== DELIVERY_STATUS.FAILED && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleStatusUpdate(DELIVERY_STATUS.CANCELLED)}
                            disabled={isUpdatingStatus}
                            className="flex items-center justify-center space-x-2 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MdCancel className="h-4 w-4" />
                            <span>Cancel</span>
                        </button>
                        <button
                            onClick={() => setShowFailureModal(true)}
                            disabled={isUpdatingStatus}
                            className="flex items-center justify-center space-x-2 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MdError className="h-4 w-4" />
                            <span>Report Issue</span>
                        </button>
                    </div>
                )}

                {/* Status-specific quick actions */}
                {(order.status === DELIVERY_STATUS.GO_TO_PICKUP || order.status === DELIVERY_STATUS.PICKED_UP) && (
                    <div className="flex space-x-3 pt-3">
                        <button
                            onClick={() => {
                                if (order.status === DELIVERY_STATUS.GO_TO_PICKUP) {
                                    setShowPickupConfirmModal(true);
                                } else {
                                    handleStatusUpdate(DELIVERY_STATUS.ON_THE_WAY);
                                }
                            }}
                            disabled={isUpdatingStatus}
                            className="flex-1 py-2 px-4 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {order.status === DELIVERY_STATUS.GO_TO_PICKUP 
                                ? 'Mark as Picked Up' 
                                : 'Mark On the Way'
                            }
                        </button>
                    </div>
                )}
            </div>

            {/* Completion Status */}
            {order.status === DELIVERY_STATUS.DELIVERED && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <MdCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-800">Order Completed!</h3>
                    <p className="text-green-600">Successfully delivered to customer</p>
                </div>
            )}

            {order.status === DELIVERY_STATUS.CANCELLED && (
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <MdCancel className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Order Cancelled</h3>
                    <p className="text-gray-600">This order has been cancelled</p>
                </div>
            )}

            {order.status === DELIVERY_STATUS.FAILED && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <MdError className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-red-800">Delivery Failed</h3>
                    <p className="text-red-600">Unable to complete this delivery</p>
                </div>
            )}

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

export default OrderProgress;