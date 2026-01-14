import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Header from '../../components/Header';
import OrderCard from './components/OrderCard';
import DeliveryPersonModal from './components/DeliveryPersonModal';
import RiderReviewModal from './components/RiderReviewModal';
import RestaurantReviewModal from './components/RestaurantReviewModal';
import SuccessModal from '../../components/SuccessModal';
import socketService from '../../services/socket';
import { useToast } from '../../components/ToastProvider';
import orderPageBg from '../../assets/orderpagebg.avif';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import DeleteSuccessModal from './components/DeleteSuccessModal';
import OrderMapModal from './components/OrderMapModal';

// Helper function to map order status to toast type
const getToastTypeForStatus = (status) => {
  const statusUpper = status.toUpperCase();
  const statusToTypeMap = {
    'CANCEL': 'cancel',
    'CONFIRM': 'confirm',
    'ACCEPTED': 'accepted',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'GO_TO_PICKUP': 'go_to_pickup',
    'PICKED_UP': 'picked_up',
    'ON_THE_WAY': 'on_the_way',
    'DELIVERED': 'delivered'
  };
  return statusToTypeMap[statusUpper] || 'info';
};
const OrdersPage = () => {
  // Helper function to sort orders by orderId in descending order (latest first)
  const sortOrdersByIdDesc = (orders) => {
    return [...orders].sort((a, b) => {
      const aId = Number(a.orderId || a.id || 0);
      const bId = Number(b.orderId || b.id || 0);
      return bId - aId; // Descending order: latest (higher ID) first
    });
  };
  const [activeTab, setActiveTab] = useState('PROCESSING');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeliveryPersonModal, setShowDeliveryPersonModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRestaurantReviewModal,setShowRestaurantReviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  // Cancel flow state
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  // Order tracking state
  const [showOrderMapModal, setShowOrderMapModal] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const { showToast } = useToast();
  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    fetchOrders();
    // initialize socket once (no dependencies) - listen to live updates
    const onMessage = (payload) => {
      // payload may be nested, accept both {orderId, status} or {payload: {...}}
      const data = payload?.payload || payload;
      if (!data) return;
      const id = data.orderId || data.order_id || data.id || data.orderId;
      const status = (data.status || data.orderStatus || data.state || '').toString().toUpperCase();
      if (!id || !status) return;
      // update local orders list if present
      setOrders((prev) => {
        let found = false;
        const updated = prev.map((o) => {
          const oid = o.orderId || o.id || o.orderId;
          if (String(oid) === String(id)) {
            found = true;
            return { ...o, status };
          }
          return o;
        });
        // if order not in list and belongs to this user, refetch single order (optional enhancement)
        if (!found) return prev;
        const toastType = getToastTypeForStatus(status);
        showToast(`Order ${id} status updated to ${status.replace(/_/g, ' ').toLowerCase()}`, { type: toastType, duration: 5000 });
        return sortOrdersByIdDesc(updated);
      });
    };
    const onConnect = () => {
      // console.log('Connected to order websocket');
    };
    const onDisconnect = () => {
      // console.log('Disconnected from websocket');
    };
    // Initialize socket - order IDs will be subscribed when orders are fetched
    socketService.initOrderSocket(null, onMessage, onConnect, onDisconnect);
    return () => {
      // Don't disconnect socket on unmount, keep it alive for the session
      // socketService.disconnectOrderSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);
  useEffect(() => {
    if (!userEmail) return;
    // refetch when active tab changes
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getByEmail(userEmail);
      const allOrders = response.data;
      const filteredOrders = allOrders.filter((o) => {
        const status = (o.status || '').toUpperCase();
        if (activeTab === 'DELIVERED') {
          return status === 'DELIVERED';
        }
        else if (activeTab === 'CANCELLED') {
          return status === 'CANCEL';
        }
        else {
          // Fix: use logical AND to exclude delivered and cancelled
          return status !== 'DELIVERED' && status !== 'CANCEL';
        }
      });
      const sortedOrders = sortOrdersByIdDesc(filteredOrders);
      setOrders(sortedOrders);
      // Subscribe to order-specific topics for real-time updates
      if (activeTab === 'PROCESSING' && filteredOrders.length > 0) {
        const orderIds = filteredOrders.map(o => o.orderId || o.id).filter(Boolean);
        socketService.updateOrderSubscriptions(orderIds, (payload) => {
          const data = payload?.payload || payload;
          if (!data) return;
          const id = data.orderId || data.order_id || data.id;
          const status = (data.status || data.orderStatus || data.state || '').toString().toUpperCase();
          if (!id || !status) return;
          setOrders((prev) => {
            const updated = prev.map((o) => {
              const oid = o.orderId || o.id;
              if (String(oid) === String(id)) {
                return { ...o, status };
              }
              return o;
            });
            return sortOrdersByIdDesc(updated);
          });
          const toastType = getToastTypeForStatus(status);
          showToast(`Order ${id} status updated to ${status.replace(/_/g, ' ').toLowerCase()}`, { type: toastType, duration: 5000 });
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  // close toast handler
  const handleDeliveryPersonClick = async (riderDetails) => {
    try {
      if (!riderDetails) {
        console.warn('No rider details provided');
        return;
      }
      const normalized = {
        name: riderDetails.rider_name ?? riderDetails.name ?? '',
        phone: riderDetails.rider_phone ?? riderDetails.phone ?? '',
        profileImage: riderDetails.rider_image ?? riderDetails.profileImage ?? '',
        vehicleNumber: riderDetails.vehicle_no ?? riderDetails.vehicleNumber ?? '',
        totalDeliveries: riderDetails.delivery_count !== undefined ? Number(riderDetails.delivery_count) : (riderDetails.totalDeliveries ?? undefined),
        rating: riderDetails.rating !== undefined ? Number(riderDetails.rating) : undefined,
        riderEmail: riderDetails.riderEmail ?? riderDetails.email ?? undefined,
        orderId: riderDetails.orderId,
      };
      setSelectedDeliveryPerson(normalized);
      setShowDeliveryPersonModal(true);
    } catch (error) {
      console.error('Failed to show delivery person details', error);
    }
  };
  const handleReviewClick = () => {
    setShowReviewModal(true);
  };
  const handleSubmitReview = async (reviewData) => {
    try {
      await orderAPI.submitRiderReview(reviewData);
      setSuccessMessage('Your feedback is submitted successfully! Thank you for helping us improve our service.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };
  const handleReviewRestaurantClick = (order) => {
    setSelectedRestaurant({
      restaurantEmail: order.restaurantEmail,
      name: order.restaurantName,
      orderId: order.orderId
    });
    setShowRestaurantReviewModal(true);
  };
  const handleSubmitRestaurantReview = async (reviewData) => {
    try {
      const dataToSubmit = {
        ...reviewData,
        restaurantEmail: selectedRestaurant.restaurantEmail,
        orderId: selectedRestaurant.orderId,
      };
      await orderAPI.submitRestaurantReview(dataToSubmit);
      setSuccessMessage('Your feedback is submitted successfully! Thank you for helping us improve our service.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting restaurant review:', error);
      throw error;
    }
  };
  // Cancel flow handlers
  const requestCancelOrder = (orderId) => {
    setPendingCancelOrderId(orderId);
    setShowCancelConfirm(true);
  };
  const confirmCancelOrder = async () => {
    if (!pendingCancelOrderId) return;
    try {
      await orderAPI.update(pendingCancelOrderId);
      setShowCancelConfirm(false);
      setShowCancelSuccess(true);
      // Show toast notification for cancelled order
      showToast(`Order ${pendingCancelOrderId} has been cancelled successfully`, { type: 'cancel', duration: 5000 });
      // refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      setShowCancelConfirm(false);
    } finally {
      setPendingCancelOrderId(null);
    }
  };
  // Order tracking handler
  const handleTrackOrderClick = (order) => {
    setSelectedOrderForTracking(order);
    setShowOrderMapModal(true);
  };
  const handleOrderCardClick = (order) => {
    const orderId = order.orderId || order.id;
    navigate(`/orders/${orderId}`);
  };
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${orderPageBg})` }}
    >
      {/* Overlay for better readability */}
      <div className="min-h-screen bg-black/30 backdrop-blur-sm">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">My Orders</h1>
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setActiveTab('PROCESSING')}
              className={`px-6 py-3 rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all shadow-md ${
                activeTab === 'PROCESSING'
                  ? 'bg-red-600 text-white scale-105 shadow-lg'
                  : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-102'
              }`}
            >
              PROCESSING
            </button>
            <button
              onClick={() => setActiveTab('DELIVERED')}
              className={`px-6 py-3 rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all shadow-md ${
                activeTab === 'DELIVERED'
                  ? 'bg-red-600 text-white scale-105 shadow-lg'
                  : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-102'
              }`}
            >
              DELIVERED
            </button>
            <button
              onClick={() => setActiveTab('CANCELLED')}
              className={`px-6 py-3 rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all shadow-md ${
                activeTab === 'CANCELLED'
                  ? 'bg-red-600 text-white scale-105 shadow-lg'
                  : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-102'
              }`}
            >
              CANCELLED
            </button>
          </div>
          {/* Orders Grid */}
          <div className="mt-4 sm:mt-5">
            {loading ? (
              <div className="text-center py-12 sm:py-16 text-white text-base bg-black/40 rounded-xl backdrop-blur-md">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white/90 backdrop-blur-md rounded-xl shadow-lg">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📦</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  No orders yet
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-5 sm:mb-6">
                  {activeTab === 'PROCESSING'
                    ? 'You have no orders in progress'
                    : activeTab === 'DELIVERED'
                    ? 'You have no delivered orders'
                    : 'You have no cancelled orders'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="w-full max-w-xs sm:max-w-none sm:w-auto mx-auto px-4 sm:px-8 py-3 sm:py-3.5 min-h-[44px] bg-primary text-white border-none rounded-xl text-sm sm:text-base font-semibold cursor-pointer hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors shadow-md"
                  aria-label="Browse restaurants"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order.orderId || order.id}
                    order={order}
                    onClick={() => handleOrderCardClick(order)}
                    onDeliveryPersonClick={handleDeliveryPersonClick}
                    onReviewRestaurantClick={handleReviewRestaurantClick}
                    // Hook up cancel and tracking actions
                    onRequestCancel={() => requestCancelOrder(order.orderId || order.id)}
                    onTrackOrderClick={handleTrackOrderClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Delivery Person Modal */}
      {selectedDeliveryPerson && (
        <DeliveryPersonModal
          isOpen={showDeliveryPersonModal}
          onClose={() => setShowDeliveryPersonModal(false)}
          deliveryPerson={selectedDeliveryPerson}
          onReviewClick={handleReviewClick}
        />
      )}
      {/* Review Modal */}
      {selectedDeliveryPerson && (
        <RiderReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          deliveryPerson={selectedDeliveryPerson}
          onSubmitReview={handleSubmitReview}
          Email={selectedDeliveryPerson?.riderEmail}
          orderId={selectedDeliveryPerson?.orderId}
        />
      )}
      {/* Restaurant Review Modal */}
      {selectedRestaurant && (
        <RestaurantReviewModal
          isOpen={showRestaurantReviewModal}
          onClose={() => setShowRestaurantReviewModal(false)}
          restaurant={selectedRestaurant}
          onSubmitReview={handleSubmitRestaurantReview}
        />
      )}
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        autoCloseDuration={2500}
      />
      {/* Cancel Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancelOrder}
      />
      {/* Cancel Success Modal */}
      <DeleteSuccessModal
        isOpen={showCancelSuccess}
        onClose={() => setShowCancelSuccess(false)}
      />
      {/* Order Map Modal */}
      {selectedOrderForTracking && (
        <OrderMapModal
          isOpen={showOrderMapModal}
          onClose={() => setShowOrderMapModal(false)}
          order={selectedOrderForTracking}
        />
      )}
    </div>
  );
};
export default OrdersPage;
