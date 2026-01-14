import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess, updateRiderStatus } from '../features/auth/authSlice';
import { fetchRiderProfile, clearProfile } from '../features/profileSlice';
import { 
    fetchDeliveryTasks, 
    fetchDeliveryHistory, 
    selectActiveOrder, 
    selectOrders, 
    selectOrdersLoading, 
    selectOrdersError, 
    selectDeliveryHistory, 
    selectHistoryLoading, 
    selectHistoryError,
    selectHistoryPagination,
    selectCanLoadMoreHistory,
    clearAllOrdersData,
    setHistoryPage,
    setActiveOrder,
    selectHistoryFilters,
    selectHasActiveFilters,
    setHistoryFilters,
    clearHistoryFilters
} from '../features/ordersSlice';
import {
    fetchAvailableOrders,
    addAvailableOrder,
    removeAvailableOrder,
    clearAvailableOrders,
    clearAllAvailableOrdersData,
    selectAvailableOrders,
    selectAvailableOrdersLoading,
    selectAvailableOrdersError
} from '../features/availableOrdersSlice';
import {
    fetchRiderStatistics,
    selectStatistics,
    selectStatisticsLoading,
    selectStatisticsError,
    clearStatistics
} from '../features/statisticsSlice';
import { changeRiderStatus, getRiderStatistics } from '../api/profile';
import useLocationTracking from '../hooks/useLocationTracking';
import LocationPermissionModal from '../components/LocationPermissionModal';
import LocationMapModal from '../components/LocationMapModal';
import OrderCard from '../components/OrderCard';
import AvailableOrderCard from '../components/AvailableOrderCard';
import { connectSocket, disconnectSocket } from '../api/ws';
import { availableOrdersSubscribe } from '../socketSubscribers/availableOrders';
import { useNotification } from '../contexts/NotificationContext';
import { 
    MdDeliveryDining,
    MdPerson,
    MdStar,
    MdLocationOn,
    MdLocationOff,
    MdPhone,
    MdCheckCircle,
    MdTimer,
    MdSettings,
    MdHistory,
    MdAccountCircle,
    MdAttachMoney,
    MdLocalShipping,
    MdSpeed,
    MdLogout,
    MdError,
    MdRefresh,
    MdList,
    MdViewList,
    MdDashboard,
    MdExitToApp,
    MdRestaurant,
    MdFilterList,
    MdSearch,
    MdClose,
    MdCalendarToday
} from 'react-icons/md';
import { logout } from '../api/auth';
import OnlineDeliveryServiceGif from '../assets/Online Delivery Service.gif';
import logo from '../assets/logo.png';

