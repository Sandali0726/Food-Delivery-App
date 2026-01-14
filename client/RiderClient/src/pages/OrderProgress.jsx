import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    MdArrowBack,
    MdCheckCircle,
    MdDirections,
    MdDeliveryDining,
    MdRestaurant,
    MdPerson,
    MdPhone,
    MdLocationOn,
    MdAttachMoney,
    MdAccessTimeFilled,
    MdStraighten,
    MdCancel,
    MdError,
    MdRefresh
} from 'react-icons/md';
import {
    updateOrderStatus,
    selectStatusUpdateLoading,
    selectOrderById,
    setActiveOrder
} from '../features/ordersSlice';
import { DELIVERY_STATUS } from '../api/delivery';
import OTPModal from '../components/OTPModal';
import FailureReasonModal from '../components/FailureReasonModal';
import ConfirmationModal from '../components/ConfirmationModal';

const OrderProgressPage = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isUpdatingStatus = useSelector(selectStatusUpdateLoading);

    // Get order from Redux store or from location state
    const orderFromStore = useSelector(state => selectOrderById(state, orderId));
    const locationOrder = location.state?.order;
    const order = orderFromStore || locationOrder;

    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [showPickupConfirmModal, setShowPickupConfirmModal] = useState(false);
    console.log('Order in OrderProgressPage:', order);
    
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!orderFromStore && locationOrder) {
            dispatch(setActiveOrder(locationOrder));
        }
    }, [orderFromStore, locationOrder, dispatch]);

    useEffect(() => {
        if (!order) {
            // If order not found, redirect back to dashboard
            navigate('/dashboard');
        }
    }, [order, navigate]);

    if (!order) return null;

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
                orderId: order.orderId,
                status: newStatus,
                currentOrder: order
            })).unwrap();
            if (result?.enhancedOrder) {
                dispatch(setActiveOrder(result.enhancedOrder));
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

    const handleOTPSubmit = async (otp) => {
        try {
            await handleStatusUpdate(DELIVERY_STATUS.DELIVERED);
            setShowOTPModal(false);
        } catch (error) {
            console.error('Failed to update delivery status:', error);
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
        switch (order.status) {
            case DELIVERY_STATUS.ACCEPTED:
            case DELIVERY_STATUS.GO_TO_PICKUP:
                return {
                    text: 'Navigate to Pickup',
                    action: async () => {
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
                return {
                    text: 'Navigate to Customer',
                    action: async () => {
                        if (order.status === DELIVERY_STATUS.PICKED_UP) {
                            await handleStatusUpdate(DELIVERY_STATUS.ON_THE_WAY);
                        }
                        handleNavigateToMap('delivery');
                    },
                    icon: MdDirections,
                    color: 'bg-purple-500 hover:bg-purple-600'
                };
            default:
                return null;
        }
    };

    const nextAction = getNextAction();
    const progressPercentage = getProgressPercentage();
    const isCompleted = [DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.CANCELLED, DELIVERY_STATUS.FAILED].includes(order.status);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => navigate('/dashboard', { state: { activeTab: 'orders' } })}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <MdArrowBack className="h-6 w-6 mr-2" />
                            <span className="font-medium">Back to My Orders</span>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Order Progress</h1>
                        <div></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Order Header */}
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h2>
                            <p className="text-gray-600 mt-1">
                                Ordered on {new Date(order.acceptedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {!isCompleted && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                <span>Delivery Progress</span>
                                <span>{Math.round(progressPercentage)}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(order.deliveryPrice+order.order_price || 0)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Distance</p>
                            <p className="text-lg font-bold text-gray-900">{order.distance || 'N/A'} </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Est. Time</p>
                            <p className="text-lg font-bold text-gray-900">{order.estimatedTime || 'N/A'} </p>
                        </div>
                    </div>
                </div>

                {/* Step-by-Step Progress */}
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Steps</h3>
                    <div className="space-y-6">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon;
                            const isActive = order.status === step.status;
                            const isComplete = step.completed;

                            return (
                                <div key={step.status} className="flex items-start space-x-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                            isComplete ? 'bg-green-500 border-green-500 text-white' :
                                            isActive ? 'bg-orange-500 border-orange-500 text-white' :
                                            'bg-gray-100 border-gray-300 text-gray-400'
                                        }`}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-0.5 h-12 mt-2 ${
                                                isComplete ? 'bg-green-500' : 'bg-gray-200'
                                            }`}></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <h4 className={`font-semibold text-lg ${
                                            isComplete ? 'text-green-600' : 
                                            isActive ? 'text-orange-600' : 'text-gray-400'
                                        }`}>
                                            {step.title}
                                        </h4>
                                        <p className="text-gray-600 mt-1">{step.description}</p>
                                        {isActive && (
                                            <div className="flex items-center space-x-2 mt-2">
                                                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm text-orange-600 font-medium">Currently Active</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Restaurant Details */}
                    <div className="bg-white rounded-3xl shadow-sm p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <MdRestaurant className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Pickup Location</h3>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xl font-semibold text-gray-900">{order.restaurant?.name}</p>
                            <div className="flex items-start space-x-2 text-gray-600">
                                <MdLocationOn className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{order.pickupAddress}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <MdPhone className="h-5 w-5" />
                                <p className="text-sm">{order.restaurant?.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-white rounded-3xl shadow-sm p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <MdPerson className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xl font-semibold text-gray-900">{order.customer?.name || 'Customer'}</p>
                            <div className="flex items-start space-x-2 text-gray-600">
                                <MdLocationOn className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{order.deliveryAddress}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <MdPhone className="h-5 w-5" />
                                <p className="text-sm">{order.customer?.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {!isCompleted && nextAction && (
                    <div className="bg-white rounded-3xl shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Next Action</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={nextAction.action}
                                disabled={isUpdatingStatus}
                                className={`flex items-center justify-center px-6 py-3 rounded-2xl text-white font-semibold transition-colors ${nextAction.color} disabled:opacity-50`}
                            >
                                {isUpdatingStatus ? (
                                    <MdRefresh className="h-5 w-5 mr-2 animate-spin" />
                                ) : (
                                    <nextAction.icon className="h-5 w-5 mr-2" />
                                )}
                                {nextAction.text}
                            </button>

                            {/* Additional Actions */}
                            {order.status === DELIVERY_STATUS.GO_TO_PICKUP && (
                                <button
                                    onClick={() => setShowPickupConfirmModal(true)}
                                    className="flex items-center justify-center px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                                >
                                    <MdCheckCircle className="h-5 w-5 mr-2" />
                                    Confirm Pickup
                                </button>
                            )}

                            {order.status === DELIVERY_STATUS.ON_THE_WAY && (
                                <>
                                    <button
                                        onClick={() => setShowOTPModal(true)}
                                        className="flex items-center justify-center px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                                    >
                                        <MdCheckCircle className="h-5 w-5 mr-2" />
                                        Complete Delivery
                                    </button>
                                    <button
                                        onClick={() => setShowFailureModal(true)}
                                        className="flex items-center justify-center px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                                    >
                                        <MdError className="h-5 w-5 mr-2" />
                                        Report Issue
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Completed Status */}
                {isCompleted && (
                    <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
                        {order.status === DELIVERY_STATUS.DELIVERED && (
                            <>
                                <MdCheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-green-800 mb-2">Delivery Completed!</h3>
                                <p className="text-gray-600">Great job! The order has been delivered successfully.</p>
                            </>
                        )}
                        {order.status === DELIVERY_STATUS.CANCELLED && (
                            <>
                                <MdCancel className="h-20 w-20 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Cancelled</h3>
                                <p className="text-gray-600">This order has been cancelled.</p>
                            </>
                        )}
                        {order.status === DELIVERY_STATUS.FAILED && (
                            <>
                                <MdError className="h-20 w-20 text-red-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-red-800 mb-2">Delivery Failed</h3>
                                <p className="text-red-600">Unable to complete this delivery.</p>
                            </>
                        )}
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

export default OrderProgressPage;
