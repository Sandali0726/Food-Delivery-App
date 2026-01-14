import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess, updateRiderStatus } from '../features/auth/authSlice';
import { fetchRiderProfile, clearProfile } from '../features/profileSlice';
import { updateRiderProfile, changeRiderStatus, getRiderReviews, getRiderStatistics } from '../api/profile';
import {
    fetchRiderStatistics,
    selectStatistics,
    selectStatisticsLoading,
    selectStatisticsError,
    clearStatistics
} from '../features/statisticsSlice';
import { changePassword, logout } from '../api/auth';
import OnlineDeliveryServiceGif from '../assets/Online Delivery Service.gif';
import useLocationTracking from '../hooks/useLocationTracking';
import LocationPermissionModal from '../components/LocationPermissionModal';
import { useNotification } from '../contexts/NotificationContext';
import { connectSocket, disconnectSocket } from '../api/ws';
import { availableOrdersSubscribe } from '../socketSubscribers/availableOrders';
import { addAvailableOrder, removeAvailableOrder } from '../features/availableOrdersSlice';
import { 
    MdEmail, 
    MdPhone,
    MdLocationOn,
    MdPerson,
    MdStar,
    MdStarBorder,
    MdDirectionsCar,
    MdCardMembership,
    MdDeliveryDining,
    MdEdit,
    MdLogout,
    MdDashboard,
    MdHistory,
    MdSettings,
    MdVerified,
    MdAccessTime,
    MdTrendingUp,
    MdError,
    MdSave,
    MdCancel,
    MdCameraAlt,
    MdCheckCircle,
    MdLock,
    MdVisibility,
    MdVisibilityOff,
    MdClose,
    MdAttachMoney,
    MdPhoto
} from 'react-icons/md';
import logo from '../assets/logo.png';

