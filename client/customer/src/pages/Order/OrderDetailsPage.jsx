import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Header from '../../components/Header';
import OrderProgressBar from './components/OrderProgressBar';
import RiderReviewModal from './components/RiderReviewModal';
import RestaurantReviewModal from './components/RestaurantReviewModal';
import SuccessModal from '../../components/SuccessModal';
import { ArrowLeftIcon, MapPinIcon, CalendarIcon, ClockIcon, UserCircleIcon, PhoneIcon, StarIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { RiderDetails } from '../../Function/OrderFunction';
import { getRestaurantDetails, fetchFoodImage } from '../../Function/RestaurantFunctions';
import OrderMapCard from './components/OrderMapCard';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderDetails, setRiderDetails] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [riderReview, setRiderReview] = useState(null);
  const [restaurantReview, setRestaurantReview] = useState(null);
  const [showRiderReviewModal, setShowRiderReviewModal] = useState(false);
  const [showRestaurantReviewModal, setShowRestaurantReviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const [foodImages, setFoodImages] = useState({});

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, userEmail]);

  // Load food images for items when order changes (must be before any early returns)
  useEffect(() => {
    const loadImages = async () => {
      const currentItems = (order?.items || order?.orderItems || []);
      if (!currentItems.length) {
        setFoodImages({});
        return;
      }

      const images = {};
      await Promise.all(
        currentItems.map(async (item) => {
          try {
            const url = await fetchFoodImage(item.foodId);
            images[item.foodId] = url || null;
          } catch (e) {
            images[item.foodId] = null;
          }
        })
      );
      setFoodImages(images);
    };

    loadImages();
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getByEmail(userEmail);
      const allOrders = response.data;
      console.log('allOrders', allOrders);
      const foundOrder = allOrders.find(
        (o) => String(o.orderId || o.id) === String(orderId)
      );
      if (foundOrder) {
        setOrder(foundOrder);
        if (foundOrder.riderEmail) {
          try {
            const details = await RiderDetails(foundOrder.riderEmail);
            setRiderDetails({
              ...details,
              riderEmail: foundOrder.riderEmail,
              orderId: foundOrder.orderId || foundOrder.id
            });
            // Fetch rider review using new API endpoint
            await fetchRiderReview(foundOrder.orderId || foundOrder.id);
          } catch (err) {
            console.error('Failed to fetch rider details', err);
          }
        }
        // Fetch restaurant details
        if (foundOrder.restaurantEmail) {
          try {
            const restDetails = await getRestaurantDetails(foundOrder.restaurantEmail);
            //console.log('restDetails', restDetails);
            setRestaurantDetails(restDetails);
          } catch (err) {
            console.error('Failed to fetch restaurant details', err);
          }
        }
        // Fetch restaurant review using new API endpoint
        await fetchRestaurantReview(foundOrder.orderId || foundOrder.id);
      } else {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };
  const fetchRiderReview = async (orderId) => {
    try {
      const response = await orderAPI.getRiderReviewbyOrderId(orderId);
      if (response.data) {
        setRiderReview(response.data);
      }
    } catch (error) {
      console.log('No rider review found for this order');
      setRiderReview(null);
    }
  };
  const fetchRestaurantReview = async (orderId) => {
    try {
      const response = await orderAPI.getRestaurantReviewbyOrderId(orderId);
      if (response.data) {
        setRestaurantReview(response.data);
      }
    } catch (error) {
      console.log('No restaurant review found for this order');
      setRestaurantReview(null);
    }
  };
  const handleSubmitRiderReview = async (reviewData) => {
    try {
      await orderAPI.submitRiderReview(reviewData);
      setSuccessMessage('Your rider review has been submitted successfully!');
      setShowSuccessModal(true);
      setShowRiderReviewModal(false);
      await fetchRiderReview(orderId);
    } catch (error) {
      console.error('Error submitting rider review:', error);
      throw error;
    }
  };
  const handleSubmitRestaurantReview = async (reviewData) => {
    try {
      const dataToSubmit = {
        ...reviewData,
        restaurantEmail: order.restaurantEmail,
        orderId: order.orderId || order.id,
      };
      await orderAPI.submitRestaurantReview(dataToSubmit);
      setSuccessMessage('Your restaurant review has been submitted successfully!');
      setShowSuccessModal(true);
      setShowRestaurantReviewModal(false);
      await fetchRestaurantReview(orderId);
    } catch (error) {
      console.error('Error submitting restaurant review:', error);
      throw error;
    }
  };
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => {
      if (index < Math.floor(rating)) {
        return <StarIconSolid key={index} className="w-5 h-5 text-yellow-400" />;
      }
      return <StarIcon key={index} className="w-5 h-5 text-gray-300" />;
    });
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-16 text-white text-lg font-semibold bg-black/40 mx-4 mt-4 rounded-xl backdrop-blur-md">Loading order details...</div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-16 text-white text-lg font-semibold bg-black/40 mx-4 mt-4 rounded-xl backdrop-blur-md">Order not found</div>
      </div>
    );
  }

  const status = (order?.status || '').toUpperCase();
  const items = order.items || order.orderItems || [];
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  const orderPrice = Number(order.orderPrice || 0);
  const deliveryPrice = Number(order.deliveryPrice || 0);
  const total = orderPrice + deliveryPrice;
  const restaurantCoverImage = order.restaurantCoverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${restaurantCoverImage})` }}
    >
      {/* Overlay for better readability */}
      <div className="min-h-screen bg-black/40 backdrop-blur-sm">
        <Header />
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-white hover:text-primary transition-all bg-black/50 px-4 py-2 rounded-lg hover:bg-black/70 backdrop-blur-md shadow-lg"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-bold">Back to Orders</span>
          </button>
        </div>
        {/* Restaurant Cover Section */}
        <div className="relative h-32 sm:h-40 w-full overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 drop-shadow-2xl">Order #{orderId}</h1>
            <h2 className="text-xl sm:text-2xl font-bold drop-shadow-lg">{order.restaurantName || 'Restaurant'}</h2>
          </div>
        </div>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-5 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Status Bar */}
            <div className="lg:col-span-1">
              {/* Order Status Card */}
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-white/50 sticky top-24 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] hover:bg-white">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4 border-b-2 border-primary pb-2">Order Status</h3>
                <OrderProgressBar currentStatus={status} vertical={true} />
                {/* Order Date & Time */}
                {createdAt && (
                  <div className="mt-6 pt-6 border-t-2 border-gray-300">
                    <div className="flex items-center gap-3 mb-4 bg-gray-50 p-3 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Order Date</p>
                        <p className="text-sm font-bold text-gray-900">
                          {createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Order Time</p>
                        <p className="text-sm font-bold text-gray-900">
                          {createdAt.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Rider and Restaurant Cards - Horizontal Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 mt-6">
                {/* Delivery Person Card - Only show when rider assigned */}
                {riderDetails && (
                  <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-white/50 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] hover:bg-white">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-4 border-b-2 border-primary pb-2">Delivery Person</h3>
                    {/* Profile Section */}
                    <div className="flex flex-col items-center mb-4">
                      {riderDetails.rider_image || riderDetails.profileImage ? (
                        <img
                          src={riderDetails.rider_image || riderDetails.profileImage|| ''}
                          alt={riderDetails.rider_name || riderDetails.name}
                          className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-primary/20"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3 border-4 border-primary/20">
                          <UserCircleIcon className="w-14 h-14 text-primary" />
                        </div>
                      )}
                      <h4 className="text-base font-extrabold text-gray-900 mb-1">
                        {riderDetails.rider_name || riderDetails.name || 'Delivery Person'}
                      </h4>
                      {riderDetails.rating !== undefined && riderDetails.rating !== null && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {renderStars(Number(riderDetails.rating))}
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {Number(riderDetails.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Contact Info */}
                    <div className="space-y-3 mb-4">
                      {(riderDetails.rider_phone || riderDetails.phone) && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <PhoneIcon className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-600">Phone</p>
                            <p className="text-sm font-bold text-gray-900">
                              {riderDetails.rider_phone || riderDetails.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      {(riderDetails.vehicle_no || riderDetails.vehicleNumber) && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-xl">🛵</span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-600">Vehicle Number</p>
                            <p className="text-sm font-bold text-gray-900">
                              {riderDetails.vehicle_no || riderDetails.vehicleNumber}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Existing Review Display */}
                    {riderReview && (
                      <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                        <p className="text-xs font-bold text-gray-600 mb-2">Your Review</p>
                        <div className="flex gap-1 mb-2">
                          {renderStars(riderReview.rate || riderReview.rating || 0)}
                        </div>
                        {riderReview.review && (
                          <p className="text-sm text-gray-700 italic">"{riderReview.review}"</p>
                        )}
                      </div>
                    )}
                    {/* Review Button */}
                    <button
                      onClick={() => setShowRiderReviewModal(true)}
                      className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all hover:scale-105 shadow-md"
                    >
                      {riderReview ? 'Update Your Review' : 'Add Review'}
                    </button>
                  </div>
                )}
                {/* Restaurant Details Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-white/50 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] hover:bg-white">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-4 border-b-2 border-primary pb-2">Restaurant</h3>
                  {/* Restaurant Info */}
                  <div className="flex flex-col items-center mb-4">
                    {restaurantDetails.profileImageUrl ? (
                      <img
                        src={restaurantDetails.profileImageUrl}
                        alt={order.restaurantName}
                        className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-primary/20"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3 border-4 border-primary/20">
                        <BuildingStorefrontIcon className="w-14 h-14 text-primary" />
                      </div>
                    )}
                    <h4 className="text-base font-extrabold text-gray-900 mb-2 text-center">
                      {order.restaurantName || 'Restaurant'}
                    </h4>
                  </div>
                  {/* Restaurant Contact Info */}
                  {restaurantDetails?.contactNumber && (
                    <div className="mb-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <PhoneIcon className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-600">Phone</p>
                          <p className="text-sm font-bold text-gray-900">
                            {restaurantDetails.contactNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Existing Review Display */}
                  {restaurantReview && (
                    <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <p className="text-xs font-bold text-gray-600 mb-2">Your Review</p>
                      <div className="flex gap-1 mb-2">
                        {renderStars(restaurantReview.rate || restaurantReview.rating || 0)}
                      </div>
                      {restaurantReview.review && (
                        <p className="text-sm text-gray-700 italic">"{restaurantReview.review}"</p>
                      )}
                    </div>
                  )}
                  {/* Review Button */}
                  <button
                    onClick={() => setShowRestaurantReviewModal(true)}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all hover:scale-105 shadow-md"
                  >
                    {restaurantReview ? 'Update Your Review' : 'Add Review'}
                  </button>
                </div>
              </div>
            </div>
            {/* Right Column - Order Details */}
            <div className="lg:col-span-3">
              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border-2 border-white/50 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-[1.01] hover:bg-white">
                {/* Order Info Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b-2 border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs font-bold text-gray-600 mb-2">Order ID</p>
                      <p className="text-xl font-extrabold text-gray-900">#{orderId}</p>
                    </div>
                    {order.otp && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-xs font-bold text-gray-600 mb-2">Delivery OTP</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 border-2 border-indigo-300">
                          <span className="text-lg font-extrabold tracking-widest text-indigo-700">{String(order.otp)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Delivery Address */}
                <div className="p-6 border-b-2 border-gray-200 bg-white">
                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                    <MapPinIcon className="w-7 h-7 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-600 mb-2">Delivery Address</p>
                      <p className="text-sm font-bold text-gray-900">
                        {order.address}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Order Items */}
                <div className="p-6 bg-white">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-4 border-b-2 border-primary pb-2">Order Items</h3>
                  <div className="space-y-4">

                    {items.map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b-2 border-gray-100 last:border-0 bg-gray-50 p-4 rounded-lg transition-all hover:bg-gray-100 hover:shadow-md">
                        {/* Food Image */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-md">
                          {foodImages[item.foodId] ? (
                            <img
                              src={foodImages[item.foodId]}
                              alt={item.itemName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 7h18M9 11h6m-7 4h8m-9 4h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-gray-900 mb-2 text-base">
                            {item.itemName}
                          </h4>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-gray-900">
                              Quantity: <span className="text-primary">{item.quantity}</span>
                            </p>
                            <p className="text-base font-extrabold text-gray-900">
                              ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-gray-600">
                            ${(item.price || 0).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Price Breakdown */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-t-2 border-gray-300">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <span className="text-sm font-bold text-gray-900">Food Total</span>
                      <span className="text-base font-extrabold text-gray-900">${orderPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <span className="text-sm font-bold text-gray-900">Delivery Fee</span>
                      <span className="text-base font-extrabold text-gray-900">${deliveryPrice.toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t-4 border-primary flex justify-between items-center bg-white p-4 rounded-lg shadow-lg">
                      <span className="text-xl font-extrabold text-gray-900">Total Amount</span>
                      <span className="text-3xl font-extrabold text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {/* Removed Track on Map Button to show map by default */}
              </div>
              {/* Inline Map Card below order details card */}
              {order && (
                <div className="mt-6">
                  <OrderMapCard order={order} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Rider Review Modal */}
      {riderDetails && (
        <RiderReviewModal
          isOpen={showRiderReviewModal}
          onClose={() => setShowRiderReviewModal(false)}
          deliveryPerson={riderDetails}
          onSubmitReview={handleSubmitRiderReview}
          Email={riderDetails.riderEmail}
          orderId={orderId}
        />
      )}
      {/* Restaurant Review Modal */}
      <RestaurantReviewModal
        isOpen={showRestaurantReviewModal}
        onClose={() => setShowRestaurantReviewModal(false)}
        restaurant={{
          restaurantEmail: order.restaurantEmail,
          name: order.restaurantName,
          orderId: order.orderId || order.id
        }}
        onSubmitReview={handleSubmitRestaurantReview}
      />
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        autoCloseDuration={2500}
      />
      {/* Remove modal rendering since card is inline */}
    </div>
  );
};
export default OrderDetailsPage;
