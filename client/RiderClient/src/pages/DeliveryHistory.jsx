import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
    fetchDeliveryHistory, 
    selectDeliveryHistory, 
    selectHistoryLoading, 
    selectHistoryError 
} from '../features/ordersSlice';
import { 
    MdArrowBack,
    MdDeliveryDining,
    MdStar,
    MdLocationOn,
    MdTimer,
    MdAttachMoney,
    MdError,
    MdRefresh
} from 'react-icons/md';

const DeliveryHistory = () => {
    const dispatch = useDispatch();
    const { rider } = useSelector((state) => state.auth);
    const deliveryHistory = useSelector(selectDeliveryHistory);
    const historyLoading = useSelector(selectHistoryLoading);
    const historyError = useSelector(selectHistoryError);

    // Fetch delivery history when component mounts
    useEffect(() => {
        if (rider?.email) {
            dispatch(fetchDeliveryHistory(rider.email));
        }
    }, [dispatch, rider?.email]);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <MdStar 
                    key={i} 
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Recently';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'FAILED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/dashboard"
                                className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
                            >
                                <MdArrowBack className="h-6 w-6 text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
                                <p className="text-gray-600">View all your completed deliveries</p>
                            </div>
                        </div>
                        <button
                            onClick={() => dispatch(fetchDeliveryHistory(rider.email))}
                            disabled={historyLoading}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 disabled:opacity-50"
                        >
                            <MdRefresh className={`h-4 w-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Loading State */}
                {historyLoading && (
                    <div className="bg-white rounded-3xl p-8 shadow-lg">
                        <div className="text-center py-12">
                            <svg className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Loading history...</h3>
                            <p className="text-gray-600">Fetching your delivery history</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {historyError && !historyLoading && (
                    <div className="bg-white rounded-3xl p-8 shadow-lg">
                        <div className="text-center py-12">
                            <MdError className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading History</h3>
                            <p className="text-gray-600 mb-4">
                                {typeof historyError === 'string' ? historyError : historyError?.message || 'Failed to load delivery history'}
                            </p>
                            <button
                                onClick={() => dispatch(fetchDeliveryHistory(rider.email))}
                                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                            >
                                <MdRefresh className="h-4 w-4 mr-2" />
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* History List */}
                {!historyLoading && !historyError && deliveryHistory.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Total Deliveries: {deliveryHistory.length}
                            </h2>
                        </div>

                        {deliveryHistory.map((delivery) => (
                            <div key={delivery.orderId || delivery.deliveryId} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition duration-200">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                            <MdDeliveryDining className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Order #{delivery.orderId || delivery.deliveryId}</h3>
                                            <p className="text-gray-600">{delivery.customerName || 'Customer'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                                            {delivery.status || 'DELIVERED'}
                                        </span>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {formatDate(delivery.deliveredAt || delivery.updatedAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    {/* Pickup Location */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Pickup</p>
                                        <div className="flex items-start space-x-2">
                                            <MdLocationOn className="h-4 w-4 text-orange-500 mt-0.5" />
                                            <p className="text-sm text-gray-800">
                                                {delivery.pickupAddress || 'Pickup Location'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Delivery Location */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Delivery</p>
                                        <div className="flex items-start space-x-2">
                                            <MdLocationOn className="h-4 w-4 text-green-500 mt-0.5" />
                                            <p className="text-sm text-gray-800">
                                                {delivery.deliveryAddress || 'Delivery Location'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Earnings */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Earnings</p>
                                        <div className="flex items-center space-x-2">
                                            <MdAttachMoney className="h-4 w-4 text-green-500" />
                                            <p className="text-sm font-bold text-gray-800">
                                                ${(delivery.totalAmount || delivery.deliveryCharge || 0).toFixed(2)}
                                                {delivery.tip > 0 && (
                                                    <span className="text-green-600"> + ${delivery.tip.toFixed(2)} tip</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating and Time */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Rating:</span>
                                        <div className="flex items-center space-x-1">
                                            {renderStars(delivery.rating || 5)}
                                            <span className="text-sm text-gray-600">({delivery.rating || 5}/5)</span>
                                        </div>
                                    </div>
                                    
                                    {delivery.deliveryTime && (
                                        <div className="flex items-center space-x-2">
                                            <MdTimer className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                {delivery.deliveryTime} mins
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No History State */}
                {!historyLoading && !historyError && deliveryHistory.length === 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-lg">
                        <div className="text-center py-12">
                            <MdDeliveryDining className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No delivery history</h3>
                            <p className="text-gray-600 mb-6">
                                Your completed deliveries will appear here
                            </p>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryHistory;