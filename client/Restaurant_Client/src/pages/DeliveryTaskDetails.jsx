import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  MapPin,
  Mail,
  ShieldCheck,
  Compass,
  ClipboardCopy,
  Check,
  Phone,
  Star,
  DollarSign,
  Navigation2,
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchDeliveryRequestsForCurrentRestaurant } from '../api/deliveryRequestApi';
import { fetchRiderByEmail } from '../api/riderApi';
import { fetchCustomerByEmail } from '../api/customerApi';
import backgroundImage from '../assets/background.jpg';
import cashOnDeliveryVideo from '../assets/Cash on Delivery.mp4';
import deliveryBanner from '../assets/menubanner.webp';

const statusTokens = {
  REQUESTED: 'border border-amber-200 bg-amber-50 text-amber-700',
  ASSIGNED: 'border border-sky-200 bg-sky-50 text-sky-700',
  FAILED: 'border border-rose-200 bg-rose-50 text-rose-700',
  DELIVERED: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
};

const formatCurrency = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '--';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parsed);
  } catch (error) {
    return `$${parsed.toFixed(2)}`;
  }
};

const formatTimestamp = (value) => {
  if (!value) return 'Not recorded';
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return String(value);
  }
};

const formatCoordinate = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '—';
  return `${parsed.toFixed(5)}°`;
};

const parseNumber = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Map auto-center component
const MapAutoCenter = ({ pickup, drop }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && drop) {
      const bounds = [
        [pickup.lat, pickup.lng],
        [drop.lat, drop.lng],
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pickup, drop, map]);

  return null;
};

// Route Map Component
const RouteMap = ({ pickup, drop, routeCoords, loading, error }) => {
  if (!pickup || !drop) return null;

  const lineCoords = routeCoords.length > 0 ? routeCoords : [
    [pickup.lat, pickup.lng],
    [drop.lat, drop.lng],
  ];

  return (
    <div className="relative h-96 w-full">
      <MapContainer
        center={[pickup.lat, pickup.lng]}
        zoom={13}
        className="h-full w-full rounded-2xl"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={lineCoords} color="#f97316" weight={4} opacity={0.7} />
        <CircleMarker center={[pickup.lat, pickup.lng]} radius={8} fillColor="#10b981" color="#fff" fillOpacity={0.9} weight={2}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            Pickup
          </Tooltip>
        </CircleMarker>
        <CircleMarker center={[drop.lat, drop.lng]} radius={8} fillColor="#ef4444" color="#fff" fillOpacity={0.9} weight={2}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            Drop
          </Tooltip>
        </CircleMarker>
        <MapAutoCenter pickup={pickup} drop={drop} />
      </MapContainer>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      )}
      {error && !loading && (
        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
          {error}
        </div>
      )}
    </div>
  );
};

// Info Chip Component
const InfoChip = ({ label, icon, value, action }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      {action}
    </div>
    <p className="mt-2 text-base font-semibold text-gray-800">{value}</p>
  </div>
);

// Location Card Component
const LocationCard = ({ title, subtitle, lat, lng, accent }) => (
  <div className={`rounded-xl border border-gray-100 bg-gradient-to-br p-4 ${accent}`}>
    <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
    <p className="mt-1 text-lg font-semibold text-gray-800">{subtitle}</p>
    <div className="mt-3 space-y-1 text-sm text-gray-600">
      <p>Lat: {lat}</p>
      <p>Lng: {lng}</p>
    </div>
  </div>
);