const Dashboard = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { rider } = useSelector((state) => state.auth);
    const { user: profileData, isLoading, error } = useSelector((state) => state.profile);
    
    // Orders state
    const activeOrder = useSelector(selectActiveOrder);
    const orders = useSelector(selectOrders);
    const ordersLoading = useSelector(selectOrdersLoading);
    const ordersError = useSelector(selectOrdersError);
    
    // Available orders state
    const availableOrders = useSelector(selectAvailableOrders);
    const availableOrdersLoading = useSelector(selectAvailableOrdersLoading);
    const availableOrdersError = useSelector(selectAvailableOrdersError);
    
    // Delivery history state
    const deliveryHistory = useSelector(selectDeliveryHistory);
    const historyLoading = useSelector(selectHistoryLoading);
    const historyError = useSelector(selectHistoryError);
    const historyPagination = useSelector(selectHistoryPagination);
    const canLoadMoreHistory = useSelector(selectCanLoadMoreHistory);
    const historyFilters = useSelector(selectHistoryFilters);
    const hasActiveFilters = useSelector(selectHasActiveFilters);
    
    // Local filter input state
    const [filterOrderId, setFilterOrderId] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Initialize location tracking
    const locationTracking = useLocationTracking();
    
    // Track previous rider email to detect changes
    const prevRiderEmailRef = useRef(rider?.email);
    
    // Track if we've already fetched orders to prevent infinite loop
    const hasFetchedOrdersRef = useRef(false);
    
    // Clear orders data when rider changes (different user login)
    useEffect(() => {
        if (rider?.email && prevRiderEmailRef.current && prevRiderEmailRef.current !== rider.email) {
            // Clear existing orders data to prevent cross-user contamination
            dispatch(clearAllOrdersData());
            // Clear statistics for different user
            dispatch(clearStatistics());
            // Clear order access times for different user
            setOrderAccessTimes({});
            // Reset the fetch flag when rider changes
            hasFetchedOrdersRef.current = false;
            try {
                localStorage.removeItem('orderAccessTimes');
            } catch (error) {
                console.error('Failed to clear order access times from localStorage:', error);
            }
        }
        prevRiderEmailRef.current = rider?.email;
    }, [rider?.email, dispatch]);
    
    // Statistics from Redux
    const statistics = useSelector(selectStatistics);
    const statisticsLoading = useSelector(selectStatisticsLoading);
    const statisticsError = useSelector(selectStatisticsError);
    
    // Fetch rider statistics
    useEffect(() => {
        if (rider?.email) {
            dispatch(fetchRiderStatistics(rider.email));
        }
    }, [rider?.email, dispatch]);
    
    // Use profile data from API or fallback to auth data
    const driverStats = {
        name: `${profileData?.first_name || rider?.first_name || 'John'} ${profileData?.last_name || rider?.last_name || 'Smith'}`,
        todayEarnings: statistics?.totalEarningsToday || profileData?.todayEarnings || 0,
        weeklyEarnings: statistics?.totalEarningsThisWeek || profileData?.weeklyEarnings || 0,
        monthlyEarnings: statistics?.totalEarnings || profileData?.monthlyEarnings || 0,
        todayDeliveries: statistics?.totalDeliveriesToday || profileData?.todayDeliveries || 0,
        weeklyDeliveries: statistics?.totalDeliveriesThisWeek || profileData?.weeklyDeliveries || 0,
        monthlyDeliveries: statistics?.totalDeliveries || profileData?.monthlyDeliveries || 0,
        averageEarningsPerDelivery: statistics?.averageEarningsPerDelivery || 0,
        currentRating: profileData?.rating || rider?.rating || 0.0,
        totalRatings: profileData?.total_reviews || 0,
        completionRate: statistics?.completionRate || profileData?.completionRate || 0,
        onTimeRate: profileData?.onTimeRate || 0,
        status: profileData?.status || 'online'
    };

    // Fetch profile data when component mounts
    useEffect(() => {
        if (rider?.email && !profileData) {
            dispatch(fetchRiderProfile(rider.email));
        }
    }, [dispatch, rider?.email, profileData]);

    // Fetch delivery tasks when component mounts or rider status changes to online
    useEffect(() => {
        if (rider?.email && (rider?.status === 'available' || rider?.status === 'online')) {
            // Only fetch if we haven't fetched yet or if the loading is complete
            if (!hasFetchedOrdersRef.current && !ordersLoading) {
                console.log('Fetching delivery tasks for rider:', rider.email);
                hasFetchedOrdersRef.current = true;
                dispatch(fetchDeliveryTasks(rider.email));
            }
        }
    }, [dispatch, rider?.email, rider?.status, ordersLoading]);

    // Fetch delivery history when component mounts or filters change
    useEffect(() => {
        if (rider?.email) {
            dispatch(fetchDeliveryHistory({ 
                email: rider.email, 
                page: historyPagination.currentPage, 
                size: historyPagination.pageSize,
                orderId: historyFilters.orderId,
                date: historyFilters.date
            }));
        }
    }, [dispatch, rider?.email, historyPagination.currentPage, historyPagination.pageSize, historyFilters.orderId, historyFilters.date]);

    // Fetch available orders when component mounts and rider is online
    useEffect(() => {
        if (rider?.email && (rider?.status === 'available' || rider?.status === 'online')) {
            dispatch(fetchAvailableOrders());
        } else {
            // Clear available orders when rider goes offline
            dispatch(clearAvailableOrders());
        }
    }, [dispatch, rider?.email, rider?.status]);

    // Initialize notification system
    const { showOrderNotification, showSuccessNotification, showErrorNotification, setNavigationCallbacks } = useNotification();
    
    // Track last access times for orders (persisted in localStorage)
    const [orderAccessTimes, setOrderAccessTimes] = useState(() => {
        try {
            const saved = localStorage.getItem('orderAccessTimes');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Failed to load order access times from localStorage:', error);
            return {};
        }
    });
    
    // Save access times to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('orderAccessTimes', JSON.stringify(orderAccessTimes));
        } catch (error) {
            console.error('Failed to save order access times to localStorage:', error);
        }
    }, [orderAccessTimes]);
    
    // Function to track order access when status is updated
    const trackOrderStatusUpdate = (order) => {
        const orderId = order.deliveryId || order.orderId;
        const accessTime = Date.now();
        
        console.log(`🎯 Tracking order access for ${orderId} at ${new Date(accessTime).toISOString()}`);
        
        setOrderAccessTimes(prev => ({
            ...prev,
            [orderId]: accessTime
        }));
        
        // Set this order as active since its status was just updated
        dispatch(setActiveOrder(order));
    };
    
    // Function to refresh orders data when needed (e.g., after accepting new order)
    const refreshOrdersData = () => {
        console.log('🔄 Refreshing orders data');
        if (rider?.email) {
            dispatch(fetchDeliveryTasks(rider.email));
            dispatch(fetchAvailableOrders());
            dispatch(fetchDeliveryHistory({ 
                email: rider.email, 
                page: historyPagination.currentPage, 
                size: historyPagination.pageSize,
                orderId: historyFilters.orderId,
                date: historyFilters.date
            }));
        }
    };

    // Handle filter application
    const handleApplyFilters = () => {
        console.log('🔍 Applying filters:', { orderId: filterOrderId, date: filterDate });
        
        dispatch(setHistoryFilters({
            orderId: filterOrderId ? parseInt(filterOrderId) : null,
            date: filterDate || null
        }));
    };

    // Handle filter clear
    const handleClearFilters = () => {
        console.log('🧹 Clearing filters');
        setFilterOrderId('');
        setFilterDate('');
        dispatch(clearHistoryFilters());
    };

    // Setup navigation callbacks for notifications
    useEffect(() => {
        setNavigationCallbacks({
            onNavigateToOrders: () => {
                console.log('📱 Navigating to My Orders tab');
                setActiveTab('orders');
            },
            onRefreshOrders: refreshOrdersData,
            onOrderAccepted: (acceptedOrder) => {
                console.log('🎯 Order accepted, setting as active:', acceptedOrder);
                // Set the newly accepted order as active
                trackOrderStatusUpdate(acceptedOrder);
                // Refresh orders data to get the latest state
                refreshOrdersData();
            }
        });
    }, [rider?.email, setNavigationCallbacks, dispatch, historyPagination.pageSize]);
    
    // Setup socket connection for real-time order updates
    useEffect(() => {
        if (rider?.email && 
            (rider?.status === 'available' || rider?.status === 'online') && 
            !socketSubscription) {
            
            const setupSocket = async () => {
                try {
                    console.log('🔌 Setting up socket connection in dashboard for rider:', rider.email);
                    const client = await connectSocket();
                    setSocketClient(client);
                    console.log('✅ Socket client connected in dashboard');
                    
                    const subscription = availableOrdersSubscribe(client, (messageData) => {
                        console.log('📨 Received socket message in dashboard:', messageData);
                        
                        if (messageData.type === "ORDER_CREATED") {
                            console.log("🆕 New order created:", messageData.payload);
                            
                            // Add to Redux store
                            dispatch(addAvailableOrder(messageData.payload));
                            
                            // Show notification
                            showOrderNotification(messageData.payload);
                            
                            // Browser notification (if permission granted)
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification('New Delivery Order!', {
                                    body: `Order #${messageData.payload.orderId} - ${messageData.payload.distance} away`,
                                    // icon: '/favicon.ico',
                                    tag: 'order-notification'
                                });
                            }
                            
                            // Play notification sound
                            try {
                                const audio = new Audio('/notification-sound.mp3');
                                audio.volume = 0.5;
                                audio.play().catch(e => console.log('Audio play failed:', e));
                            } catch (e) {
                                console.log('Audio not available:', e);
                            }
                            
                        } else if (messageData.type === "ORDER_REMOVED") {
                            // Payload is the orderId directly (number)
                            const orderId = messageData.payload;
                            console.log("🗑️ Order removed, orderId:", orderId);
                            dispatch(removeAvailableOrder(orderId));
                        } else {
                            console.log("📝 Unknown message type received:", messageData);
                        }
                    });
                    
                    setSocketSubscription(subscription);
                } catch (error) {
                    console.error('❌ Error setting up socket connection in dashboard:', error);
                }
            };
            
            setupSocket();
        }
        
        // Cleanup socket when component unmounts or rider goes offline
        return () => {
            if (socketSubscription) {
                console.log('🧹 Cleaning up dashboard socket subscription');
                socketSubscription.unsubscribe();
                setSocketSubscription(null);
            }
            // Don't disconnect the global client here, let it be managed by ws.js
            // The next page will reuse the connection if needed
        };
    }, [rider?.email, rider?.status, dispatch, showOrderNotification, showErrorNotification]);

    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    const [statusError, setStatusError] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [activeTab, setActiveTab] = useState('available'); // 'available', 'orders', or 'history'
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [socketClient, setSocketClient] = useState(null);
    const [socketSubscription, setSocketSubscription] = useState(null);

    // Handle navigation state from other components (e.g., DeliveryMap)
    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
            // Clear the state to prevent it from persisting on subsequent visits
            window.history.replaceState({}, '');
        }
    }, [location.state]);

    // Ensure there's always an active order based on last access time
    useEffect(() => {
        if (orders && orders.length > 0) {
            if (!activeOrder) {
                // If no active order, set the most recently accessed or first order
                const mostRecentOrder = orders.reduce((latest, current) => {
                    const currentId = current.deliveryId || current.orderId;
                    const latestId = latest.deliveryId || latest.orderId;
                    
                    const currentAccessTime = orderAccessTimes[currentId] || 0;
                    const latestAccessTime = orderAccessTimes[latestId] || 0;
                    
                    return currentAccessTime > latestAccessTime ? current : latest;
                });
                dispatch(setActiveOrder(mostRecentOrder));
            } else {
                // Check if current active order still exists in orders list
                const activeOrderExists = orders.some(order => 
                    (order.deliveryId || order.orderId) === (activeOrder.deliveryId || activeOrder.orderId)
                );
                
                if (!activeOrderExists) {
                    // If active order no longer exists, set most recently accessed order
                    const mostRecentOrder = orders.reduce((latest, current) => {
                        const currentId = current.deliveryId || current.orderId;
                        const latestId = latest.deliveryId || latest.orderId;
                        
                        const currentAccessTime = orderAccessTimes[currentId] || 0;
                        const latestAccessTime = orderAccessTimes[latestId] || 0;
                        
                        return currentAccessTime > latestAccessTime ? current : latest;
                    });
                    dispatch(setActiveOrder(mostRecentOrder));
                }
            }
        }
    }, [orders, activeOrder, orderAccessTimes, dispatch]);

    // Pagination functions
    const goToNextPage = () => {
        if (canLoadMoreHistory && rider?.email) {
            const nextPage = historyPagination.currentPage + 1;
            dispatch(setHistoryPage(nextPage));
            dispatch(fetchDeliveryHistory({ 
                email: rider.email, 
                page: nextPage, 
                size: historyPagination.pageSize,
                orderId: historyFilters.orderId,
                date: historyFilters.date
            }));
        }
    };

    const goToPrevPage = () => {
        if (historyPagination.currentPage > 0 && rider?.email) {
            const prevPage = historyPagination.currentPage - 1;
            dispatch(setHistoryPage(prevPage));
            dispatch(fetchDeliveryHistory({ 
                email: rider.email, 
                page: prevPage, 
                size: historyPagination.pageSize,
                orderId: historyFilters.orderId,
                date: historyFilters.date
            }));
        }
    };

    // Get status from Redux store
    const isOnline = rider?.status === 'available' || rider?.status === 'online' || profileData?.status === 'available' || profileData?.status === 'online';

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // If user is currently online, set them to offline before logout
            if (isOnline) {
                const email = rider?.email || profileData?.email;
                if (email) {
                    try {
                        await changeRiderStatus(email);
                        // Update Redux store
                        dispatch(updateRiderStatus('unavailable'));
                    } catch (error) {
                        console.error('Failed to set offline status during logout:', error);
                    }
                }
            }
            
            // Clear all Redux state (rootReducer will automatically clear all slices)
            dispatch(logoutSuccess());
            dispatch(clearProfile());
            dispatch(clearAvailableOrders());
            
            // Call backend logout API
            try {
                const response = await logout();
                console.log('Logout response:', response);
            } catch (error) {
                console.error('Logout API error:', error);
            }
        } catch (error) {
            console.error('Logout process error:', error);
            // Still proceed with logout even if status change fails
            dispatch(logoutSuccess());
            dispatch(clearProfile());
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Navigation items for vertical navigation
    const navigationItems = [
        {
            id: 'available',
            label: 'Available Orders',
            icon: MdList,
            active: activeTab === 'available',
            action: () => setActiveTab('available')
        },
        {
            id: 'dashboard',
            label: 'My Orders',
            icon: MdDashboard,
            active: activeTab === 'orders',
            action: () => setActiveTab('orders')
        },
        {
            id: 'history',
            label: 'Delivery History',
            icon: MdHistory,
            active: activeTab === 'history',
            action: () => setActiveTab('history')
        },
        {
            id: 'profile',
            label: 'My Profile',
            icon: MdPerson,
            active: false,
            link: '/profile'
        },
        // {
        //     id: 'settings',
        //     label: 'Settings',
        //     icon: MdSettings,
        //     active: false,
        //     link: '/settings'
        // },
        {
            id: 'logout',
            label: 'Sign Out',
            icon: MdExitToApp,
            active: false,
            action: handleLogout,
            danger: true
        }
    ];

    // Handle order card expansion

    const toggleOnlineStatus = async () => {
        if (isTogglingStatus) return; // Prevent multiple simultaneous requests
        
        setIsTogglingStatus(true);
        setStatusError(null);
        
        try {
            const email = rider?.email || profileData?.email;
            if (!email) {
                throw new Error('No email found');
            }
            
            const response = await changeRiderStatus(email);
            
            if (response.status === 200) {
                // Update Redux store with new status
                const newStatus = isOnline ? 'unavailable' : 'available';
                dispatch(updateRiderStatus(newStatus));
                
                // Also update profile data if needed
                // dispatch(fetchRiderProfile(email)); // Remove this to prevent reload
            }
        } catch (error) {
            console.error('Failed to change status:', error);
            setStatusError('Failed to update status. Please try again.');
            
            // Auto-hide error after 3 seconds
            setTimeout(() => {
                setStatusError(null);
            }, 3000);
        } finally {
            setIsTogglingStatus(false);
        }
    };

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
            return date.toLocaleDateString('en-LK', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            { timeZone: "Asia/Colombo" }
        );
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

    // Handle delivery history item click
    const handleDeliveryClick = (delivery) => {
        setSelectedDelivery(delivery);
        setShowDeliveryModal(true);
    };

    // Close delivery modal
    const closeDeliveryModal = () => {
        setShowDeliveryModal(false);
        setSelectedDelivery(null);
    };

    const renderHistoryItem = (delivery) => (
        <div 
            key={delivery.orderId || delivery.deliveryId} 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition duration-200 mb-4 cursor-pointer"
            onClick={() => handleDeliveryClick(delivery)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MdDeliveryDining className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Order #{delivery.orderId || delivery.deliveryId}</h3>
                        <p className="text-gray-600 text-sm">{delivery.customerName || 'Customer'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status || 'DELIVERED'}
                    </span>
                    <p className="text-gray-600 text-xs mt-1">
                        {formatDate(delivery.deliveredAt || delivery.updatedAt)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {/* Pickup Location */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">Pickup</p>
                    <div className="flex items-start space-x-2">
                        <MdLocationOn className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-800 line-clamp-2">
                            {delivery.pickupAddress || 'Pickup Location'}
                        </p>
                    </div>
                </div>

                {/* Delivery Location */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">Delivery</p>
                    <div className="flex items-start space-x-2">
                        <MdLocationOn className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-800 line-clamp-2">
                            {delivery.deliveryAddress || 'Delivery Location'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom row with rating and earnings */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        {renderStars(delivery.rating || 0)}
                    </div>
                    <span className="text-xs text-gray-600">({delivery.rating || 0}/5)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                    <MdAttachMoney className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-bold text-gray-800">
                        {(delivery.totalAmount || delivery.deliveryPrice || 0).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                    <div className="text-center px-4">
                        <div className="mb-6">
                            <img 
                                src={OnlineDeliveryServiceGif} 
                                alt="Loading..." 
                                className="w-32 h-32 sm:w-40 sm:h-40 mx-auto object-contain"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Loading Dashboard</h3>
                            <p className="text-gray-600 text-sm sm:text-base">Please wait while we fetch your delivery data...</p>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Notification - Mobile Responsive */}
            {error && (
                <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 sm:max-w-sm">
                    <div className="bg-red-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex items-start space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <MdError className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base">Error</p>
                            <p className="text-xs sm:text-sm opacity-90 break-words">{typeof error === 'string' ? error : error.message || 'An error occurred'}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Status Error Notification - Mobile Responsive */}
            {statusError && (
                <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 sm:max-w-sm">
                    <div className="bg-red-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex items-start space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <MdError className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base">Error</p>
                            <p className="text-xs sm:text-sm opacity-90 break-words">{typeof error === 'string' ? error : error?.message || 'An error occurred'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-100 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-amber-100 rounded-full opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-6 pb-20 lg:pb-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            {/* Profile Picture */}
                            {/* <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl shadow-lg">
                                <MdDeliveryDining className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div> */}
                            <img 
                                src={logo} 
                                alt="Yumy Logo" 
                                className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" 
                            />
                            <div>
                                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Welcome back, {driverStats.name}!</h1>
                                <p className="text-sm sm:text-base text-gray-600">Here's your delivery dashboard for today</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                    {(profileData?.img_url || rider?.img_url) ? (
                                        <img
                                            src={profileData?.img_url || rider?.img_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <MdPerson className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                {/* Status Indicator */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                    <div className={`w-2.5 h-2.5 rounded-full ${
                                        isOnline ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                    </div>
                                </div>
                            </div>
                            {/* Online Status Toggle */}
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">
                                    {isOnline ? 'Available' : 'Unavailable'}
                                </span>
                                <button
                                    onClick={toggleOnlineStatus}
                                    disabled={isTogglingStatus}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isOnline ? 'bg-orange-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            isOnline ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                    {isTogglingStatus && (
                                        <svg className="absolute inset-0 h-6 w-6 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            <Link
                                to="/profile"
                                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200"
                            >
                                <MdAccountCircle className="h-4 w-4 mr-2" />
                                Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Mobile Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    {/* Today's Earnings */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                                <p className="text-gray-600 text-xs sm:text-sm font-medium">Today's Earnings</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-800">${driverStats.todayEarnings.toFixed(2)}</p>
                                <p className="text-green-600 text-xs sm:text-sm">{driverStats.todayDeliveries} deliveries</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
                                <MdAttachMoney className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Weekly Stats */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                                <p className="text-gray-600 text-xs sm:text-sm font-medium">This Week</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-800">${driverStats.weeklyEarnings.toFixed(2)}</p>
                                <p className="text-blue-600 text-xs sm:text-sm">{driverStats.weeklyDeliveries} deliveries</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
                                <MdLocalShipping className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                                <p className="text-gray-600 text-xs sm:text-sm font-medium">Current Rating</p>
                                <div className="flex items-center space-x-1 mb-1">
                                    <p className="text-lg sm:text-2xl font-bold text-gray-800">{driverStats.currentRating}</p>
                                    <MdStar className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-400" />
                                </div>
                                {/* <p className="text-yellow-600 text-xs sm:text-sm">{driverStats.totalRatings} reviews</p> */}
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
                                <MdStar className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Average Earnings */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                                <p className="text-gray-600 text-xs sm:text-sm font-medium">Average per Delivery</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-800">${driverStats.averageEarningsPerDelivery?.toFixed(2) || '0.00'}</p>
                                <p className="text-green-600 text-xs sm:text-sm">{driverStats.completionRate?.toFixed(1) || '0.0'}% completion rate</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
                                <MdAttachMoney className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
                    {/* Vertical Navigation Sidebar - Mobile Hidden, Tablet+ Visible */}
                    <div className="hidden lg:block lg:col-span-1 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-xl border border-gray-100 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h3>
                            <nav className="space-y-2">
                                {navigationItems.map((item) => {
                                    if (item.link) {
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.link}
                                                className={`flex items-center space-x-3 p-3 rounded-xl transition duration-200 ${
                                                    item.danger
                                                        ? 'hover:bg-red-50 text-red-700'
                                                        : 'hover:bg-orange-50 text-gray-700'
                                                }`}
                                            >
                                                <item.icon className={`h-5 w-5 ${item.danger ? 'text-red-500' : 'text-orange-500'}`} />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    }
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={item.action}
                                            disabled={item.id === 'logout' && isLoggingOut}
                                            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                item.danger
                                                    ? 'hover:bg-red-50 text-red-700'
                                                    : (item.active || (item.id === 'dashboard' && activeTab === 'orders') || (item.id === 'history' && activeTab === 'history'))
                                                        ? 'bg-orange-100 text-orange-700 font-medium'
                                                        : 'hover:bg-orange-50 text-gray-700'
                                            }`}
                                        >
                                            {item.id === 'logout' && isLoggingOut ? (
                                                <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <item.icon className={`h-5 w-5 ${item.danger ? 'text-red-500' : 'text-orange-500'}`} />
                                            )}
                                            <span>
                                                {item.id === 'logout' && isLoggingOut ? 'Signing Out...' : item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                        
                        {/* Current Location Card */}
                        <div 
                            className="bg-white rounded-2xl p-4 lg:p-6 shadow-xl border border-gray-100 sticky top-6 mt-4 cursor-pointer hover:shadow-2xl transition-all duration-200 hover:border-orange-200"
                            onClick={() => locationTracking.isTracking && locationTracking.currentLocation && setShowLocationModal(true)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <MdLocationOn className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Current Location</h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {locationTracking.isTracking && (
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-green-600">Live</span>
                                        </div>
                                    )}
                                    {locationTracking.currentLocation && (
                                        <span className="text-xs text-orange-500 font-medium">Click to view map</span>
                                    )}
                                </div>
                            </div>
                            
                            {locationTracking.isTracking ? (
                                <div className="space-y-2">
                                    {locationTracking.currentAddress ? (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex items-start space-x-2">
                                                    <MdLocationOn className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs text-gray-800 leading-relaxed">
                                                        {locationTracking.currentAddress}
                                                    </span>
                                                </div>
                                                {/* {locationTracking.currentLocation && (
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-gray-600">Accuracy</span>
                                                        <span className="text-xs font-medium text-gray-800">
                                                            ±{locationTracking.currentLocation.accuracy?.toFixed(0) || 'N/A'}m
                                                        </span>
                                                    </div>
                                                )} */}
                                            </div>
                                            {locationTracking.lastUpdated && (
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                    <span className="text-xs text-gray-600">Updated</span>
                                                    <span className="text-xs font-medium text-gray-800">
                                                        {new Date(locationTracking.lastUpdated).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center py-3">
                                            <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-xs text-gray-600">Getting location...</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <MdLocationOff className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 font-medium">Location tracking disabled</p>
                                    <p className="text-xs text-gray-400 mt-1">Enable location for real-time updates</p>
                                    {locationTracking.error && (
                                        <p className="text-xs text-red-500 mt-1">{locationTracking.error}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area - Full width on mobile, 3/4 on desktop */}
                    <div className="col-span-1 lg:col-span-3 order-1 lg:order-2">
                        {/* Tab Navigation - Mobile Responsive */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-2 shadow-lg border border-gray-100 mb-4 sm:mb-6">
                            <div className="flex space-x-1 sm:space-x-2">
                                <button
                                    onClick={() => setActiveTab('available')}
                                    className={`flex-1 flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-medium transition duration-200 text-sm sm:text-base ${
                                        activeTab === 'available'
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <MdList className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Available Orders</span>
                                    <span className="sm:hidden">Available</span>
                                    {availableOrders.length > 0 && (
                                        <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                                            activeTab === 'available' 
                                                ? 'bg-white text-orange-500' 
                                                : 'bg-green-100 text-green-600'
                                        }`}>
                                            {availableOrders.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`flex-1 flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-medium transition duration-200 text-sm sm:text-base ${
                                        activeTab === 'orders'
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <MdDashboard className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">My Orders</span>
                                    <span className="sm:hidden">Mine</span>
                                    {orders.length > 0 && (
                                        <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                                            activeTab === 'orders' 
                                                ? 'bg-white text-orange-500' 
                                                : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            {orders.filter(order => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.status)).length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-medium transition duration-200 text-sm sm:text-base ${
                                        activeTab === 'history'
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <MdHistory className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Recent Deliveries</span>
                                    <span className="sm:hidden">History</span>
                                    {deliveryHistory.length > 0 && (
                                        <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                                            activeTab === 'history' 
                                                ? 'bg-white text-orange-500' 
                                                : 'bg-green-100 text-green-600'
                                        }`}>
                                            {deliveryHistory.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'available' ? (
                            <>
                                {/* Available Orders Loading State */}
                                {availableOrdersLoading && (
                                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">
                                        <div className="text-center py-12">
                                            <svg className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">Loading available orders...</h3>
                                            <p className="text-gray-600">Finding orders near you</p>
                                        </div>
                                    </div>
                                )}

                                {/* Available Orders Error State */}
                                {availableOrdersError && !availableOrdersLoading && (
                                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">
                                        <div className="text-center py-12">
                                            <MdError className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Available Orders</h3>
                                            <p className="text-gray-600 mb-4">{typeof availableOrdersError === 'string' ? availableOrdersError : availableOrdersError?.message || 'Failed to load available orders'}</p>
                                            <button
                                                onClick={() => dispatch(fetchAvailableOrders())}
                                                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                                            >
                                                <MdRefresh className="h-4 w-4 mr-2" />
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Available Orders List */}
                                {!availableOrdersLoading && !availableOrdersError && availableOrders.length > 0 && (
                                    <div className="space-y-6 mb-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-gray-800">Available Orders</h2>
                                            <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                                {availableOrders.length} Available
                                            </span>
                                        </div>
                                        
                                        {availableOrders.map((order) => (
                                            <AvailableOrderCard
                                                key={order.orderId}
                                                order={order}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* No Available Orders State */}
                                {!availableOrdersLoading && !availableOrdersError && availableOrders.length === 0 && (
                                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">
                                        <div className="text-center py-12">
                                            <MdList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">No available orders</h3>
                                            <p className="text-gray-600 mb-6">
                                                {(rider?.status === 'available' || rider?.status === 'online') 
                                                    ? 'New orders will appear here when customers place them'
                                                    : 'You need to be online to see available orders'
                                                }
                                            </p>
                                            {!(rider?.status === 'available' || rider?.status === 'online') && (
                                                <button
                                                    onClick={toggleOnlineStatus}
                                                    disabled={isTogglingStatus}
                                                    className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                                >
                                                    {isTogglingStatus ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                            Going online...
                                                        </>
                                                    ) : (
                                                        'Go Online'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : activeTab === 'orders' ? (
                            <>
                                {/* Order Loading State */}
                                {ordersLoading && (
                            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">
                                <div className="text-center py-12">
                                    <svg className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Loading orders...</h3>
                                    <p className="text-gray-600">Fetching your delivery tasks</p>
                                </div>
                            </div>
                        )}

                        {/* Orders Error State */}
                        {ordersError && !ordersLoading && (
                            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">
                                <div className="text-center py-12">
                                    <MdError className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Orders</h3>
                                    <p className="text-gray-600 mb-4">{typeof ordersError === 'string' ? ordersError : ordersError?.message || 'Failed to load orders'}</p>
                                    <button
                                        onClick={() => dispatch(fetchDeliveryTasks(rider.email))}
                                        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                                    >
                                        <MdRefresh className="h-4 w-4 mr-2" />
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Orders List */}
                        {!ordersLoading && !ordersError && orders.length > 0 && (() => {
                            // Sort orders to show active order first, then by last access time
                            const sortedOrders = [...orders].sort((a, b) => {
                                const aIsActive = activeOrder && (a.deliveryId === activeOrder.deliveryId || a.orderId === activeOrder.orderId);
                                const bIsActive = activeOrder && (b.deliveryId === activeOrder.deliveryId || b.orderId === activeOrder.orderId);
                                
                                if (aIsActive && !bIsActive) return -1;
                                if (bIsActive && !aIsActive) return 1;
                                
                                // If neither or both are active, sort by last access time, then by creation date
                                const aId = a.deliveryId || a.orderId;
                                const bId = b.deliveryId || b.orderId;
                                const aAccessTime = orderAccessTimes[aId] || 0;
                                const bAccessTime = orderAccessTimes[bId] || 0;
                                
                                if (aAccessTime !== bAccessTime) {
                                    return bAccessTime - aAccessTime; // Most recent first
                                }
                                
                                return new Date(b.createdAt || b.orderTime || 0) - new Date(a.createdAt || a.orderTime || 0);
                            });
                            
                            return (
                                <div className="space-y-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
                                        <div className="flex items-center space-x-3">
                                            {activeOrder && (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                                                    Active Order
                                                </span>
                                            )}
                                            <span className="px-4 py-2 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                                                {orders.filter(order => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.status)).length} Active
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {sortedOrders.map((order) => {
                                        const isActiveOrder = activeOrder && (order.deliveryId === activeOrder.deliveryId || order.orderId === activeOrder.orderId);
                                        const orderId = order.deliveryId || order.orderId;
                                        const lastAccessed = orderAccessTimes[orderId];
                                        
                                        return (
                                            <div key={orderId} className={`relative ${isActiveOrder ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                                                {isActiveOrder && (
                                                    <div className="absolute -top-2 -right-2 z-10">
                                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                                            Active
                                                        </span>
                                                    </div>
                                                )}
                                                {lastAccessed && (
                                                    <div className="absolute -top-2 -left-2 z-10">
                                                        <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                                            Last: {new Date(lastAccessed).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`${isActiveOrder ? 'bg-blue-50 border-blue-200' : 'bg-white'} rounded-2xl border transition-all duration-200`}>
                                                    <OrderCard
                                                        order={order}
                                                        isActiveOrder={isActiveOrder}
                                                        onStatusUpdate={trackOrderStatusUpdate}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}

                        {/* No Orders State */}
                        {!ordersLoading && !ordersError && orders.length === 0 && (
                            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">
                                <div className="text-center py-12">
                                    <MdDeliveryDining className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">No active orders</h3>
                                    <p className="text-gray-600 mb-6">
                                        {(rider?.status === 'available' || rider?.status === 'online') 
                                            ? 'New orders will appear here when available'
                                            : 'Go online to start receiving orders'
                                        }
                                    </p>
                                    {!(rider?.status === 'available' || rider?.status === 'online') && (
                                        <button
                                            onClick={toggleOnlineStatus}
                                            disabled={isTogglingStatus}
                                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                                        >
                                            {isTogglingStatus ? (
                                                <MdRefresh className="h-5 w-5 animate-spin mr-2" />
                                            ) : (
                                                <MdCheckCircle className="h-5 w-5 mr-2" />
                                            )}
                                            Go Online
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                            </>
                        ) : (
                            <>
                                {/* History Loading State */}
                                {historyLoading && (
                                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">
                                        <div className="text-center py-12">
                                            <svg className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">Loading delivery history...</h3>
                                            <p className="text-gray-600">Fetching Your delivery history</p>
                                        </div>
                                    </div>
                                )}

                                {/* History Error State */}
                                {historyError && !historyLoading && (
                                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">
                                        <div className="text-center py-12">
                                            <MdError className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading History</h3>
                                            <p className="text-gray-600 mb-4">
                                                {typeof historyError === 'string' ? historyError : historyError?.message || 'Failed to load delivery history'}
                                            </p>
                                            <button
                                                onClick={() => dispatch(fetchDeliveryHistory({ 
                                                    email: rider.email, 
                                                    page: historyPagination.currentPage, 
                                                    size: historyPagination.pageSize,
                                                    orderId: historyFilters.orderId,
                                                    date: historyFilters.date
                                                }))}
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
                                        {/* Filter Toggle Button */}
                                        <div className="flex items-center justify-between mb-2">
                                            <button
                                                onClick={() => setShowFilters(!showFilters)}
                                                className={`inline-flex items-center px-4 py-2 rounded-lg transition duration-200 ${
                                                    hasActiveFilters 
                                                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <MdFilterList className="h-5 w-5 mr-2" />
                                                {hasActiveFilters ? 'Filters Active' : 'Filter History'}
                                                {hasActiveFilters && (
                                                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                        {(historyFilters.orderId ? 1 : 0) + (historyFilters.date ? 1 : 0)}
                                                    </span>
                                                )}
                                            </button>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200 text-sm"
                                                >
                                                    <MdClose className="h-4 w-4 mr-1" />
                                                    Clear Filters
                                                </button>
                                            )}
                                        </div>

                                        {/* Collapsible Filter Section */}
                                        {showFilters && (
                                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-4 animate-fadeIn">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    {/* Order ID Filter */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <MdSearch className="inline h-4 w-4 mr-1" />
                                                            Order ID
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={filterOrderId}
                                                            onChange={(e) => setFilterOrderId(e.target.value)}
                                                            placeholder="Enter order ID"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    
                                                    {/* Date Filter */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <MdCalendarToday className="inline h-4 w-4 mr-1" />
                                                            Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={filterDate}
                                                            onChange={(e) => setFilterDate(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={handleApplyFilters}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                                                >
                                                    <MdSearch className="h-4 w-4 mr-2" />
                                                    Apply Filters
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-800">
                                                    Recent Deliveries
                                                </h2>
                                                <p className="text-sm text-gray-600">
                                                    Page {historyPagination.currentPage + 1} • Showing {deliveryHistory.length} of 5 deliveries per page
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Reset pagination and fetch fresh data
                                                    dispatch(setHistoryPage(0));
                                                    dispatch(fetchDeliveryHistory({ 
                                                        email: rider.email, 
                                                        page: 0, 
                                                        size: historyPagination.pageSize,
                                                        orderId: historyFilters.orderId,
                                                        date: historyFilters.date
                                                    }));
                                                }}
                                                disabled={historyLoading}
                                                className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition duration-200 disabled:opacity-50 text-sm"
                                            >
                                                <MdRefresh className={`h-4 w-4 mr-1 ${historyLoading ? 'animate-spin' : ''}`} />
                                                Refresh
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {deliveryHistory.map(renderHistoryItem)}
                                        </div>
                                        
                                        {/* Pagination Controls - Mobile Responsive */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
                                            {/* Previous Button */}
                                            <button
                                                onClick={goToPrevPage}
                                                disabled={historyPagination.currentPage === 0 || historyLoading}
                                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                            >
                                                <MdViewList className="h-4 w-4 mr-2 rotate-180" />
                                                Previous 5
                                            </button>
                                            
                                            {/* Page Info */}
                                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                                <span>Page {historyPagination.currentPage + 1}</span>
                                                <span>•</span>
                                                <span className="hidden sm:inline">{deliveryHistory.length} deliveries</span>
                                                <span className="sm:hidden">{deliveryHistory.length} items</span>
                                            </div>
                                            
                                            {/* Next Button or Placeholder */}
                                            {historyPagination.hasMore ? (
                                                <button
                                                    onClick={goToNextPage}
                                                    disabled={historyLoading}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                                >
                                                    {historyLoading ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Next 5
                                                            <MdViewList className="h-4 w-4 ml-2" />
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="w-full sm:w-auto text-center sm:text-left text-sm text-green-600 font-medium px-4 py-3 sm:py-2">
                                                    Last Page
                                                </div>
                                            )}
                                        </div>

                                        {/* Load More Button */}
                                        {canLoadMoreHistory && false && (
                                            <div className="text-center mt-4">
                                                <button
                                                    onClick={goToNextPage}
                                                    disabled={historyLoading}
                                                    className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {historyLoading ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MdViewList className="h-4 w-4 mr-2" />
                                                            Next 5 Deliveries
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* End of Results Message - only show when on last page */}
                                        {!historyPagination.hasMore && deliveryHistory.length < historyPagination.pageSize && (
                                            <div className="text-center mt-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                                                <MdCheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                                <p className="text-gray-700 font-medium text-sm">
                                                    That's all your delivery history!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* No History State */}
                                {!historyLoading && !historyError && deliveryHistory.length === 0 && (
                                    <div className="space-y-4">
                                        {/* Filter Toggle Button */}
                                        <div className="flex items-center justify-between mb-2">
                                            <button
                                                onClick={() => setShowFilters(!showFilters)}
                                                className={`inline-flex items-center px-4 py-2 rounded-lg transition duration-200 ${
                                                    hasActiveFilters 
                                                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <MdFilterList className="h-5 w-5 mr-2" />
                                                {hasActiveFilters ? 'Filters Active' : 'Filter History'}
                                                {hasActiveFilters && (
                                                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                        {(historyFilters.orderId ? 1 : 0) + (historyFilters.date ? 1 : 0)}
                                                    </span>
                                                )}
                                            </button>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200 text-sm"
                                                >
                                                    <MdClose className="h-4 w-4 mr-1" />
                                                    Clear Filters
                                                </button>
                                            )}
                                        </div>

                                        {/* Collapsible Filter Section */}
                                        {showFilters && (
                                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-fadeIn">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    {/* Order ID Filter */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <MdSearch className="inline h-4 w-4 mr-1" />
                                                            Order ID
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={filterOrderId}
                                                            onChange={(e) => setFilterOrderId(e.target.value)}
                                                            placeholder="Enter order ID"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    
                                                    {/* Date Filter */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            <MdCalendarToday className="inline h-4 w-4 mr-1" />
                                                            Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={filterDate}
                                                            onChange={(e) => setFilterDate(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={handleApplyFilters}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                                                >
                                                    <MdSearch className="h-4 w-4 mr-2" />
                                                    Apply Filters
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* Empty Results Message */}
                                        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                                            <div className="text-center py-12">
                                                <MdHistory className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                    {hasActiveFilters ? 'No matching deliveries found' : 'No delivery history yet'}
                                                </h3>
                                                <p className="text-gray-600 mb-6">
                                                    {hasActiveFilters 
                                                        ? 'Try adjusting your filters or clearing them to see all deliveries'
                                                        : 'Your completed deliveries will appear here as you make them'
                                                    }
                                                </p>
                                                {hasActiveFilters ? (
                                                    <button
                                                        onClick={handleClearFilters}
                                                        className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200"
                                                    >
                                                        <MdClose className="h-4 w-4 mr-2" />
                                                        Clear Filters
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setActiveTab('orders')}
                                                        className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200"
                                                    >
                                                        <MdList className="h-4 w-4 mr-2" />
                                                        View Active Orders
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Permission Modal */}
            <LocationPermissionModal
                isOpen={locationTracking.showPermissionModal}
                onAllow={locationTracking.handleAllowLocation}
                onDeny={locationTracking.handleDenyLocation}
                onClose={locationTracking.handleCloseModal}
            />

            {/* Location Map Modal */}
            <LocationMapModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                location={locationTracking.currentLocation}
                address={locationTracking.currentAddress}
            />

            {/* Delivery Details Modal */}
            {showDeliveryModal && selectedDelivery && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        {/* Background overlay */}
                        <div
                            className="fixed inset-0 bg-gray-300/50 backdrop-blur-sm transition-opacity"
                            onClick={closeDeliveryModal}
                        ></div>

                        {/* Modal content */}
                        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                            {/* Modal header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <MdDeliveryDining className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Order #{selectedDelivery.orderId || selectedDelivery.deliveryId}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(selectedDelivery.deliveredAt || selectedDelivery.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeDeliveryModal}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition duration-200"
                                >
                                    <span className="text-gray-500 text-xl">&times;</span>
                                </button>
                            </div>

                            {/* Status badge */}
                            <div className="mb-6">
                                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedDelivery.status)}`}>
                                    {selectedDelivery.status || 'DELIVERED'}
                                </span>
                            </div>

                            {/* Delivery details grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Restaurant/Pickup Details */}
                                <div className="bg-orange-50 rounded-xl p-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <MdRestaurant className="h-5 w-5 text-orange-600" />
                                        <h4 className="font-semibold text-gray-800">Pickup Location</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-medium text-gray-900">
                                            {selectedDelivery.restaurantName || 'Restaurant'}
                                        </p>
                                        <div className="flex items-start space-x-2">
                                            <MdLocationOn className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">
                                                {selectedDelivery.pickupAddress || 'Pickup address not available'}
                                            </p>
                                        </div>
                                        {selectedDelivery.restaurantPhone && (
                                            <div className="flex items-center space-x-2">
                                                <MdPhone className="h-4 w-4 text-orange-500" />
                                                <p className="text-sm text-gray-700">{selectedDelivery.restaurantPhone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Customer/Delivery Details */}
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <MdPerson className="h-5 w-5 text-green-600" />
                                        <h4 className="font-semibold text-gray-800">Customer Details</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-medium text-gray-900">
                                            {selectedDelivery.customerName || 'Customer'}
                                        </p>
                                        <div className="flex items-start space-x-2">
                                            <MdLocationOn className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">
                                                {selectedDelivery.deliveryAddress || 'Delivery address not available'}
                                            </p>
                                        </div>
                                        {selectedDelivery.customerPhone && (
                                            <div className="flex items-center space-x-2">
                                                <MdPhone className="h-4 w-4 text-green-500" />
                                                <p className="text-sm text-gray-700">{selectedDelivery.customerPhone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order items */}
                            {selectedDelivery.orderItems && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <MdList className="h-5 w-5 mr-2 text-blue-600" />
                                        Order Items
                                    </h4>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="space-y-2">
                                            {Array.isArray(selectedDelivery.orderItems) ? (
                                                selectedDelivery.orderItems.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-1">
                                                        <span className="text-gray-700">
                                                            {typeof item === 'string' ? item : `${item.quantity || 1}x ${item.itemName || item.name || 'Item'}`}
                                                        </span>
                                                        {typeof item === 'object' && item.price && (
                                                            <span className="text-gray-600">
                                                                ${(item.price * (item.quantity || 1)).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600">Order items not available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment and rating info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {/* Payment details */}
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <MdAttachMoney className="h-5 w-5 mr-2 text-blue-600" />
                                        Payment Details
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedDelivery.order_price && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Order Total:</span>
                                                <span className="font-medium">${selectedDelivery.order_price.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Fee:</span>
                                            <span className="font-medium">${(selectedDelivery.deliveryPrice || selectedDelivery.totalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        {selectedDelivery.order_price && selectedDelivery.deliveryPrice && (
                                            <div className="flex justify-between pt-2 border-t border-blue-200">
                                                <span className="font-semibold text-gray-800">Total:</span>
                                                <span className="font-bold text-blue-600">
                                                    ${(selectedDelivery.order_price + selectedDelivery.deliveryPrice).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="bg-yellow-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <MdStar className="h-5 w-5 mr-2 text-yellow-600" />
                                        Rating & Performance
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-1">
                                                {renderStars(selectedDelivery.rating || 0)}
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                ({selectedDelivery.rating || 0}/5)
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Customer satisfaction rating
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline information */}
                            {(selectedDelivery.acceptedAt || selectedDelivery.pickedAt || selectedDelivery.deliveredAt) && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <MdTimer className="h-5 w-5 mr-2 text-purple-600" />
                                        Delivery Timeline
                                    </h4>
                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <div className="space-y-2 text-sm">
                                            {selectedDelivery.acceptedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Accepted:</span>
                                                    <span className="font-medium">{formatDate(selectedDelivery.acceptedAt)}</span>
                                                </div>
                                            )}
                                            {selectedDelivery.pickedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Picked up:</span>
                                                    <span className="font-medium">{formatDate(selectedDelivery.pickedAt)}</span>
                                                </div>
                                            )}
                                            {selectedDelivery.deliveredAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Delivered:</span>
                                                    <span className="font-medium">{formatDate(selectedDelivery.deliveredAt)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Close button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={closeDeliveryModal}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation - Only visible on mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
                <div className="grid grid-cols-4 h-16">
                    {navigationItems.slice(0, 4).map((item) => {
                        if (item.link) {
                            return (
                                <Link
                                    key={item.id}
                                    to={item.link}
                                    className={`flex flex-col items-center justify-center space-y-1 ${
                                        item.danger ? 'text-red-600' : 'text-gray-600'
                                    } hover:bg-gray-50 transition duration-200`}
                                >
                                    <item.icon className={`h-5 w-5 ${item.danger ? 'text-red-500' : 'text-orange-500'}`} />
                                    <span className="text-xs">{item.label.split(' ')[0]}</span>
                                </Link>
                            );
                        }
                        return (
                            <button
                                key={item.id}
                                onClick={item.action}
                                disabled={item.id === 'logout' && isLoggingOut}
                                className={`flex flex-col items-center justify-center space-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    item.danger
                                        ? 'text-red-600 hover:bg-red-50'
                                        : (item.active || (item.id === 'dashboard' && activeTab === 'orders') || (item.id === 'history' && activeTab === 'history'))
                                            ? 'text-orange-600 bg-orange-50'
                                            : 'text-gray-600 hover:bg-gray-50'
                                } transition duration-200`}
                            >
                                {item.id === 'logout' && isLoggingOut ? (
                                    <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <item.icon className={`h-5 w-5 ${item.danger ? 'text-red-500' : 'text-orange-500'}`} />
                                )}
                                <span className="text-xs">
                                    {item.id === 'logout' && isLoggingOut ? 'Signing...' : item.label.split(' ')[0]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Location Floating Button */}
            {locationTracking.isTracking && locationTracking.currentLocation && (
                <button
                    onClick={() => setShowLocationModal(true)}
                    className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl transition-all duration-200 hover:scale-110 z-40 flex items-center justify-center"
                    title="View current location"
                >
                    <div className="relative">
                        <MdLocationOn className="h-6 w-6" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                    </div>
                </button>
            )}
        </div>
    );
};

export default Dashboard;
