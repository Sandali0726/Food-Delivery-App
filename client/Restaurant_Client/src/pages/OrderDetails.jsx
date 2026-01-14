import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, User, Mail, MapPin, Clock, Package, DollarSign, Trash2, Navigation2 } from 'lucide-react';
import { getOrderById, getOrderItems, changeOrderStatus, removeOrder } from '../features/orderSlice';
import { reverseGeocode } from '../api/geocodeApi';
import foodAPI from '../api/foodApi';
import detailsBanner from '../assets/details.png';
import backgroundImage from '../assets/background.jpg';

const emptyOrderState = { order: null, orderItems: [], loading: false };
const selectOrderDetails = (state) => state.orders ?? emptyOrderState;
const statusOptions = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
const mapPadding = 0.01;

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
  } catch (err) {
    return `$${value}`;
  }
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'N/A');
const extractImageUrl = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    return payload.imageUrl || payload.url || payload.data || null;
  }
  return null;
};

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, orderItems, loading } = useSelector(selectOrderDetails);
  const [geoAddress, setGeoAddress] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');
  const [foodImages, setFoodImages] = useState({});

  const dropLat = order?.dropLat !== undefined && order?.dropLat !== null ? Number(order.dropLat) : null;
  const dropLng = order?.dropLng !== undefined && order?.dropLng !== null ? Number(order.dropLng) : null;

  useEffect(() => {
    if (id) {
      dispatch(getOrderById(id));
      dispatch(getOrderItems(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (dropLat === null || dropLng === null || Number.isNaN(dropLat) || Number.isNaN(dropLng)) {
      setGeoAddress(null);
      setGeoStatus('idle');
      return;
    }

    let cancelled = false;
    setGeoStatus('loading');
    reverseGeocode(dropLat, dropLng)
      .then((resolved) => {
        if (!cancelled) {
          setGeoAddress(resolved);
          setGeoStatus('success');
        }
      })
      .catch((error) => {
        console.error('Reverse geocoding failed', error);
        if (!cancelled) {
          setGeoStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dropLat, dropLng]);

  useEffect(() => {
    if (!orderItems || orderItems.length === 0) return;

    let cancelled = false;
    const loadImages = async () => {
      const missing = orderItems.filter((item) => item.foodId && !foodImages[item.foodId]);
      if (missing.length === 0) return;

      try {
        const results = await Promise.all(
          missing.map(async (item) => {
            const response = await foodAPI.getFoodImage(item.foodId);
            return { id: item.foodId, url: extractImageUrl(response?.data) };
          })
        );

        if (!cancelled) {
          setFoodImages((prev) => {
            const next = { ...prev };
            results.forEach(({ id, url }) => {
              if (id && url) {
                next[id] = url;
              }
            });
            return next;
          });
        }
      } catch (error) {
        console.error('Failed to fetch food image', error);
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [orderItems, foodImages]);

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-white">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  const handleStatusChange = (status) => {
    if (status === order.status) return;
    dispatch(changeOrderStatus({ id: order.orderId, status }));
  };

  const handleDelete = () => {
    dispatch(removeOrder(order.orderId));
    navigate(-1);
  };

  const mapUrl = dropLat !== null && dropLng !== null && !Number.isNaN(dropLat) && !Number.isNaN(dropLng)
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(dropLng - mapPadding).toFixed(6)}%2C${(dropLat - mapPadding).toFixed(6)}%2C${(dropLng + mapPadding).toFixed(6)}%2C${(dropLat + mapPadding).toFixed(6)}&layer=mapnik&marker=${dropLat}%2C${dropLng}`
    : null;

  const displayAddress = geoStatus === 'success' && geoAddress ? geoAddress : (order.dropAddress || 'N/A');

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12 space-y-6">
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <img
            src={detailsBanner}
            alt="Order details backdrop"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 space-y-3">
            <span
              className="text-white text-3xl sm:text-4xl tracking-[0.4em]"
              style={{ fontFamily: 'Impact, sans-serif', fontWeight: '400' }}
            >
              ORDER DETAILS
            </span>
            <p
              className="text-white text-base sm:text-lg tracking-[0.3em] uppercase"
              style={{ fontFamily: 'sans-serif', fontWeight: '400' }}
            >
              Order #{order.orderId || '—'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Order #{order.orderId}</p>
              <h1 className="text-2xl font-bold text-gray-800 mt-1">{order.dropAddress || 'Delivery order'}</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" /> {formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${
                  order.status === 'READY'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'DELIVERED'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {order.status}
              </span>
              <p className="text-4xl font-bold text-gray-800 mt-4">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="bg-white rounded-xl shadow-lg p-6 space-y-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" /> Customer & Restaurant
            </h2>
            <dl className="grid grid-cols-1 gap-4 text-sm text-gray-600">
              <div>
                <dt className="uppercase tracking-wide text-xs text-gray-400">Customer ID</dt>
                <dd className="text-base text-gray-900">{order.customerId || 'N/A'}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide text-xs text-gray-400">Restaurant Email</dt>
                <dd className="flex items-center gap-2 text-base text-gray-900">
                  <Mail className="w-4 h-4 text-gray-400" /> {order.restaurantEmail || 'Not provided'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="bg-white rounded-2xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" /> Delivery Details
            </h2>
            <dl className="grid grid-cols-1 gap-4 text-sm text-gray-600">
              <div>
                <dt className="uppercase tracking-wide text-xs text-gray-400">Drop Address</dt>
                <dd className="text-base text-gray-900">
                  {geoStatus === 'loading' ? 'Resolving address…' : displayAddress}
                  {geoStatus === 'error' && <span className="block text-xs text-rose-500">Unable to reach geocoding service.</span>}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="uppercase tracking-wide text-xs text-gray-400">Created</dt>
                  <dd className="text-base text-gray-900">{formatDateTime(order.createdAt)}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-xs text-gray-400">Updated</dt>
                  <dd className="text-base text-gray-900">{formatDateTime(order.updatedAt)}</dd>
                </div>
              </div>
            </dl>
            {mapUrl ? (
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 shadow-inner h-64">
                <iframe
                  title="Drop location preview"
                  src={mapUrl}
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400">Add latitude and longitude to preview this drop on the map.</p>
            )}
          </section>
        </div>

        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" /> Items ({orderItems?.length || 0})
            </h2>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {orderItems && orderItems.length > 0 ? (
              orderItems.map((item) => (
                <div key={item.orderItemId} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    {foodImages[item.foodId] ? (
                      <img
                        src={foodImages[item.foodId]}
                        alt={item.foodName || 'Food item'}
                        className="w-24 h-24 rounded-[30px] object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-[30px] bg-gray-100 text-gray-400 flex items-center justify-center font-semibold text-xl">
                        {item.foodName ? item.foodName.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-base font-semibold text-gray-800">{item.foodName}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-gray-800">{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">No order items yet.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">Status & Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={status === order.status || status === 'DELIVERED'}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  status === order.status
                    ? 'bg-orange-600 text-white border-orange-600 cursor-default'
                    : status === 'DELIVERED'
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {/* <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            >
              <Trash2 className="w-4 h-4" /> Delete order
            </button> */}
            <button
              onClick={() => navigate(`/deliver-now/${order.orderId}`)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
            >
              <Navigation2 className="w-4 h-4" /> Open Deliver Now
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:text-orange-600 hover:border-orange-400 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to list
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
