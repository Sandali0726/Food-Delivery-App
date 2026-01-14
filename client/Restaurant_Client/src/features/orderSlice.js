import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  fetchOrderItems,
  createOrderItem,
  deleteOrderItem
} from '../api/orderApi';

// Orders
export const getOrders = createAsyncThunk('orders/getOrders', async (params = {}) => {
  const { status, page = 0, size = 6 } = params || {};
  const res = await fetchOrders({ status, page, size });
  return {
    data: res.data,
    request: { status: status ?? null, page, size },
  };
});

export const getOrderById = createAsyncThunk('orders/getOrderById', async (id) => {
  const res = await fetchOrderById(id);
  return res.data;
});

export const addOrder = createAsyncThunk('orders/addOrder', async (data) => {
  const res = await createOrder(data);
  return res.data;
});

export const changeOrderStatus = createAsyncThunk('orders/changeOrderStatus', async ({ id, status }) => {
  const res = await updateOrderStatus(id, status);
  return res.data;
});

export const removeOrder = createAsyncThunk('orders/removeOrder', async (id) => {
  await deleteOrder(id);
  return id;
});

// Order Items
export const getOrderItems = createAsyncThunk('orderItems/getOrderItems', async (orderId) => {
  const res = await fetchOrderItems(orderId);
  return res.data;
});

export const addOrderItem = createAsyncThunk('orderItems/addOrderItem', async (data) => {
  const res = await createOrderItem(data);
  return res.data;
});

export const removeOrderItem = createAsyncThunk('orderItems/removeOrderItem', async (id) => {
  await deleteOrderItem(id);
  return id;
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    order: null,
    orderItems: [],
    loading: false,
    error: null,
    pagination: {
      page: 0,
      size: 6,
      totalPages: 0,
      totalElements: 0,
    },
    filters: {
      status: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Orders
      .addCase(getOrders.pending, (state) => { state.loading = true; })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        const pageData = action.payload?.data ?? [];
        const isPagedObject = pageData && typeof pageData === 'object' && Array.isArray(pageData.content);
        const content = isPagedObject
          ? pageData.content
          : Array.isArray(pageData)
            ? pageData
            : [];
        state.orders = content;

        const fallbackSize = action.payload?.request?.size ?? state.pagination.size ?? 6;
        const resolvedSize = typeof pageData?.size === 'number' ? pageData.size : fallbackSize;
        const resolvedPage = typeof pageData?.number === 'number'
          ? pageData.number
          : action.payload?.request?.page ?? state.pagination.page ?? 0;
        const resolvedTotalElements = typeof pageData?.totalElements === 'number'
          ? pageData.totalElements
          : (Array.isArray(pageData) ? pageData.length : content.length);
        const computedTotalPages = resolvedSize > 0
          ? Math.ceil(resolvedTotalElements / resolvedSize)
          : 0;
        const resolvedTotalPages = typeof pageData?.totalPages === 'number'
          ? pageData.totalPages
          : computedTotalPages;

        state.pagination = {
          page: resolvedPage,
          size: resolvedSize,
          totalPages: resolvedTotalPages,
          totalElements: resolvedTotalElements,
        };
        state.filters.status = action.payload?.request?.status ?? null;
        state.error = null;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.order = action.payload;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload);
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o.orderId === action.payload.orderId);
        if (idx !== -1) state.orders[idx] = action.payload;
        if (state.order && state.order.orderId === action.payload.orderId) state.order = action.payload;
      })
      .addCase(removeOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o.orderId !== action.payload);
      })
      // Order Items
      .addCase(getOrderItems.fulfilled, (state, action) => {
        state.orderItems = action.payload;
      })
      .addCase(addOrderItem.fulfilled, (state, action) => {
        state.orderItems.push(action.payload);
      })
      .addCase(removeOrderItem.fulfilled, (state, action) => {
        state.orderItems = state.orderItems.filter(i => i.orderItemId !== action.payload);
      });
  },
});

export default orderSlice.reducer;
