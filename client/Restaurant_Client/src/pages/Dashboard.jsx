import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Phone, MapPin, Clock, DollarSign, ShoppingBag, TrendingUp, Camera, Loader2 } from 'lucide-react';
import { profileAPI } from '../api/profileApi';
import { fileAPI } from '../api/fileUploadApi';
import { reverseGeocode } from '../api/geocodeApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '../features/orderSlice';
import { fetchOrderCount, fetchRevenue } from '../api/orderApi';
import backgroundImage from '../assets/background.jpg';

const toCoordinate = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const deriveRestaurantEmail = (profileData, orderList) => {
  const normalizedOrders = Array.isArray(orderList) ? orderList : [];
  const candidates = [
    profileData?.email,
    profileData?.ownerEmail,
    profileData?.contactEmail,
    profileData?.restaurantEmail,
    profileData?.loginEmail,
    profileData?.userEmail,
    normalizedOrders.length > 0 ? normalizedOrders[0]?.restaurantEmail : null,
  ];
  return candidates.find((value) => typeof value === 'string' && value.trim().length > 0) || null;
};

const parseNumericValue = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const extractRevenueValue = (payload) => {
  const direct = parseNumericValue(payload);
  if (direct !== null) return direct;

  if (payload && typeof payload === 'object') {
    const candidates = [payload.revenue, payload.total, payload.amount, payload.value];
    for (const candidate of candidates) {
      const parsed = parseNumericValue(candidate);
      if (parsed !== null) {
        return parsed;
      }
    }
  }

  return null;
};

const formatCurrency = (value, currency = 'USD') => {
  if (!Number.isFinite(value)) {
    return '--';
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    const rounded = Math.round(value * 100) / 100;
    const prefix = currency === 'USD' ? '$' : `${currency} `;
    return `${prefix}${rounded.toFixed(2)}`;
  }
};