// Rider Details Card
const RiderDetailsCard = ({ email, riderState, onCopy, copiedField }) => {
  if (!email) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Rider not assigned yet.
      </div>
    );
  }

  if (riderState.loading) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
      </div>
    );
  }

  if (riderState.error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
        {riderState.error}
      </div>
    );
  }

  const rider = riderState.data;

  if (!rider) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Rider information unavailable.
      </div>
    );
  }

  const avatar = rider.riderImage || `https://ui-avatars.com/api/?background=ffedd5&name=${encodeURIComponent(rider.riderName || 'Rider')}`;

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-4">
        <img
          src={avatar}
          alt={rider.riderName || 'Assigned rider'}
          className="h-16 w-16 rounded-xl object-cover"
        />
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Assigned rider</p>
          <p className="mt-1 text-xl font-semibold text-gray-800">{rider.riderName || '—'}</p>
          <p className="text-xs text-gray-500">Vehicle #{rider.vehicleNo || '—'}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
          <p className="mt-1 break-all text-base font-semibold text-gray-800">{rider.riderEmail || email}</p>
          {(rider.riderEmail || email) && (
            <button
              type="button"
              onClick={() => onCopy(rider.riderEmail || email, 'riderEmail')}
              className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              {copiedField === 'riderEmail' ? 'Copied' : 'Copy email'}
            </button>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
            <Phone className="h-4 w-4 text-gray-500" />
            Phone
          </div>
          <p className="mt-1 text-base font-semibold text-gray-800">{rider.riderPhone || '—'}</p>
          {rider.riderPhone && (
            <button
              type="button"
              onClick={() => onCopy(rider.riderPhone, 'riderPhone')}
              className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              {copiedField === 'riderPhone' ? 'Copied' : 'Copy number'}
            </button>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
            <Star className="h-4 w-4 text-yellow-500" />
            Rating
          </div>
          <p className="mt-1 text-base font-semibold text-gray-800">{rider.rating || '—'}</p>
          <p className="text-xs text-gray-500">Completed {rider.deliveryCount || 0} deliveries</p>
        </div>
      </div>
    </div>
  );
};

// Customer Details Card
const CustomerDetailsCard = ({ email, customerState, onCopy, copiedField }) => {
  if (!email) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Customer email unavailable.
      </div>
    );
  }

  if (customerState.loading) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
      </div>
    );
  }

  if (customerState.error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
        {customerState.error}
      </div>
    );
  }

  const customer = customerState.data;

  if (!customer) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Customer information unavailable.
      </div>
    );
  }

  const avatar = customer.customerImage || `https://ui-avatars.com/api/?background=dbeafe&name=${encodeURIComponent(customer.customerName || 'Customer')}`;

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-4">
        <img
          src={avatar}
          alt={customer.customerName || 'Customer'}
          className="h-16 w-16 rounded-xl object-cover"
        />
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Customer name</p>
          <p className="mt-1 text-xl font-semibold text-gray-800">{customer.customerName || '—'}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
          <p className="mt-1 break-all text-base font-semibold text-gray-800">{customer.customerEmail || email}</p>
          {(customer.customerEmail || email) && (
            <button
              type="button"
              onClick={() => onCopy(customer.customerEmail || email, 'customerEmail')}
              className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              {copiedField === 'customerEmail' ? 'Copied' : 'Copy email'}
            </button>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
            <Phone className="h-4 w-4 text-gray-500" />
            Phone
          </div>
          <p className="mt-1 text-base font-semibold text-gray-800">{customer.customerPhone || '—'}</p>
          {customer.customerPhone && (
            <button
              type="button"
              onClick={() => onCopy(customer.customerPhone, 'customerPhone')}
              className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              {copiedField === 'customerPhone' ? 'Copied' : 'Copy number'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DeliveryTaskDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [deliveryTask, setDeliveryTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [routeState, setRouteState] = useState({ coords: [], loading: false, error: null });
  const [riderState, setRiderState] = useState({ data: null, loading: false, error: null });
  const [customerState, setCustomerState] = useState({ data: null, loading: false, error: null });

  const loadDeliveryTask = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDeliveryRequestsForCurrentRestaurant({ page: 0, size: 1000 });
      const data = response?.data ?? {};
      const payload = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
      
      const task = payload.find((t) => String(t.orderId) === String(orderId));

      if (!task) {
        setError('Delivery task not found');
        setDeliveryTask(null);
      } else {
        setDeliveryTask(task);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      const message = err?.response?.data?.message || 'Unable to load delivery task';
      setError(message);
      setDeliveryTask(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    loadDeliveryTask();
  }, [loadDeliveryTask]);

  const pickupPoint = useMemo(() => {
    if (!deliveryTask) return null;
    const lat = parseNumber(deliveryTask.pickupLat);
    const lng = parseNumber(deliveryTask.pickupLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [deliveryTask]);

  const dropPoint = useMemo(() => {
    if (!deliveryTask) return null;
    const lat = parseNumber(deliveryTask.dropLat);
    const lng = parseNumber(deliveryTask.dropLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [deliveryTask]);

  const riderEmail = useMemo(() => {
    if (!deliveryTask) return null;
    return deliveryTask.deliveryId || null;
  }, [deliveryTask]);

  const customerEmail = useMemo(() => {
    if (!deliveryTask) return null;
    return deliveryTask.clientEmail || deliveryTask.customerEmail || deliveryTask.clientId || null;
  }, [deliveryTask]);

  // Fetch route
  useEffect(() => {
    let ignore = false;

    if (!pickupPoint || !dropPoint) {
      setRouteState({ coords: [], loading: false, error: null });
      return () => { ignore = true; };
    }

    const fetchRoute = async () => {
      setRouteState({ coords: [], loading: true, error: null });
      const query = `${pickupPoint.lng},${pickupPoint.lat};${dropPoint.lng},${dropPoint.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${query}?overview=full&geometries=geojson`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Unable to fetch optimal path');
        
        const data = await response.json();
        const rawCoords = data?.routes?.[0]?.geometry?.coordinates || [];
        const coords = rawCoords.map(([lng, lat]) => [lat, lng]);
        
        if (!ignore) {
          setRouteState({ coords, loading: false, error: null });
        }
      } catch (routeError) {
        console.warn('Route fetch failed', routeError);
        if (!ignore) {
          setRouteState({ coords: [], loading: false, error: 'Could not fetch route. Showing straight line.' });
        }
      }
    };

    fetchRoute();
    return () => { ignore = true; };
  }, [pickupPoint, dropPoint]);

  // Fetch rider
  useEffect(() => {
    let ignore = false;

    if (!riderEmail) {
      setRiderState({ data: null, loading: false, error: null });
      return () => { ignore = true; };
    }

    const loadRider = async () => {
      setRiderState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchRiderByEmail(riderEmail);
        const riderData = response?.data || null;
        if (!ignore) {
          setRiderState({ data: riderData, loading: false, error: null });
        }
      } catch (err) {
        if (!ignore) {
          const message = err?.response?.data?.message || 'Failed to load rider details';
          setRiderState({ data: null, loading: false, error: message });
        }
      }
    };

    loadRider();
    return () => { ignore = true; };
  }, [riderEmail]);

  // Fetch customer
  useEffect(() => {
    let ignore = false;

    if (!customerEmail) {
      setCustomerState({ data: null, loading: false, error: null });
      return () => { ignore = true; };
    }

    const loadCustomer = async () => {
      setCustomerState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchCustomerByEmail(customerEmail);
        const customerData = response?.data || null;
        if (!ignore) {
          setCustomerState({ data: customerData, loading: false, error: null });
        }
      } catch (err) {
        if (!ignore) {
          const message = err?.response?.data?.message || 'Failed to load customer details';
          setCustomerState({ data: null, loading: false, error: message });
        }
      }
    };

    loadCustomer();
    return () => { ignore = true; };
  }, [customerEmail]);

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-600" />
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading delivery task...</p>
        </div>
      </div>
    );
  }

  if (error || !deliveryTask) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-xl font-semibold text-red-600">{error || 'Delivery task not found'}</p>
          <button
            type="button"
            onClick={() => navigate('/deliver-now')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <img
            src={deliveryBanner}
            alt="Delivery details banner"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 space-y-3">
            <span
              className="text-white text-3xl sm:text-4xl tracking-[0.4em]"
              style={{ fontFamily: 'Impact, sans-serif', fontWeight: '400' }}
            >
              DELIVERY DETAILS
            </span>
            <p
              className="text-white text-base sm:text-lg tracking-[0.3em] uppercase"
              style={{ fontFamily: 'sans-serif', fontWeight: '400' }}
            >
              Order #{deliveryTask.orderId || '—'}
            </p>
          </div>
        </div>

        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/deliver-now')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </button>
          <button
            type="button"
            onClick={loadDeliveryTask}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Main Details */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Delivery Task</p>
              <h1 className="mt-2 text-4xl font-bold text-gray-800">
                Order #{deliveryTask.orderId || '—'}
              </h1>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  deliveryTask.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  deliveryTask.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                  deliveryTask.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}
              >
                {deliveryTask.status || 'UNKNOWN'}
              </span>
              <p className="mt-4 text-5xl font-bold text-gray-800">{formatCurrency(deliveryTask.price)}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoChip
              label="OTP"
              icon={<Compass className="h-4 w-4" />}
              value={deliveryTask.otp || 'Not generated'}
              action={
                deliveryTask.otp ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(deliveryTask.otp, 'otp')}
                    className="text-orange-600 hover:text-orange-700"
                    title="Copy OTP"
                  >
                    {copiedField === 'otp' ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  </button>
                ) : null
              }
            />
            <InfoChip
              label="Created At"
              icon={<MapPin className="h-4 w-4" />}
              value={formatTimestamp(deliveryTask.createdAt)}
            />
            <InfoChip
              label="Updated At"
              icon={<MapPin className="h-4 w-4" />}
              value={formatTimestamp(deliveryTask.updatedAt)}
            />
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate(`/orders/${deliveryTask.orderId}`)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
            >
              View Full Order Details
            </button>
          </div>
        </section>

        {/* Map and Location */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Route Overview</h2>
          
          {pickupPoint && dropPoint ? (
            <RouteMap
              pickup={pickupPoint}
              drop={dropPoint}
              routeCoords={routeState.coords}
              loading={routeState.loading}
              error={routeState.error}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
              <MapPin className="mx-auto h-12 w-12" />
              <p className="mt-4 text-sm">Coordinates not available</p>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <LocationCard
              title="Pickup"
              subtitle="Restaurant Location"
              lat={formatCoordinate(deliveryTask.pickupLat)}
              lng={formatCoordinate(deliveryTask.pickupLng)}
              accent="from-green-50 to-transparent"
            />
            <LocationCard
              title="Drop"
              subtitle="Customer Location"
              lat={formatCoordinate(deliveryTask.dropLat)}
              lng={formatCoordinate(deliveryTask.dropLng)}
              accent="from-red-50 to-transparent"
            />
          </div>

          <div className="mt-8">
            <video
              className="h-96 w-full rounded-2xl object-cover"
              src={cashOnDeliveryVideo}
              autoPlay
              loop
              muted
              playsInline
              aria-label="Cash on Delivery overview"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* Rider and Customer Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Rider */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Rider Details</h2>
            <RiderDetailsCard
              email={riderEmail}
              riderState={riderState}
              onCopy={handleCopy}
              copiedField={copiedField}
            />
          </section>

          {/* Customer */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Customer Details</h2>
            <CustomerDetailsCard
              email={customerEmail}
              customerState={customerState}
              onCopy={handleCopy}
              copiedField={copiedField}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
