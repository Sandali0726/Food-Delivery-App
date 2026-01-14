import React, { useState, useEffect } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Header from '../../components/Header';
import OrderSuccessModal from '../../components/OrderSuccessModal';
import { orderAPI } from '../../services/api';
import {CalculateDeliveryFee, updateRoute} from "../../Function/OrderFunction";
import { haversineKm } from '../../Function/AddressFunction';
import ConfirmAddressPromptModal from './components/ConfirmAddressPromptModal';
import AddressConfirmSuccessModal from './components/AddressConfirmSuccessModal';
import FarAwayAddressModal from './components/FarAwayAddressModal';
import ClosedRestaurantModal from '../Home/components/ClosedRestaurantModal';
import {checkIfRestaurantOpen} from "../../Function/RestaurantFunctions";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryCoords, setDeliveryCoords] = useState({ lat: 0, lng: 0 });
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [showConfirmAddressPrompt, setShowConfirmAddressPrompt] = useState(false);
  const [showAddressConfirmSuccess, setShowAddressConfirmSuccess] = useState(false);
  const [showFarAwayModal, setShowFarAwayModal] = useState(false);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);
  const [closedRestaurant, setClosedRestaurant] = useState(null);

  useEffect(() => {
    // Get cart items from location state
    const stateCart = location.state?.cart;
    const stateMenuItems = location.state?.menuItems;
    const stateRestaurant = location.state?.restaurant;

    if (stateCart && stateMenuItems) {
      // Convert cart object to array of items with quantities
      const items = Object.entries(stateCart).map(([itemId, quantity]) => {
        const menuItem = stateMenuItems.find(item => item.id === parseInt(itemId));
        return {
          ...menuItem,
          quantity
        };
      }).filter(item => item.id); // Filter out any items not found

      setCartItems(items);
      setRestaurant(stateRestaurant);
    } else {
      // No cart data, redirect back to home
      navigate('/');
      return;
    }

    // Get delivery address from localStorage
    const savedAddress = localStorage.getItem('userLocationAddress') || 'No address selected';
    setDeliveryAddress(savedAddress);
    // reset confirmation when address changes
    setAddressConfirmed(false);

    const pickupLat = parseFloat(stateRestaurant?.latitude) || 0;
    const pickupLng = parseFloat(stateRestaurant?.longitude) || 0;
    const deliveryLat = parseFloat(localStorage.getItem('userLocationLat')) || 0;
    const deliveryLng = parseFloat(localStorage.getItem('userLocationLng')) || 0;
    setDeliveryCoords({ lat: deliveryLat, lng: deliveryLng });

    // If we have valid coords, call updateRoute to get distance/time
    const accessToken = process.env.REACT_APP_MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || '';
    if (accessToken && pickupLat && pickupLng && deliveryLat && deliveryLng) {
      (async () => {
        try {
          const routeInfo = await updateRoute(
            undefined, // no map instance on checkout
            accessToken,
            deliveryLat,
            deliveryLng,
            pickupLat,
            pickupLng
          );
          const fee = await CalculateDeliveryFee(routeInfo.distanceKm, routeInfo.estimatedTimeMinutes);
          setDeliveryFee(fee);
        } catch (err) {
          console.warn('Failed to compute route/fee, using minimum fee:', err);
          const fee = await CalculateDeliveryFee(0, 0);
          setDeliveryFee(fee);
        }
      })();
    } else {
      // Fallback minimum fee if coords or token are missing
      (async () => {
        const fee = await CalculateDeliveryFee(0, 0);
        setDeliveryFee(fee);
      })();
    }
  }, [location, navigate]);

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + deliveryFee;
  };

  // Handle address change
  const handleChangeAddress = () => {
    navigate('/location',{state:{from: "checkout"}});
  };

  // Explicit address confirmation flow with distance check
  const handleConfirmAddress = () => {
    if (!deliveryAddress || deliveryAddress === 'No address selected') {
      // prompt to set/select an address first
      setShowConfirmAddressPrompt(true);
      return;
    }

    // Validate distance: require within 5km of restaurant
    const restLat = parseFloat(restaurant?.latitude) || 0;
    const restLng = parseFloat(restaurant?.longitude) || 0;
    const userLat = parseFloat(deliveryCoords.lat) || parseFloat(localStorage.getItem('userLocationLat')) || 0;
    const userLng = parseFloat(deliveryCoords.lng) || parseFloat(localStorage.getItem('userLocationLng')) || 0;

    if (!restLat || !restLng || !userLat || !userLng) {
      // If any coords missing, fall back to prompt; optionally could show error
      setShowConfirmAddressPrompt(true);
      return;
    }

    const distanceKm = haversineKm(userLat, userLng, restLat, restLng);
    if (distanceKm > 5) {
      // too far -> show error modal and do not confirm
      setShowFarAwayModal(true);
      return;
    }

    // within range -> mark confirmed and show success
    setAddressConfirmed(true);
    setShowAddressConfirmSuccess(true);
  };

  // Cancel order: clear cart and go back to restaurant page
  const handleCancel = () => {
    try {
      // Clear cart-related data
      localStorage.removeItem('cart');
      setCartItems([]);
      // Navigate to the restaurant page. Assumption: route uses restaurant.id
      //console.log('Navigating back to restaurant:', restaurant);
      if (restaurant?.id) {
        navigate(`/restaurant/${restaurant.id}`);
      } else {
        navigate('/');
      }
    } catch (e) {
      // Fallback navigation
      navigate('/');
    }
  };

  // Handle confirm order
  const handleConfirmOrder = async () => {
    try {
      // ensure address is confirmed before placing order
      if (!addressConfirmed) {
        setShowConfirmAddressPrompt(true);
        return;
      }
      const open = await checkIfRestaurantOpen(restaurant.id)
      if(!open){
        setClosedRestaurant(restaurant);
        setIsClosedModalOpen(true)
        return;
      }

      setIsLoading(true);

      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        alert('Please login to place an order');
        navigate('/login');
        return;
      }

      // Prepare order data according to backend API format
      const orderData = {
        customerEmail: userEmail,
        restaurantEmail: restaurant?.email || restaurant?.id,
        restaurantName: restaurant?.name,
        otp: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit OTP
        orderPrice: calculateSubtotal(),
        deliveryPrice: deliveryFee,
        deliveryLat: deliveryCoords.lat,
        deliveryLng: deliveryCoords.lng,
        // Address should be empty until user confirms it explicitly
        address: addressConfirmed ? deliveryAddress : '',
        status: 'CONFIRM',
        orderItems: cartItems.map(item => ({
          foodId: item.id?.toString(),
          itemName: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await orderAPI.create(orderData);
        const createdOrderId = response.data?.id || response.data?.orderId || 'N/A';
        setOrderId(createdOrderId);
        setShowSuccessModal(true);
        localStorage.removeItem('cart');

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close - navigate to orders page
  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/orders');
  };

  if (cartItems.length === 0 && !location.state?.cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-300 px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6">
        {/* Restaurant Info */}
        {restaurant && (
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-300">
            <div className="flex items-center gap-4">
              <img 
                src={restaurant.coverImageUrl} 
                alt={restaurant.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-800">{restaurant.name}</h2>
                <p className="text-sm text-gray-500">{restaurant.cuisine || 'Restaurant'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address Section */}
        <div className="bg-white rounded-xl p-5 mb-6 border border-gray-300">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-800">Delivery Address</h3>
              {addressConfirmed && (
                <span className="ml-2 inline-flex items-center text-green-600 text-xs font-semibold">
                  <CheckCircleIcon className="w-4 h-4 mr-1" /> Confirmed
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleChangeAddress}
                className="px-4 py-2 bg-transparent text-primary border border-primary rounded-lg font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-200"
              >
                Change
              </button>
              <button
                onClick={handleConfirmAddress}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${addressConfirmed ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-black text-white hover:bg-black/90'}`}
              >
                {addressConfirmed ? 'Address Confirmed' : 'Confirm Address'}
              </button>
            </div>
          </div>
          <p className="text-gray-700 text-sm ml-7">{deliveryAddress}</p>
          {!addressConfirmed && (
            <p className="text-xs text-gray-500 ml-7 mt-1">You must confirm your address before placing the order.</p>
          )}
        </div>

        {/* Order Items Section */}
        <div className="bg-white rounded-xl p-5 mb-6 border border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-800 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    <span className="text-sm text-gray-400">×</span>
                    <span className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown Section */}
        <div className="bg-white rounded-xl p-5 mb-6 border border-gray-400">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Bill Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-800">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-semibold text-gray-800">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-200 my-3"></div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex gap-3">
          <button
              onClick={handleConfirmOrder}
              disabled={isLoading}
              className={`w-1/2 px-8 py-4 rounded-xl font-bold text-lg transition-colors ${
                  isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
              }`}
          >
            {isLoading ? 'Placing Order...' : 'Confirm Order'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className={`w-1/2 px-8 py-4 rounded-xl font-bold text-lg transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-black/90'
            }`}
          >
            Cancel
          </button>

        </div>
      </div>

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        orderId={orderId}
      />

      {/* Confirm Address Prompt Modal */}
      <ConfirmAddressPromptModal
        isOpen={showConfirmAddressPrompt}
        onClose={() => setShowConfirmAddressPrompt(false)}
        onConfirm={() => {
          setShowConfirmAddressPrompt(false);
          handleConfirmAddress();
        }}
      />

      {/* Address Confirm Success Modal */}
      <AddressConfirmSuccessModal
        isOpen={showAddressConfirmSuccess}
        onClose={() => setShowAddressConfirmSuccess(false)}
      />

      {/* Far Away Error Modal */}
      <FarAwayAddressModal
        isOpen={showFarAwayModal}
        onClose={() => setShowFarAwayModal(false)}
        onGoHome={() => {
          setShowFarAwayModal(false);
          navigate('/');
        }}
      />
      {/* Closed Restaurant Modal */}
      <ClosedRestaurantModal
          open={isClosedModalOpen}
          restaurant={closedRestaurant}
          onClose={() => {
            setIsClosedModalOpen(false);
            setClosedRestaurant(null);
          }}
      />
    </div>
  );
};

export default CheckoutPage;