const Profile = () => {
    const dispatch = useDispatch();
    const { rider } = useSelector((state) => state.auth);
    const { user: profileData, isLoading, error } = useSelector((state) => state.profile);
    
    // Initialize location tracking
    useLocationTracking();
    
    // Initialize notification system
    const { showOrderNotification, showSuccessNotification, showErrorNotification } = useNotification();
    
    // Socket state for order notifications
    const [socketClient, setSocketClient] = useState(null);
    const [socketSubscription, setSocketSubscription] = useState(null);
    
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    // Password change modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    // Initialize location tracking
    const locationTracking = useLocationTracking();
    
    // Use profile data from API or fallback to auth data
    const driverData = {
        first_name: profileData?.first_name || rider?.first_name || 'John',
        last_name: profileData?.last_name || rider?.last_name || 'Smith',
        email: profileData?.email || rider?.email || 'john.smith@email.com',
        phone_number: profileData?.phone_number || rider?.phone_number || '+1 (555) 123-4567',
        address: profileData?.address || rider?.address || 'No Address Provided',
        img_url: profileData?.img_url || rider?.img_url || 'https://via.placeholder.com/150',
        licence: profileData?.licence || rider?.licence || 'No Licence Info',
        vehicle_no: profileData?.vehicle_no || rider?.vehicle_no || 'No Vehicle Info',
        rating: profileData?.rating || rider?.rating || 0.0,
        total_reviews: profileData?.total_reviews || 0.0,
        total_deliveries: profileData?.total_deliveries || rider?.total_deliveries || 1247,
        member_since: profileData?.created_at || profileData?.member_since || '2024-03-15',
        status: profileData?.status || rider?.status || 'unavailable',
        verification_status: profileData?.verification_status || 'verified'
    };
    
    // Form data for editing
    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        address: '',
        licence: '',
        vehicle_no: ''
    });

    // Fetch profile data when component mounts
    useEffect(() => {
        if (rider?.email && !profileData) {
            dispatch(fetchRiderProfile(rider.email));
        }
    }, [dispatch, rider?.email, profileData]);
    
    // Fetch reviews when component mounts or rider email changes
    useEffect(() => {
        const fetchReviews = async () => {
            if (!rider?.email) return;
            
            setReviewsLoading(true);
            setReviewsError(null);
            
            try {
                const response = await getRiderReviews(rider.email);
                
                // Transform API data to match component expectations
                const transformedReviews = response.data.map((review, index) => ({
                    id: index + 1,
                    customer_name: review.customerEmail,
                    rating: review.rating,
                    comment: review.review || 'No comment provided',
                    order_id: `#ORD-${review.orderId}`,
                    dateTime: review.createdAt,
                    createdAt: review.createdAt
                }));
                
                // Sort by order ID descending (newest first)
                // transformedReviews.sort((a, b) => b.order_id.localeCompare(a.order_id));
                
                setReviews(transformedReviews);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
                if(error?.response?.data == `NOT_FOUND: No reviews for rider: ${rider.email}`) {
                setReviewsError('No reviews found for this rider.');
                setReviews([]);
                } else {
                setReviewsError('Failed to load reviews. Please try again later.');
                }
            } finally {
                setReviewsLoading(false);
            }
        };
        
        fetchReviews();
    }, [rider?.email]);
    
    // Fetch statistics when component mounts
    useEffect(() => {
        if (rider?.email) {
            dispatch(fetchRiderStatistics(rider.email));
        }
    }, [rider?.email, dispatch]);
    
    // Setup socket connection for order notifications (same as dashboard)
    useEffect(() => {
        if (rider?.email && (rider?.status === 'available' || rider?.status === 'online') && !socketSubscription) {
            const setupSocket = async () => {
                try {
                    console.log('🔌 Setting up socket connection in profile for rider:', rider.email);
                    const client = await connectSocket();
                    setSocketClient(client);
                    console.log('✅ Socket client connected in profile');
                    
                    const subscription = availableOrdersSubscribe(client, (messageData) => {
                        if (messageData.type === "ORDER_CREATED") {
                            console.log("🆕 New order created (profile page):", messageData.payload);
                            
                            // Add to Redux store
                            dispatch(addAvailableOrder(messageData.payload));
                            
                            // Show notification
                            showOrderNotification(messageData.payload);
                            
                            // Browser notification (if permission granted)
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification('New Delivery Order!', {
                                    body: `Order #${messageData.payload.orderId} - ${messageData.payload.distance} away`,
                                    icon: '/favicon.ico',
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
                            console.log("🗑️ Order removed (profile page):", messageData.payload);
                            dispatch(removeAvailableOrder(messageData.payload.orderId));
                        }
                    });
                    
                    setSocketSubscription(subscription);
                } catch (error) {
                    console.error('❌ Error setting up socket connection in profile:', error);
                }
            };
            
            setupSocket();
        }
        
        // Cleanup socket when component unmounts or rider goes offline
        return () => {
            if (socketSubscription) {
                console.log('🧹 Cleaning up profile socket subscription');
                socketSubscription.unsubscribe();
                setSocketSubscription(null);
            }
            // Don't disconnect the global client here, let it be managed by ws.js
            // The next page will reuse the connection if needed
        };
    }, [rider?.email, rider?.status, dispatch, showOrderNotification]);
    
    // Initialize form data only when entering edit mode for the first time
    useEffect(() => {
        if (isEditing && driverData) {
            setEditForm({
                first_name: driverData.first_name,
                last_name: driverData.last_name,
                phone_number: driverData.phone_number,
                address: driverData.address,
                licence: driverData.licence,
                vehicle_no: driverData.vehicle_no
            });
        }
    }, [isEditing]); // Only depend on isEditing, not driverData
    
    // Auto-hide success message
    useEffect(() => {
        if (updateSuccess) {
            const timer = setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [updateSuccess]);

    // Auto-hide update error after a short delay
    useEffect(() => {
        if (updateError) {
            const timer = setTimeout(() => {
                setUpdateError(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [updateError]);

    // Auto-hide password change success
    useEffect(() => {
        if (passwordChangeSuccess) {
            const timer = setTimeout(() => {
                setPasswordChangeSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [passwordChangeSuccess]);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
    
    // Statistics from Redux
    const statistics = useSelector(selectStatistics);
    const statisticsLoading = useSelector(selectStatisticsLoading);
    const statisticsError = useSelector(selectStatisticsError);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<MdStar key={i} className="h-5 w-5 text-yellow-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<MdStar key={i} className="h-5 w-5 text-yellow-400" />);
            } else {
                stars.push(<MdStarBorder key={i} className="h-5 w-5 text-gray-300" />);
            }
        }
        return stars;
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Check if current status is available, then change to unavailable via API
            if (rider?.status === 'available') {
                console.log('Changing status from available to unavailable before logout');
                await changeRiderStatus(rider.email);
                // Update Redux state to reflect the change
                dispatch(updateRiderStatus('unavailable'));
            }
        } catch (error) {
            console.error('Failed to change status during logout:', error);
            // Continue with logout even if status change fails
        } finally {
            // Always proceed with logout and clear all Redux state
            dispatch(logoutSuccess());
            dispatch(clearProfile());
            dispatch(clearStatistics());
            const response = logout();
            console.log(response);
            setIsLoggingOut(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    const formatReviewDate = (dateString) => {
  console.log('Formatting review date for:', dateString);

  // KEEP the Z — this ensures correct UTC → local conversion
  const date = new Date(dateString);
  const now = new Date();

  console.log('Formatting review date:', date, 'Current date:', now);

  // Normalize both dates to midnight (local)
  const reviewDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = today - reviewDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  console.log('Difference in days:', diffDays);

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

    
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setUpdateError(null);
        setUpdateSuccess(false);
        if (!isEditing) {
            // Reset form when entering edit mode
            setEditForm({
                first_name: driverData.first_name,
                last_name: driverData.last_name,
                phone_number: driverData.phone_number,
                address: driverData.address,
                licence: driverData.licence,
                vehicle_no: driverData.vehicle_no
            });
            setSelectedImage(null);
            setImagePreview(null);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setUpdateError('Please select a valid image file.');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setUpdateError('Image size must be less than 5MB.');
                return;
            }
            
            setSelectedImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Clear any previous errors
            setUpdateError(null);
        }
    };
    
    const handleSaveProfile = async () => {
        setIsUpdating(true);
        setUpdateError(null);
        
        try {
            const profileDataToUpdate = {
                email: driverData.email, // Required for identification
                ...editForm
            };
            
            const response = await updateRiderProfile(profileDataToUpdate, selectedImage);
            
            if (response.status === 201) {
                setUpdateSuccess(true);
                setIsEditing(false);
                
                // Refresh profile data
                dispatch(fetchRiderProfile(driverData.email));
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            setUpdateError(error.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Password change handlers
    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear specific error when user starts typing
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };
    
    const validatePasswordForm = () => {
        const errors = {};
        
        if (!passwordForm.oldPassword) {
            errors.oldPassword = 'Current password is required';
        }
        
        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        
        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (passwordForm.oldPassword === passwordForm.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }
        
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handlePasswordChange = async () => {
        if (!validatePasswordForm()) return;
        
        setIsChangingPassword(true);
        
        try {
            const response = await changePassword(
                driverData.email,
                passwordForm.oldPassword,
                passwordForm.newPassword
            );
            
            if (response.status === 201) {
                setPasswordChangeSuccess(true);
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordModal(false);
                
                // Auto-hide success message
                setTimeout(() => {
                    setPasswordChangeSuccess(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            setPasswordErrors({
                general: error.response?.data || 'Failed to change password. Please try again.'
            });
        } finally {
            setIsChangingPassword(false);
        }
    };
    
    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
        setShowPasswords({ old: false, new: false, confirm: false });
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Loading State */}
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
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Loading Profile</h3>
                            <p className="text-gray-600 text-sm sm:text-base">Please wait while we fetch your profile information...</p>
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

            {/* Error State - Mobile Responsive */}
            {error && (
                <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 sm:max-w-sm animate-slide-down" aria-live="assertive" role="alert">
                    <div className="bg-red-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <MdError className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base">Error</p>
                            <p className="text-xs sm:text-sm opacity-90 break-words">{error}</p>
                        </div>
                        <button
                            onClick={() => dispatch(clearProfile())}
                            className="ml-2 text-white hover:text-red-200 transition-colors duration-200 flex-shrink-0"
                            aria-label="Dismiss notification"
                        >
                            <MdClose className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Update Success State - Mobile Responsive */}
            {updateSuccess && (
                <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 sm:max-w-sm animate-slide-down" aria-live="polite" role="status">
                    <div className="bg-green-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <MdCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base">Success</p>
                            <p className="text-xs sm:text-sm opacity-90">Profile updated successfully!</p>
                        </div>
                        <button
                            onClick={() => setUpdateSuccess(false)}
                            className="ml-2 text-white hover:text-green-200 transition-colors duration-200 flex-shrink-0"
                            aria-label="Dismiss notification"
                        >
                            <MdClose className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Password Change Success State - Mobile Responsive */}
            {passwordChangeSuccess && (
                <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 sm:max-w-sm animate-slide-down" aria-live="polite" role="status">
                    <div className="bg-green-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <MdCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base">Success</p>
                            <p className="text-xs sm:text-sm opacity-90">Password changed successfully!</p>
                        </div>
                        <button
                            onClick={() => setPasswordChangeSuccess(false)}
                            className="ml-2 text-white hover:text-green-200 transition-colors duration-200 flex-shrink-0"
                            aria-label="Dismiss notification"
                        >
                            <MdClose className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Update Error State - Mobile Responsive */}
            {updateError && (
                <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 sm:max-w-sm animate-slide-down" aria-live="assertive" role="alert">
                    <div className="bg-red-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <MdError className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base">Update Failed</p>
                            <p className="text-xs sm:text-sm opacity-90 break-words">{updateError}</p>
                        </div>
                        <button
                            onClick={() => setUpdateError(null)}
                            className="ml-2 text-white hover:text-red-200 transition-colors duration-200 flex-shrink-0"
                            aria-label="Dismiss notification"
                        >
                            <MdClose className="h-4 w-4" />
                        </button>
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
                {/* Header - Mobile Responsive */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            {/* <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl shadow-lg">
                                <MdDeliveryDining className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div> */}
                            <img 
                                src={logo} 
                                alt="Yumy Logo" 
                                className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" 
                            />
                            <div>
                                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Driver Profile</h1>
                                <p className="text-sm sm:text-base text-gray-600">Manage your Yumy driver account</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition duration-200"
                            >
                                <MdDashboard className="h-4 w-4 mr-2" />
                                Dashboard
                            </Link>
                            {isEditing ? (
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={isUpdating}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none font-medium"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <MdSave className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        onClick={handleEditToggle}
                                        disabled={isUpdating}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none font-medium"
                                    >
                                        <MdCancel className="h-4 w-4 mr-2" />
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleEditToggle}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                                >
                                    <MdEdit className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                    {/* Main Profile Section */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                                {/* Profile Image */}
                                <div className="relative self-center sm:self-start group">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg">
                                        {(imagePreview || driverData.img_url) ? (
                                            <img
                                                src={imagePreview || driverData.img_url}
                                                alt={`${driverData.first_name} ${driverData.last_name} - Profile`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        {/* Fallback avatar */}
                                        <div 
                                            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 ${(imagePreview || driverData.img_url) ? 'hidden' : 'flex'}`}
                                            style={{display: (imagePreview || driverData.img_url) ? 'none' : 'flex'}}
                                        >
                                            <MdPerson className="h-12 w-12 sm:h-14 sm:w-14 text-orange-400" />
                                        </div>
                                    </div>
                                    
                                    {/* Status Indicator */}
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${
                                            driverData.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                                        } animate-pulse`}>
                                        </div>
                                    </div>
                                    
                                    {/* Current Image Indicator when not editing */}
                                    {!isEditing && driverData.img_url && (
                                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                            <MdPhoto className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                    
                                    {/* Edit overlay when in edit mode */}
                                    {isEditing && (
                                        <>
                                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center cursor-pointer group/edit hover:bg-opacity-50 transition-all duration-300"
                                                 onClick={() => document.getElementById('profileImageInput').click()}>
                                                <div className="bg-white bg-opacity-90 rounded-full p-2 group-hover/edit:bg-opacity-100 transition-all duration-200">
                                                    <MdCameraAlt className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover/edit:scale-110 transition-transform duration-200" />
                                                </div>
                                            </div>
                                            {/* Upload instruction */}
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border">
                                                    Click to change photo
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    
                                    <input
                                        id="profileImageInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Driver Details */}
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        {/*Profile Image - Small version for name section*/}
                                        {/* <div className="relative">
                                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                                                {(imagePreview || driverData.img_url) ? (
                                                    <img
                                                        src={imagePreview || driverData.img_url}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <MdPerson className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Status Indicator */}
                                            {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center border border-white shadow-sm">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    driverData.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                </div>
                                            </div>
                                        </div>  */}
                                        
                                        {isEditing ? (
                                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start sm:items-center w-full">
                                                <div className="relative flex-1 group">
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        value={editForm.first_name}
                                                        onChange={handleInputChange}
                                                        className="w-full text-lg font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 hover:border-gray-300 shadow-sm hover:shadow-md"
                                                        placeholder="First Name"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                                <div className="relative flex-1 group">
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        value={editForm.last_name}
                                                        onChange={handleInputChange}
                                                        className="w-full text-lg font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 hover:border-gray-300 shadow-sm hover:shadow-md"
                                                        placeholder="Last Name"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                {driverData.first_name} {driverData.last_name}
                                            </h2>
                                        )}
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            driverData.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {driverData.status}
                                        </span>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="flex items-center space-x-1">
                                            {renderStars(driverData.rating)}
                                        </div>
                                        <span className="text-lg font-semibold text-gray-800">
                                            {driverData.rating}
                                        </span>
                                        {/* <span className="text-gray-600">
                                            ({driverData.total_reviews} reviews)
                                        </span> */}
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <MdEmail className="h-5 w-5 text-orange-500" />
                                            <span>{driverData.email}</span>
                                            {isEditing && (
                                                <span className="text-xs text-gray-400">(Cannot be changed)</span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <div className="flex-shrink-0">
                                                <MdPhone className="h-5 w-5 text-orange-500" />
                                            </div>
                                            {isEditing ? (
                                                <div className="flex-1 relative group">
                                                    <input
                                                        type="tel"
                                                        name="phone_number"
                                                        value={editForm.phone_number}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 hover:border-gray-300 shadow-sm hover:shadow-md"
                                                        placeholder="Enter phone number"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
                                                </div>
                                            ) : (
                                                <span className="flex-1">{driverData.phone_number}</span>
                                            )}
                                        </div>
                                        <div className="flex items-start space-x-3 text-gray-600">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <MdLocationOn className="h-5 w-5 text-orange-500" />
                                            </div>
                                            {isEditing ? (
                                                <div className="flex-1 relative group">
                                                    <textarea
                                                        name="address"
                                                        value={editForm.address}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 hover:border-gray-300 shadow-sm hover:shadow-md resize-none"
                                                        rows="3"
                                                        placeholder="Enter your address"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
                                                </div>
                                            ) : (
                                                <span className="flex-1 leading-relaxed">{driverData.address}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle & License Information */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 transition-all duration-300 hover:shadow-3xl">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-3"></div>
                                Vehicle & License Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 group">
                                    <label className="text-gray-600 text-sm font-medium flex items-center">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                        Driver's License
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl focus-within:ring-4 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-300 hover:border-gray-300 shadow-sm hover:shadow-md bg-white">
                                                <MdCardMembership className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    name="licence"
                                                    value={editForm.licence}
                                                    onChange={handleInputChange}
                                                    className="flex-1 outline-none font-medium text-gray-800 bg-transparent"
                                                    placeholder="Enter license number"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border border-gray-100">
                                            <MdCardMembership className="h-5 w-5 text-orange-500" />
                                            <span className="font-medium text-gray-800">{driverData.licence}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-gray-600 text-sm font-medium flex items-center">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                        Vehicle Number
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl focus-within:ring-4 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-300 hover:border-gray-300 shadow-sm hover:shadow-md bg-white">
                                                <MdDirectionsCar className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    name="vehicle_no"
                                                    value={editForm.vehicle_no}
                                                    onChange={handleInputChange}
                                                    className="flex-1 outline-none font-medium text-gray-800 bg-transparent"
                                                    placeholder="Enter vehicle number"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border border-gray-100">
                                            <MdDirectionsCar className="h-5 w-5 text-orange-500" />
                                            <span className="font-medium text-gray-800">{driverData.vehicle_no}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Recent Reviews ({reviews.length})</h3>
                                {reviews.length > 0 && (
                                    <button
                                        onClick={() => setShowAllReviewsModal(true)}
                                        className="text-orange-500 hover:text-orange-600 font-medium transition duration-200"
                                    >
                                        View All
                                    </button>
                                )}
                            </div>

                            {/* Loading State */}
                            {reviewsLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="ml-3 text-gray-600">Loading reviews...</span>
                                </div>
                            )}

                            {/* Error State */}
                            {reviewsError === "Failed to load reviews. Please try again later." && (
                                <div className="text-center py-8">
                                    <MdError className="h-12 w-12 text-red-500 mx-auto mb-3" />
                                    <p className="text-red-600 font-medium">{reviewsError}</p>
                                    <button 
                                        onClick={() => {
                                            setReviewsError(null);
                                            // Trigger refetch
                                            if (rider?.email) {
                                                const fetchReviews = async () => {
                                                    setReviewsLoading(true);
                                                    try {
                                                        const response = await getRiderReviews(rider.email);
                                                        console.log('Rider Reviews Response:', response);
                                                        const transformedReviews = response.data.map((review, index) => ({
                                                            id: index + 1,
                                                            customer_name: review.customerEmail,
                                                            rating: review.rating,
                                                            comment: review.review || 'No comment provided',
                                                            order_id: `#${review.orderId}`,
                                                            dateTime: review.createdAt
                                                        }));
                                                        transformedReviews.sort((a, b) => b.order_id.localeCompare(a.order_id));
                                                        setReviews(transformedReviews);
                                                    } catch (error) {
                                                        setReviewsError(error?.response?.data?.message || 'Failed to load reviews. Please try again later.');
                                                    } finally {
                                                        setReviewsLoading(false);
                                                    }
                                                };
                                                fetchReviews();
                                            }
                                        }}
                                        className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* Reviews List */}
                            {!reviewsLoading && reviewsError !="Failed to load reviews. Please try again later." && (
                                <>
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MdStar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No reviews yet</p>
                                            <p className="text-gray-400 text-sm mt-1">Complete more deliveries to start receiving reviews!</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-6">
                                                {reviews.slice(0, 4).map((review) => (
                                                    <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h4 className="font-medium text-gray-800">{review.customer_name}</h4>
                                                                <p className="text-sm text-gray-500">Order {review.order_id}</p>
                                                                
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center space-x-1 mb-1">
                                                                    {renderStars(review.rating)}
                                                                </div>
                                                                <div className="flex items-center space-x-1 mb-1">
                                                                    <p className="text-sm text-gray-400">{formatReviewDate(review.dateTime)}</p>
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {reviews.length > 4 && (
                                                <div className="mt-6 text-center">
                                                    <button
                                                        onClick={() => setShowAllReviewsModal(true)}
                                                        className="inline-flex items-center px-4 py-2 text-orange-500 hover:text-orange-600 font-medium transition duration-200"
                                                    >
                                                        Show more reviews
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Performance Stats */}
                        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Stats</h3>
                            {statisticsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <svg className="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="ml-2 text-gray-600">Loading...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <MdTrendingUp className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-gray-600">Total Earnings</span>
                                        </div>
                                        <span className="font-semibold text-gray-800">${(statistics?.totalEarnings || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <MdDeliveryDining className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm text-gray-600">Total Deliveries</span>
                                        </div>
                                        <span className="font-semibold text-gray-800">{statistics?.totalDeliveries || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <MdAttachMoney className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-gray-600">Avg per Delivery</span>
                                        </div>
                                        <span className="font-semibold text-gray-800">${(statistics?.averageEarningsPerDelivery || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <MdStar className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm text-gray-600">Avg Rating</span>
                                        </div>
                                        <span className="font-semibold text-gray-800">{driverData.rating?.toFixed(1) || '0.0'}/5.0</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <MdVerified className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm text-gray-600">Completion Rate</span>
                                        </div>
                                        <span className="font-semibold text-gray-800">{(statistics?.completionRate || 0).toFixed(1)}%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Account Information */}
                        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Status</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600">Member Since</span>
                                    <p className="font-medium text-gray-800">{formatDate(driverData.member_since)}</p>
                                </div>
                                {/* <div>
                                    <span className="text-sm text-gray-600">Total Deliveries</span>
                                    <p className="font-medium text-gray-800">{driverData.total_deliveries?.toLocaleString() || '0'}</p>
                                </div> */}
                                <div>
                                    <span className="text-sm text-gray-600">Verification Status</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <MdVerified className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium text-green-800 capitalize">
                                            {driverData.verification_status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                {/* <Link
                                    to="/history"
                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 transition duration-200"
                                >
                                    <MdHistory className="h-5 w-5 text-orange-500" />
                                    <span className="text-gray-700">Delivery History</span>
                                </Link> */}
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-50 transition duration-200 w-full text-left"
                                >
                                    <MdLock className="h-5 w-5 text-orange-500" />
                                    <span className="text-gray-700">Change Password</span>
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition duration-200 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoggingOut ? (
                                        <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <MdLogout className="h-5 w-5 text-red-500" />
                                    )}
                                    <span className="text-red-700">{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* All Reviews Modal */}
            {showAllReviewsModal && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                    <MdStar className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">All Reviews ({reviews.length})</h3>
                            </div>
                            <button
                                onClick={() => setShowAllReviewsModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition duration-200"
                            >
                                <MdClose className="h-6 w-6" />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <MdStar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No reviews yet</p>
                                    <p className="text-gray-400 text-sm mt-1">Complete more deliveries to start receiving reviews!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-800">{review.customer_name}</h4>
                                                    <p className="text-sm text-gray-500">Order {review.order_id}</p>
                                                    <p className="text-sm text-gray-400">{formatReviewDate(review.dateTime)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center space-x-1 mb-1">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <span className="text-sm text-gray-600">{review.rating}/5</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowAllReviewsModal(false)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
                   
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                    
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                    <MdLock className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                            </div>
                            <button
                                onClick={handleClosePasswordModal}
                                className="text-gray-400 hover:text-gray-600 transition duration-200"
                            >
                                <MdClose className="h-6 w-6" />
                            </button>
                        </div>
                        
                        {/* General Error */}
                        {passwordErrors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-red-700 text-sm">{passwordErrors.general}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.old ? "text" : "password"}
                                        name="oldPassword"
                                        value={passwordForm.oldPassword}
                                        onChange={handlePasswordInputChange}
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                            passwordErrors.oldPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('old')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.old ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                                    </button>
                                </div>
                                {passwordErrors.oldPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.oldPassword}</p>
                                )}
                            </div>
                            
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordInputChange}
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                            passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.new ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                                )}
                            </div>
                            
                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordInputChange}
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                            passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.confirm ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Modal Actions */}
                        <div className="flex space-x-3 mt-8">
                            <button
                                onClick={handleClosePasswordModal}
                                disabled={isChangingPassword}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                disabled={isChangingPassword}
                                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isChangingPassword ? (
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Permission Modal */}
            <LocationPermissionModal
                isOpen={locationTracking.showPermissionModal}
                onAllow={locationTracking.handleAllowLocation}
                onDeny={locationTracking.handleDenyLocation}
                onClose={locationTracking.handleCloseModal}
            />
        </div>
    );
};

export default Profile;
