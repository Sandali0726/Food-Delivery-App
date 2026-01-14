import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '../features/orderSlice';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import orderBanner from '../assets/orderbanner.jpg';
import backgroundImage from '../assets/background.jpg';

const DEFAULT_PAGE_SIZE = 6;
const emptyOrdersState = {
  orders: [],
  loading: false,
  pagination: { page: 0, size: DEFAULT_PAGE_SIZE, totalPages: 0, totalElements: 0 },
  filters: { status: null },
};
const selectOrdersState = (state) => state.orders ?? emptyOrdersState;
const ORDER_STATUS_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING', requestValue: 'NEW', match: ['PENDING', 'NEW'] },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Ready', value: 'READY' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const resolveStatusForRequest = (statusValue) => {
  if (!statusValue || statusValue === 'ALL') return undefined;
  const tab = ORDER_STATUS_TABS.find((entry) => entry.value === statusValue);
  if (!tab) return statusValue;
  if (tab.requestValue) return tab.requestValue;
  if (Array.isArray(tab.match) && tab.match.length > 0) {
    return tab.match[tab.match.length - 1];
  }
  return tab.value;
};


export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, pagination } = useSelector(selectOrdersState);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = DEFAULT_PAGE_SIZE;

  useEffect(() => {
    const statusParam = resolveStatusForRequest(activeStatus);
    dispatch(getOrders({ status: statusParam, page, size: pageSize }));
  }, [dispatch, activeStatus, page]);

  useEffect(() => {
    const totalPages = pagination?.totalPages ?? 0;
    if (totalPages > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [pagination?.totalPages, page]);

  const selectedTab = ORDER_STATUS_TABS.find((tab) => tab.value === activeStatus) ?? ORDER_STATUS_TABS[0];
  const ordersToRender = Array.isArray(orders) ? orders : [];
  const resolvedTotalElements = typeof pagination?.totalElements === 'number'
    ? pagination.totalElements
    : page * pageSize + ordersToRender.length;
  const resolvedTotalPages = typeof pagination?.totalPages === 'number' && pagination.totalPages > 0
    ? pagination.totalPages
    : (pageSize > 0 ? Math.ceil(resolvedTotalElements / pageSize) : 0);
  const rangeStart = resolvedTotalElements === 0 ? 0 : page * pageSize + 1;
  const rangeEnd = resolvedTotalElements === 0
    ? 0
    : Math.min(page * pageSize + ordersToRender.length, resolvedTotalElements);
  const hasNextPage = resolvedTotalPages ? page < resolvedTotalPages - 1 : ordersToRender.length === pageSize;
  const hasPrevPage = page > 0;

  const handleStatusChange = (value) => {
    setActiveStatus(value);
    setPage(0);
  };

  const handlePageChange = (direction) => {
    if (direction === 'prev' && hasPrevPage) {
      setPage((prev) => Math.max(0, prev - 1));
    }
    if (direction === 'next' && hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <img
            src={orderBanner}
            alt="Orders banner"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 space-y-3">
            <span
              className="text-white text-3xl sm:text-4xl tracking-[0.4em]"
              style={{ fontFamily: 'Impact, sans-serif', fontWeight: '400' }}
            >
              ORDER BOARD
            </span>
            <p
              className="text-white text-base sm:text-lg tracking-[0.3em] uppercase"
              style={{ fontFamily: 'sans-serif', fontWeight: '400' }}
            >
              Stay ahead of every ticket
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow mt-8 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">All Orders</h1>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
              {ORDER_STATUS_TABS.map((tab) => {
                const isActive = activeStatus === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleStatusChange(tab.value)}
                    className={`${
                      isActive
                        ? 'bg-orange-600 text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } px-4 py-2 rounded-full text-sm font-medium transition`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 h-px w-full bg-gray-100" />
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
            </div>
          ) : (
            <>
            <div className="space-y-3">
              {ordersToRender.length > 0 ? ordersToRender.map((order) => (
                <div
                  key={order.orderId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate(`/orders/${order.orderId}`)}
                  title="View order details"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div>
                      <p className="font-semibold text-gray-800">Order ID# {order.orderId}</p>
                      <p className="text-sm text-gray-600">
                        {order.customerId ? order.customerId : 'N/A'} 
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'READY' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                    
                  </div>
                </div>
              )) : (
                <div className="text-gray-500 text-center py-8">
                  {activeStatus === 'ALL' ? 'No orders found.' : 'No orders found for this status.'}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {rangeStart}-{rangeEnd} of {resolvedTotalElements} orders
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {/* <p className="text-sm text-gray-600">Rows per page: {DEFAULT_PAGE_SIZE}</p> */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange('prev')}
                    disabled={!hasPrevPage || loading}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition ${
                      hasPrevPage && !loading
                        ? 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600'
                        : 'border-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {resolvedTotalPages > 0 ? page + 1 : (ordersToRender.length > 0 ? page + 1 : 0)}
                    {resolvedTotalPages > 0 && ` of ${resolvedTotalPages}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange('next')}
                    disabled={!hasNextPage || loading}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition ${
                      hasNextPage && !loading
                        ? 'border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600'
                        : 'border-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
