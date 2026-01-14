import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  MapPin,
  Navigation2,
  Mail,
  DollarSign,
  ShieldCheck,
  Compass,
  ClipboardCopy,
  Check,
  Phone,
  Star
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchDeliveryRequestsForCurrentRestaurant } from '../api/deliveryRequestApi';
import { fetchRiderByEmail } from '../api/riderApi';
import { fetchCustomerByEmail } from '../api/customerApi';
import backgroundImage from '../assets/background.jpg';
import cashOnDeliveryVideo from '../assets/Cash on Delivery.mp4';

const statusTokens = {
  REQUESTED: 'border border-amber-200 bg-amber-50 text-amber-700',
  ASSIGNED: 'border border-sky-200 bg-sky-50 text-sky-700',
  FAILED: 'border border-rose-200 bg-rose-50 text-rose-700',
  DELIVERED: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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

export default function DeliverNow() {
  const { orderId: focusOrderId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [pageState, setPageState] = useState({ page: 0, size: 20 });
  const [pageMeta, setPageMeta] = useState({
    totalPages: 0,
    totalElements: 0,
    numberOfElements: 0,
    currentPage: 0,
  });
  const [routeState, setRouteState] = useState({ coords: [], loading: false, error: null });
  const [riderState, setRiderState] = useState({ data: null, loading: false, error: null });
  const [customerState, setCustomerState] = useState({ data: null, loading: false, error: null });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const targetPage = pageState.page;
    const targetSize = pageState.size;
    try {
      const response = await fetchDeliveryRequestsForCurrentRestaurant({ page: targetPage, size: targetSize });
      const data = response?.data ?? {};
      const payload = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
          ? data
          : [];
      const sorted = payload
        .slice()
        .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

      const totalElements = typeof data?.totalElements === 'number' ? data.totalElements : sorted.length;
      const totalPages = typeof data?.totalPages === 'number' ? data.totalPages : (sorted.length ? 1 : 0);
      const numberOfElements = typeof data?.numberOfElements === 'number' ? data.numberOfElements : sorted.length;
      const currentPageNumber = typeof data?.number === 'number' ? data.number : targetPage;
      const resolvedSize = typeof data?.size === 'number' ? data.size : targetSize;

      if (!sorted.length && totalElements > 0 && targetPage > 0 && totalPages > 0) {
        setPageState((prev) => {
          const normalized = Math.max(0, totalPages - 1);
          if (prev.page === normalized) {
            return prev;
          }
          return { ...prev, page: normalized };
        });
      }

      setPageMeta({
        totalPages,
        totalElements,
        numberOfElements,
        currentPage: currentPageNumber,
      });

      if (currentPageNumber !== targetPage || resolvedSize !== targetSize) {
        setPageState((prev) => {
          if (prev.page === currentPageNumber && prev.size === resolvedSize) {
            return prev;
          }
          return { page: currentPageNumber, size: resolvedSize };
        });
      }

      let initialIndex = 0;
      if (focusOrderId) {
        const focusedIndex = sorted.findIndex((log) => String(log.orderId) === String(focusOrderId));
        initialIndex = focusedIndex >= 0 ? focusedIndex : 0;
      }

      setLogs(sorted);
      setSelectedIndex(sorted.length ? initialIndex : 0);
      setLastRefreshed(new Date());
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      const message = err?.response?.data?.message || 'Unable to load delivery requests for this restaurant';
      setError(message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [focusOrderId, navigate, pageState.page, pageState.size]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    if (!focusOrderId || logs.length === 0) return;
    const index = logs.findIndex((log) => String(log.orderId) === String(focusOrderId));
    if (index >= 0 && index !== selectedIndex) {
      setSelectedIndex(index);
    }
  }, [focusOrderId, logs, selectedIndex]);

  const activeLog = logs[selectedIndex] || null;

  const pickupPoint = useMemo(() => {
    if (!activeLog) return null;
    const lat = parseNumber(activeLog.pickupLat);
    const lng = parseNumber(activeLog.pickupLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [activeLog]);

  const dropPoint = useMemo(() => {
    if (!activeLog) return null;
    const lat = parseNumber(activeLog.dropLat);
    const lng = parseNumber(activeLog.dropLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [activeLog]);

  const riderEmail = useMemo(() => {
    if (!activeLog) return null;
    return activeLog.deliveryId || null;
  }, [activeLog]);

  const customerEmail = useMemo(() => {
    if (!activeLog) return null;
    return activeLog.clientEmail || activeLog.customerEmail || activeLog.clientId || null;
  }, [activeLog]);

  useEffect(() => {
    let ignore = false;

    if (!pickupPoint || !dropPoint) {
      setRouteState({ coords: [], loading: false, error: null });
      return () => {
        ignore = true;
      };
    }

    const fetchRoute = async () => {
      setRouteState({ coords: [], loading: true, error: null });
      const query = `${pickupPoint.lng},${pickupPoint.lat};${dropPoint.lng},${dropPoint.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${query}?overview=full&geometries=geojson`; // public OSRM for quickest path
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Unable to fetch optimal path');
        }
        const data = await response.json();
        const rawCoords = data?.routes?.[0]?.geometry?.coordinates || [];
        const coords = rawCoords.map(([lng, lat]) => [lat, lng]);
        if (!ignore) {
          setRouteState({ coords, loading: false, error: null });
        }
      } catch (routeError) {
        console.warn('Route fetch failed', routeError);
        if (!ignore) {
          setRouteState({ coords: [], loading: false, error: 'Could not fetch the optimal route. Showing straight line instead.' });
        }
      }
    };

    fetchRoute();

    return () => {
      ignore = true;
    };
  }, [pickupPoint, dropPoint]);

  useEffect(() => {
    let ignore = false;

    if (!riderEmail) {
      setRiderState({ data: null, loading: false, error: null });
      return () => {
        ignore = true;
      };
    }

    const loadRider = async () => {
      setRiderState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchRiderByEmail(riderEmail);
        if (!ignore) {
          setRiderState({ data: response.data || null, loading: false, error: null });
        }
      } catch (riderError) {
        console.warn('Rider fetch failed', riderError);
        if (!ignore) {
          const message = riderError?.response?.data?.message || 'Unable to load rider details';
          setRiderState({ data: null, loading: false, error: message });
        }
      }
    };

    loadRider();

    return () => {
      ignore = true;
    };
  }, [riderEmail]);

  useEffect(() => {
    let ignore = false;

    if (!customerEmail) {
      setCustomerState({ data: null, loading: false, error: null });
      return () => {
        ignore = true;
      };
    }

    const loadCustomer = async () => {
      setCustomerState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetchCustomerByEmail(customerEmail);
        if (!ignore) {
          setCustomerState({ data: response.data || null, loading: false, error: null });
        }
      } catch (customerError) {
        console.warn('Customer fetch failed', customerError);
        if (!ignore) {
          const message = customerError?.response?.data?.message || 'Unable to load customer details';
          setCustomerState({ data: null, loading: false, error: message });
        }
      }
    };

    loadCustomer();

    return () => {
      ignore = true;
    };
  }, [customerEmail]);

  const handleCopy = async (value, field) => {
    if (!value || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (clipboardError) {
      console.warn('Copy failed', clipboardError);
    }
  };

  const goToPreviousPage = () => {
    if (loading) return;
    setPageState((prev) => {
      if (prev.page <= 0) {
        return prev;
      }
      return { ...prev, page: prev.page - 1 };
    });
  };

  const goToNextPage = () => {
    if (loading) return;
    setPageState((prev) => {
      if (pageMeta.totalPages && prev.page >= pageMeta.totalPages - 1) {
        return prev;
      }
      return { ...prev, page: prev.page + 1 };
    });
  };

  const handlePageSizeChange = (event) => {
    const nextSize = Number(event.target.value);
    const normalizedSize = Number.isFinite(nextSize) && nextSize > 0 ? nextSize : 20;
    setPageState({ page: 0, size: normalizedSize });
  };

  const summaryCards = useMemo(() => {
    if (!logs.length) return [];
    const totals = logs.reduce((acc, log) => {
      const status = (log.status || 'UNKNOWN').toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(totals).map(([status, count]) => ({ status, count }));
  }, [logs]);

  const renderQueue = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-rose-700">
          <p className="text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={loadLogs}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      );
    }

    if (!logs.length) {
      return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 text-center">
          <p className="text-sm font-semibold text-slate-600">No delivery requests yet.</p>
          <p className="mt-1 text-xs text-slate-400">New requests will appear here automatically.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '70vh' }}>
        {logs.map((log, index) => {
          const isActive = index === selectedIndex;
          return (
            <button
              key={log.requestId || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                isActive
                  ? 'border-orange-200 bg-orange-50 text-slate-900 shadow-lg'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em]">
                <span>{(log.status || 'UNKNOWN').toLowerCase()}</span>
                <span className="text-[9px] text-slate-500">{formatTimestamp(log.updatedAt || log.createdAt)}</span>
              </div>
              <p className="mt-1 text-lg font-semibold">Order #{log.orderId || '--'}</p>
              <p className="text-sm text-slate-500">Delivery ID: {log.deliveryId || 'Pending'}</p>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>{formatCurrency(log.price)}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderPaginationControls = () => {
    if (loading || error) return null;
    const totalItems = pageMeta.totalElements ?? logs.length;
    if (!totalItems) return null;

    const totalPages = Math.max(pageMeta.totalPages || 0, 1);
    const currentPage = Math.min(pageState.page, totalPages - 1);
    const showingCount = pageMeta.numberOfElements ?? logs.length ?? 0;
    const isPrevDisabled = currentPage === 0 || loading;
    const isNextDisabled = currentPage >= totalPages - 1 || loading;

    return (
      <div className="mt-4 space-y-2 rounded-3xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold">
            Showing {showingCount} of {totalItems} requests
          </span>
          <label className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Rows
            <select
              value={pageState.size}
              onChange={handlePageSizeChange}
              className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}/page
                </option>
              ))}
              {!PAGE_SIZE_OPTIONS.includes(pageState.size) && (
                <option value={pageState.size}>{pageState.size}/page</option>
              )}
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={isPrevDisabled}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={isNextDisabled}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    if (loading) {
      return (
        <div className="flex h-96 items-center justify-center rounded-[32px] border border-white/70 bg-white/80 shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
      );
    }

    if (!activeLog) {
      return (
        <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/80 p-10 text-center text-slate-500 shadow-inner">
          <MapPin className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-lg font-semibold">Select a delivery request</p>
          <p className="text-sm">Details will appear here once you pick a request from the queue.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Deliver now</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900" style={{ fontFamily: '"Space Grotesk", "Gill Sans", sans-serif' }}>
                Order #{activeLog.orderId || '—'}
              </h1>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold ${
                statusTokens[activeLog.status] || 'border border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <ShieldCheck className="h-4 w-4" />
                {activeLog.status || 'UNKNOWN'}
              </span>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{formatCurrency(activeLog.price)}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* <InfoChip label="Restaurant" icon={<Mail className="h-4 w-4" />} value={activeLog.restaurantEmail || '—'} />
            <InfoChip label="Client" icon={<ShieldCheck className="h-4 w-4" />} value={activeLog.clientId || '—'} />
            <InfoChip label="Delivery" icon={<Navigation2 className="h-4 w-4" />} value={activeLog.deliveryId || 'Awaiting assignment'} /> */}
            <InfoChip
              label="OTP"
              icon={<Compass className="h-4 w-4" />}
              value={activeLog.otp ? activeLog.otp : 'Not generated'}
              action={activeLog.otp ? (
                <button
                  type="button"
                  onClick={() => handleCopy(activeLog.otp, 'otp')}
                  className="text-xs text-slate-500 hover:text-slate-800"
                  title="Copy OTP"
                >
                  {copiedField === 'otp' ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                </button>
              ) : null}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/orders/${activeLog.orderId}`)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View order
            </button>
            <button
              type="button"
              onClick={loadLogs}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <article className="lg:col-span-3 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-lg">
            <header className="flex items-center justify-between text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Route overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Pickup to Drop</h2>
              </div>
              <DollarSign className="h-6 w-6 text-orange-500" />
            </header>
            {pickupPoint && dropPoint ? (
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100 shadow-inner">
                <RouteMap
                  pickup={pickupPoint}
                  drop={dropPoint}
                  routeCoords={routeState.coords}
                  loading={routeState.loading}
                  error={routeState.error}
                />
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                <MapPin className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-4 text-sm">Add pickup and drop coordinates to preview the route.</p>
              </div>
            )}
            <div className="mt-6 overflow-hidden rounded-3xl">
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
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <LocationCard
                title="Pickup"
                subtitle="Restaurant"
                lat={formatCoordinate(activeLog.pickupLat)}
                lng={formatCoordinate(activeLog.pickupLng)}
                accent="from-emerald-50 to-transparent"
              />
              <LocationCard
                title="Drop"
                subtitle="Customer"
                lat={formatCoordinate(activeLog.dropLat)}
                lng={formatCoordinate(activeLog.dropLng)}
                accent="from-orange-50 to-transparent"
              />
            </div>
          </article>

          <article className="lg:col-span-2 space-y-6">
            <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-lg">
              <header className="flex items-center justify-between text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Timeline</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Request history</h2>
                </div>
              </header>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Created</p>
                  <p className="text-xs text-slate-500">{formatTimestamp(activeLog.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Updated</p>
                  <p className="text-xs text-slate-500">{formatTimestamp(activeLog.updatedAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 sm:col-span-2">
                  <p className="text-sm font-semibold text-slate-900">Delivery</p>
                  <p className="font-mono text-xs text-orange-500">{activeLog.deliveryId || 'Awaiting assignment'}</p>
                </div>
              </div>
              {lastRefreshed && (
                <p className="text-xs text-slate-500">Last synced {formatTimestamp(lastRefreshed)}</p>
              )}
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-lg">
              <header className="flex items-center justify-between text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Assigned rider</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Rider details</h2>
                </div>
                {activeLog.deliveryId && (
                  <span className="text-xs text-slate-500">{activeLog.deliveryId}</span>
                )}
              </header>
              <RiderDetailsCard
                email={activeLog.deliveryId}
                riderState={riderState}
                onCopy={handleCopy}
                copiedField={copiedField}
              />
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-lg">
              <header className="flex items-center justify-between text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Customer</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Customer details</h2>
                </div>
                {customerEmail && (
                  <span className="text-xs text-slate-500">{customerEmail}</span>
                )}
              </header>
              <CustomerDetailsCard
                email={customerEmail}
                customerState={customerState}
                onCopy={handleCopy}
                copiedField={copiedField}
              />
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 text-slate-700 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">Meta</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.35em] text-slate-500">Restaurant email</dt>
                  <dd className="break-all text-slate-700">{activeLog.restaurantEmail || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.35em] text-slate-500">Client ID</dt>
                  <dd className="break-all text-slate-700">{activeLog.clientId || '—'}</dd>
                </div>
              </dl>
            </div>
          </article>
        </section>
      </div>
    );
  };

  const headerLabel = activeLog?.restaurantEmail || 'Delivery queue';
  const totalTaskCount = pageMeta.totalElements ?? logs.length;
  const taskLabel = totalTaskCount === 1 ? 'task' : 'tasks';

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto max-w-6xl space-y-8 text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {headerLabel}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> {totalTaskCount} {taskLabel}
            </div>
          </div>
        </div>

        {summaryCards.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map(({ status, count }) => (
              <div key={status} className="rounded-3xl border border-white/60 bg-white/90 p-4 text-slate-800 shadow">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{status}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="rounded-[32px] border border-white/70 bg-white/95 p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-500">
              <span>Queue</span>
              <button
                type="button"
                onClick={loadLogs}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-3 w-3" /> Sync
              </button>
            </div>
            <div className="mt-4">{renderQueue()}</div>
            {renderPaginationControls()}
          </aside>
          <section>{renderDetail()}</section>
        </div>
      </div>
    </div>
  );
}

const InfoChip = ({ label, icon, value, action }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
      <span>{label}</span>
      {action || icon}
    </div>
    <p className="mt-2 break-all text-base font-semibold text-slate-800">{value}</p>
  </div>
);

const LocationCard = ({ title, subtitle, lat, lng, accent }) => (
  <div className={`rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-inner ${accent ? `bg-gradient-to-br ${accent}` : ''}`}>
    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{subtitle}</p>
    <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
    <div className="mt-4 text-sm text-slate-600">
      <p>
        <span className="text-slate-400">Lat:</span> {lat}
      </p>
      <p>
        <span className="text-slate-400">Lng:</span> {lng}
      </p>
    </div>
  </div>
);

const RouteMap = ({ pickup, drop, routeCoords, loading, error }) => {
  const fallbackLine = useMemo(() => {
    if (!pickup || !drop) return [];
    return [
      [pickup.lat, pickup.lng],
      [drop.lat, drop.lng],
    ];
  }, [pickup, drop]);

  const polylineCoords = routeCoords?.length ? routeCoords : fallbackLine;
  const markerPoints = fallbackLine.filter((point) => Array.isArray(point));
  const hasData = markerPoints.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center bg-slate-50 text-slate-400">
        <p>Coordinates missing.</p>
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full">
      <MapContainer className="h-full w-full" center={markerPoints[0]} zoom={13} scrollWheelZoom={false} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <FitMapBounds points={markerPoints} routeCoords={polylineCoords} />
        {polylineCoords.length >= 2 && (
          <Polyline positions={polylineCoords} pathOptions={{ color: '#f97316', weight: 5, opacity: 0.8 }} />
        )}
        <CircleMarker center={markerPoints[0]} radius={8} pathOptions={{ color: '#22c55e', weight: 2, fillOpacity: 0.9 }}>
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>Pickup</Tooltip>
        </CircleMarker>
        <CircleMarker center={markerPoints[markerPoints.length - 1]} radius={8} pathOptions={{ color: '#f97316', weight: 2, fillOpacity: 0.9 }}>
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>Drop</Tooltip>
        </CircleMarker>
      </MapContainer>
      {(loading || error) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/70 text-center text-sm font-semibold text-slate-600">
          {loading ? (
            <>
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-orange-400" />
              Calculating optimal path...
            </>
          ) : (
            error
          )}
        </div>
      )}
    </div>
  );
};

const FitMapBounds = ({ points, routeCoords }) => {
  const map = useMap();

  useEffect(() => {
    const coords = routeCoords?.length ? routeCoords : points;
    if (!coords?.length) return;
    const latLngs = coords.map(([lat, lng]) => [lat, lng]);
    map.fitBounds(latLngs, { padding: [24, 24] });
  }, [map, points, routeCoords]);

  return null;
};

const RiderDetailsCard = ({ email, riderState, onCopy, copiedField }) => {
  if (!email) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500">
        Rider not assigned yet.
      </div>
    );
  }

  if (riderState.loading) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
      </div>
    );
  }

  if (riderState.error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-rose-600">
        {riderState.error}
      </div>
    );
  }

  const rider = riderState.data;

  if (!rider) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500">
        Rider information unavailable.
      </div>
    );
  }

  const avatar = rider.riderImage || `https://ui-avatars.com/api/?background=ffedd5&name=${encodeURIComponent(rider.riderName || 'Rider')}`;

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-4">
        <img
          src={avatar}
          alt={rider.riderName || 'Assigned rider'}
          className="h-16 w-16 rounded-2xl object-cover"
        />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Assigned rider</p>
          <p className="text-xl font-semibold text-slate-900">{rider.riderName || '—'}</p>
          <p className="text-xs text-slate-500">Vehicle #{rider.vehicleNo || '—'}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            <Phone className="h-4 w-4 text-slate-500" />
            Phone
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{rider.riderPhone || '—'}</p>
          {rider.riderPhone && (
            <button
              type="button"
              onClick={() => onCopy(rider.riderPhone, 'riderPhone')}
              className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-600"
            >
              {copiedField === 'riderPhone' ? 'Copied' : 'Copy number'}
            </button>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            <Star className="h-4 w-4 text-yellow-500" />
            Rating
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{rider.rating || '—'}</p>
          <p className="text-xs text-slate-500">Completed {rider.deliveryCount || 0} deliveries</p>
        </div>
      </div>
    </div>
  );
};

const CustomerDetailsCard = ({ email, customerState, onCopy, copiedField }) => {
  if (!email) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500">
        Customer email unavailable.
      </div>
    );
  }

  if (customerState.loading) {
    return (
      <div className="flex h-32 items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
      </div>
    );
  }

  if (customerState.error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-rose-600">
        {customerState.error}
      </div>
    );
  }

  const customer = customerState.data;

  if (!customer) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500">
        Customer information unavailable.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Customer name</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{customer.customerName || '—'}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
          <p className="mt-1 break-all text-base font-semibold text-slate-900">{customer.customerEmail || email}</p>
          {(customer.customerEmail || email) && (
            <button
              type="button"
              onClick={() => onCopy(customer.customerEmail || email, 'customerEmail')}
              className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-600"
            >
              {copiedField === 'customerEmail' ? 'Copied' : 'Copy email'}
            </button>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            <Phone className="h-4 w-4 text-slate-500" />
            Phone
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">{customer.customerPhone || '—'}</p>
          {customer.customerPhone && (
            <button
              type="button"
              onClick={() => onCopy(customer.customerPhone, 'customerPhone')}
              className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-600"
            >
              {copiedField === 'customerPhone' ? 'Copied' : 'Copy number'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