export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [orderCountLoading, setOrderCountLoading] = useState(false);
  const [orderCountError, setOrderCountError] = useState(null);
  const lastCountEmailRef = useRef(null);
  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState(null);
  const [revenueCurrency, setRevenueCurrency] = useState('USD');
  const lastRevenueEmailRef = useRef(null);

  // Orders state from Redux
  const { orders, loading: ordersLoading } = useSelector(state => state.orders || { orders: [], loading: false });
  const newOrders = Array.isArray(orders)
    ? orders.filter((order) => (order.status || '').toUpperCase() === 'NEW')
    : [];

  const latitude = toCoordinate(profile?.latitude);
  const longitude = toCoordinate(profile?.longitude);

  useEffect(() => {
    fetchProfile();
    dispatch(getOrders());
  }, [dispatch]);

  const loadOrderCount = async (restaurantEmail) => {
    if (!restaurantEmail) return;
    setOrderCountLoading(true);
    setOrderCountError(null);
    try {
      const res = await fetchOrderCount(restaurantEmail);
      const payload = res?.data;
      let normalizedCount = 0;
      if (typeof payload === 'number') {
        normalizedCount = payload;
      } else if (typeof payload === 'string') {
        const parsed = Number(payload);
        normalizedCount = Number.isFinite(parsed) ? parsed : 0;
      } else if (payload && typeof payload === 'object') {
        const candidate = [
          payload.orderCount,
          payload.count,
          payload.total,
          payload.value,
          payload.orders
        ].find((value) => typeof value === 'number');
        normalizedCount = candidate ?? 0;
      }
      setOrderCount(normalizedCount);
    } catch (error) {
      console.error('Failed to fetch order count:', error);
      setOrderCountError('Unable to fetch count');
    } finally {
      setOrderCountLoading(false);
    }
  };

  const loadRevenue = async (restaurantEmail) => {
    if (!restaurantEmail) return;
    setRevenueLoading(true);
    setRevenueError(null);
    try {
      const res = await fetchRevenue(restaurantEmail);
      const payload = res?.data;
      const normalizedRevenue = extractRevenueValue(payload);
      const resolvedCurrency = typeof payload?.currency === 'string' && payload.currency.trim().length > 0
        ? payload.currency.trim().toUpperCase()
        : 'USD';
      setRevenueCurrency(resolvedCurrency);
      setRevenue(Number.isFinite(normalizedRevenue) ? normalizedRevenue : null);
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
      setRevenueError('Unable to fetch revenue');
      setRevenue(null);
    } finally {
      setRevenueLoading(false);
    }
  };

  const fetchProfile = async () => {
    try { 
      const response = await profileAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      // no-op
    }
  };

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setAddress(null);
      setAddressError(null);
      setAddressLoading(false);
      return;
    }

    let cancelled = false;
    setAddressLoading(true);
    setAddressError(null);

    reverseGeocode(latitude, longitude)
      .then((resolved) => {
        if (!cancelled) {
          setAddress(resolved);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Reverse geocoding failed:', error);
          setAddressError('Unable to resolve address');
          setAddress(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAddressLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!profile) return;
    const resolvedEmail = deriveRestaurantEmail(profile, orders);
    if (!resolvedEmail) {
      if (!ordersLoading) {
        setOrderCountError('Restaurant email unavailable');
        setRevenueError('Restaurant email unavailable');
      }
      return;
    }
    if (lastCountEmailRef.current !== resolvedEmail) {
      lastCountEmailRef.current = resolvedEmail;
      loadOrderCount(resolvedEmail);
    }
    if (lastRevenueEmailRef.current !== resolvedEmail) {
      lastRevenueEmailRef.current = resolvedEmail;
      loadRevenue(resolvedEmail);
    }
  }, [profile, orders, ordersLoading]);

  const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
  const formattedCoordinates = hasLocation
    ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    : null;
  const locationPrimary = !hasLocation
    ? 'Location not set'
    : addressLoading
      ? 'Resolving address...'
      : address || addressError || formattedCoordinates;
  const locationSecondary = hasLocation && (address || addressError)
    ? formattedCoordinates
    : null;

  const revenueDisplay = Number.isFinite(revenue)
    ? formatCurrency(revenue, revenueCurrency)
    : '--';

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const setUploading = type === 'cover' ? setUploadingCover : setUploadingProfile;
    
    try {
      setUploading(true);
      const response = await fileAPI.upload(file);
      const imageUrl = response.data;
      
      // Update profile with new image
      const updatedProfile = {
        ...profile,
        [type === 'cover' ? 'coverImageUrl' : 'profileImageUrl']: imageUrl
      };
      
      await profileAPI.updateProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const updatedProfile = {
        ...profile,
        open: !profile.open
      };
      await profileAPI.updateProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update online status:', error);
      alert('Failed to update status. Please try again.');
    }
  };


  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }



  return (
    <div
      className="bg-gray-50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-500">
            {profile.coverImageUrl && (
              <img 
                src={profile.coverImageUrl} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            {/* <label className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition cursor-pointer">
              {uploadingCover ? (
                <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-gray-700" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
                disabled={uploadingCover}
              />
            </label> */}
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                {profile.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-orange-600" />
                  </div>
                )}
              </div>
              {/* <label className="absolute bottom-2 right-2 bg-orange-600 p-2 rounded-full hover:bg-orange-700 transition shadow-lg cursor-pointer">
                {uploadingProfile ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
                  disabled={uploadingProfile}
                />
              </label> */}
            </div>

            {/* Restaurant Info */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                  {/* Online/Offline Toggle */}
                  <button
                    onClick={toggleOnlineStatus}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                      profile.open
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {profile.open ? '● Online' : '● Offline'}
                  </button>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{profile.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <div className="flex flex-col">
                      <span>{locationPrimary}</span>
                      {locationSecondary && (
                        <span className="text-xs text-gray-400">{locationSecondary}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {profile.description && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 px-4 py-3 rounded-r-lg">
                    <p className="text-gray-700 italic">"{profile.description}"</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex md:flex-col gap-2">
                <button 
                  onClick={() => navigate('/settings')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  Edit Profile
                </button>
                {/* <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                  View Menu
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">
                {orderCountLoading ? 'Syncing...' : 'All time'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {orderCountLoading ? '--' : (orderCount ?? 0)}
            </h3>
            <p className="text-gray-600 text-sm">Total Orders</p>
            <div className="mt-2 text-sm">
              {orderCountLoading ? (
                <span className="text-gray-500">Fetching latest count...</span>
              ) : orderCountError ? (
                <span className="text-red-600">{orderCountError}</span>
              ) : (
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">
                {revenueLoading ? 'Syncing...' : 'All time'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {revenueLoading ? '--' : revenueDisplay}
            </h3>
            <p className="text-gray-600 text-sm">Revenue</p>
            <div className="mt-2 text-sm">
              {revenueLoading ? (
                <span className="text-gray-500">Fetching latest revenue...</span>
              ) : revenueError ? (
                <span className="text-red-600">{revenueError}</span>
              ) : (
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  
                </span>
              )}
            </div>
          </div>

          {/* <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Average</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">28 min</h3>
            <p className="text-gray-600 text-sm">Delivery Time</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>-5 min improvement</span>
            </div>
          </div> */}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
          {ordersLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {newOrders && newOrders.length > 0 ? newOrders.slice(0, 10).map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate(`/orders/${order.orderId}`)}
                  title="View order details"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">Order ID# {order.orderId}</p>
                      <p className="text-sm text-gray-600">{order.customerId ? order.customerId : 'N/A'} </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'READY' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                    <p className="font-semibold text-gray-800 w-20 text-right">${order.totalAmount}</p>
                  </div>
                </div>
              )) : (
                <div className="text-gray-500 text-center py-8">No new orders found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
