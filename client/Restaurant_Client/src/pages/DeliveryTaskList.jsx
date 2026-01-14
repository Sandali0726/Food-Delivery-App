import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, Package, Clock, DollarSign } from 'lucide-react';
import { fetchDeliveryRequestsForCurrentRestaurant } from '../api/deliveryRequestApi';
import backgroundImage from '../assets/background.jpg';
import deliveryBanner from '../assets/menubanner.webp';

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

export default function DeliveryTaskList() {
  const navigate = useNavigate();
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [pageState, setPageState] = useState({ page: 0, size: 10 });
  const [pageMeta, setPageMeta] = useState({
    totalPages: 0,
    totalElements: 0,
    numberOfElements: 0,
    currentPage: 0,
  });

  const loadDeliveryTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const targetPage = pageState.page;
    const targetSize = pageState.size;

    try {
      const response = await fetchDeliveryRequestsForCurrentRestaurant({ 
        page: targetPage, 
        size: targetSize 
      });
      
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

      setPageMeta({
        totalPages,
        totalElements,
        numberOfElements,
        currentPage: currentPageNumber,
      });

      setDeliveryTasks(sorted);
      setLastRefreshed(new Date());
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      const message = err?.response?.data?.message || 'Unable to load delivery requests';
      setError(message);
      setDeliveryTasks([]);
    } finally {
      setLoading(false);
    }
  }, [navigate, pageState.page, pageState.size]);

  useEffect(() => {
    loadDeliveryTasks();
  }, [loadDeliveryTasks]);

  const handleTaskClick = (orderId) => {
    navigate(`/deliver-now/${orderId}`);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageState({ page: 0, size: newSize });
  };

  const goToPreviousPage = () => {
    setPageState((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }));
  };

  const goToNextPage = () => {
    const maxPage = Math.max(0, pageMeta.totalPages - 1);
    setPageState((prev) => ({ ...prev, page: Math.min(maxPage, prev.page + 1) }));
  };

  const renderPaginationControls = () => {
    if (loading || error) return null;
    const totalItems = pageMeta.totalElements ?? deliveryTasks.length;
    if (!totalItems) return null;

    const totalPages = Math.max(pageMeta.totalPages || 0, 1);
    const currentPage = Math.min(pageState.page, totalPages - 1);
    const showingCount = pageMeta.numberOfElements ?? deliveryTasks.length ?? 0;
    const isPrevDisabled = currentPage === 0 || loading;
    const isNextDisabled = currentPage >= totalPages - 1 || loading;

    return (
      <div className="bg-white rounded-xl shadow p-4 mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Showing {showingCount} of {totalItems} delivery tasks
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={isPrevDisabled}
              className={`px-3 py-1 rounded-lg text-sm font-medium border transition ${
                !isPrevDisabled
                  ? 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600'
                  : 'border-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={isNextDisabled}
              className={`px-3 py-1 rounded-lg text-sm font-medium border transition ${
                !isNextDisabled
                  ? 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600'
                  : 'border-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-12">
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8">
          <img
            src={deliveryBanner}
            alt="Delivery banner"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 space-y-3">
            <span
              className="text-white text-3xl sm:text-4xl tracking-[0.4em]"
              style={{ fontFamily: 'Impact, sans-serif', fontWeight: '400' }}
            >
              DELIVERY TASKS
            </span>
            <p
              className="text-white text-base sm:text-lg tracking-[0.3em] uppercase"
              style={{ fontFamily: 'sans-serif', fontWeight: '400' }}
            >
              Track every delivery in real-time
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">All Delivery Tasks</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and track all delivery requests
                {lastRefreshed && (
                  <span className="ml-2 text-gray-400">
                    • Last updated: {lastRefreshed.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={loadDeliveryTasks}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
              <p className="mt-4 text-sm font-semibold text-slate-600">Loading delivery tasks...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-lg font-semibold text-red-600">{error}</p>
            <button
              type="button"
              onClick={loadDeliveryTasks}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && deliveryTasks.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">No delivery tasks yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              New delivery requests will appear here automatically.
            </p>
          </div>
        )}

        {/* Delivery Tasks Grid */}
        {!loading && !error && deliveryTasks.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deliveryTasks.map((task) => (
                <button
                  key={task.requestId || task.orderId}
                  type="button"
                  onClick={() => handleTaskClick(task.orderId)}
                  className="group bg-white rounded-xl shadow p-6 text-left transition hover:shadow-lg border border-transparent hover:border-orange-400"
                >
                  {/* Status Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        task.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {task.status || 'UNKNOWN'}
                    </span>
                  </div>

                  {/* Order Info */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500">Order ID</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800">#{task.orderId || '--'}</p>
                  </div>

                  {/* Delivery Info */}
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="truncate">
                        {task.deliveryId || 'Awaiting assignment'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs">{formatTimestamp(task.updatedAt || task.createdAt)}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-gray-800">{formatCurrency(task.price)}</span>
                    </div>
                    <div className="text-sm font-medium text-orange-600 transition group-hover:text-orange-700">
                      View Details →
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {renderPaginationControls()}
          </>
        )}
      </div>
    </div>
  );
}
