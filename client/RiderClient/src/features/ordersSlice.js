import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDeliveryTasks, getDeliveredHistory, updateDeliveryStatus, enhanceDeliveryWithMockData } from '../api/delivery';

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const mergeOrderData = (base, incoming) => {
    if (!base) return incoming;
    if (!incoming) return base;

    const merged = { ...base };

    Object.entries(incoming).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        if (isPlainObject(value) && isPlainObject(base[key])) {
            merged[key] = mergeOrderData(base[key], value);
        } else {
            merged[key] = value;
        }
    });

    return merged;
};

// Async thunk for fetching delivery tasks
export const fetchDeliveryTasks = createAsyncThunk(
    'orders/fetchDeliveryTasks',
    async (email, { rejectWithValue }) => {
        try {
            const enhancedOrders = await getDeliveryTasks(email);
            return enhancedOrders;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch delivery tasks';
            return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
        }
    }
);

// Async thunk for fetching delivery history with pagination and optional filters
export const fetchDeliveryHistory = createAsyncThunk(
    'orders/fetchDeliveryHistory',
    async ({ email, page = 0, size = 10, orderId = null, date = null }, { rejectWithValue }) => {
        try {
            const historyOrders = await getDeliveredHistory(email, page, size, orderId, date);
            return historyOrders;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch delivery history';
            return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
        }
    }
);

// Async thunk for updating order status
export const updateOrderStatus = createAsyncThunk(
    'orders/updateOrderStatus',
    async ({ orderId, status, currentOrder }, { rejectWithValue, getState, dispatch }) => {
        try {
            const response = await updateDeliveryStatus(orderId, status);
            const state = getState();

            // Merge API response with any existing cached data to avoid losing enriched fields
            const existingOrder = state.orders.orders.find(order => order.orderId === orderId)
                || state.orders.deliveryHistory.find(order => order.orderId === orderId)
                || state.orders.activeOrder
                || null;
            const baseOrder = existingOrder || currentOrder || null;
            const mergedOrder = baseOrder ? mergeOrderData(baseOrder, response) : response;

            // Enhance with derived fields for UI consumption
            const enhancedOrder = await enhanceDeliveryWithMockData(mergedOrder);
            
            // If status is DELIVERED, remove from active orders and refresh history
            if (status === 'DELIVERED') {
                const riderEmail = state.auth.rider?.email;
                if (riderEmail) {
                    // Refresh history from the beginning to include the new delivery
                    dispatch(fetchDeliveryHistory({ 
                        email: riderEmail, 
                        page: 0, 
                        size: state.orders.historyPagination.pageSize 
                    }));
                }
            }
            
            return { enhancedOrder, status };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to update order status';
            return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
        }
    }
);

const initialState = {
    orders: [],
    deliveryHistory: [],
    activeOrder: null,
    isLoading: false,
    historyLoading: false,
    error: null,
    historyError: null,
    statusUpdateLoading: false,
    selectedOrderForMap: null,
    mapType: null, // 'pickup' or 'delivery'
    // Pagination state for delivery history
    historyPagination: {
        currentPage: 0,
        pageSize: 5,
        hasMore: true,
        totalItems: 0
    },
    // Filter state for delivery history
    historyFilters: {
        orderId: null,
        date: null
    }
};

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrders: (state) => {
            state.orders = [];
            state.activeOrder = null;
            state.error = null;
        },
        clearHistory: (state) => {
            state.deliveryHistory = [];
            state.historyError = null;
            state.historyPagination = {
                currentPage: 0,
                pageSize: 5,
                hasMore: true,
                totalItems: 0
            };
            state.historyFilters = {
                orderId: null,
                date: null
            };
        },
        // Pagination actions
        setHistoryPage: (state, action) => {
            state.historyPagination.currentPage = action.payload;
        },
        resetHistoryPagination: (state) => {
            state.historyPagination.currentPage = 0;
            state.historyPagination.hasMore = true;
        },
        // Filter actions
        setHistoryFilters: (state, action) => {
            state.historyFilters = {
                ...state.historyFilters,
                ...action.payload
            };
            // Reset pagination when filters change
            state.historyPagination.currentPage = 0;
            state.historyPagination.hasMore = true;
        },
        clearHistoryFilters: (state) => {
            state.historyFilters = {
                orderId: null,
                date: null
            };
            // Reset pagination when filters are cleared
            state.historyPagination.currentPage = 0;
            state.historyPagination.hasMore = true;
        },
        // Clear all data on logout
        clearAllOrdersData: (state) => {
            return initialState;
        },
        removeCompletedOrder: (state, action) => {
            const orderId = action.payload;
            // Remove from active orders
            state.orders = state.orders.filter(order => order.orderId !== orderId);
            // Clear active order if it's the completed one
            if (state.activeOrder?.orderId === orderId) {
                state.activeOrder = state.orders.length > 0 ? state.orders[0] : null;
            }
        },
        setActiveOrder: (state, action) => {
            const payload = action.payload;
            if (!payload) {
                state.activeOrder = null;
                return;
            }

            const index = state.orders.findIndex(order => order.orderId === payload.orderId);
            const historyIndex = state.deliveryHistory.findIndex(order => order.orderId === payload.orderId);
            const existingOrder = index !== -1 ? state.orders[index]
                : historyIndex !== -1 ? state.deliveryHistory[historyIndex]
                : state.activeOrder;

            const mergedOrder = existingOrder ? mergeOrderData(existingOrder, payload) : payload;

            if (index !== -1) {
                state.orders[index] = mergedOrder;
            }
            if (historyIndex !== -1) {
                state.deliveryHistory[historyIndex] = mergedOrder;
            }

            state.activeOrder = mergedOrder;
        },
        clearActiveOrder: (state) => {
            state.activeOrder = null;
        },
        setSelectedOrderForMap: (state, action) => {
            state.selectedOrderForMap = action.payload.order;
            state.mapType = action.payload.mapType;
        },
        clearSelectedOrderForMap: (state) => {
            state.selectedOrderForMap = null;
            state.mapType = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Optimistically update order status in the list
        updateOrderInList: (state, action) => {
            const { orderId, updatedOrder } = action.payload;
            const index = state.orders.findIndex(order => order.orderId === orderId);
            if (index !== -1) {
                state.orders[index] = updatedOrder;
            }
            // Update active order if it's the same order
            if (state.activeOrder?.orderId === orderId) {
                state.activeOrder = updatedOrder;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch delivery tasks
            .addCase(fetchDeliveryTasks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDeliveryTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload;
                state.error = null;
                
                // Set the first order as active if no active order is set
                if (action.payload.length > 0 && !state.activeOrder) {
                    state.activeOrder = action.payload[0];
                }
            })
            .addCase(fetchDeliveryTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Update order status
            .addCase(updateOrderStatus.pending, (state) => {
                state.statusUpdateLoading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.statusUpdateLoading = false;
                const { enhancedOrder, status } = action.payload;
                
                // If status is DELIVERED, remove from active orders
                if (status === 'DELIVERED') {
                    state.orders = state.orders.filter(order => order.orderId !== enhancedOrder.orderId);
                    // Clear active order if it's the completed one
                    if (state.activeOrder?.orderId === enhancedOrder.orderId) {
                        state.activeOrder = state.orders.length > 0 ? state.orders[0] : null;
                    }
                } else {
                    // Update the order in the orders list for other statuses
                    const index = state.orders.findIndex(order => order.orderId === enhancedOrder.orderId);
                    if (index !== -1) {
                        state.orders[index] = enhancedOrder;
                    }
                    
                    // Update active order if it's the same order
                    if (state.activeOrder?.orderId === enhancedOrder.orderId) {
                        state.activeOrder = enhancedOrder;
                    }
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.statusUpdateLoading = false;
                state.error = action.payload;
            })
            
            // Fetch delivery history
            .addCase(fetchDeliveryHistory.pending, (state) => {
                state.historyLoading = true;
                state.historyError = null;
            })
            .addCase(fetchDeliveryHistory.fulfilled, (state, action) => {
                state.historyLoading = false;
                const { email, page, size, orderId, date } = action.meta.arg;
                const responseData = action.payload;
                
                // Always treat as array
                const newData = Array.isArray(responseData) ? responseData : [];
                
                // Always replace the entire history with current page data
                // This ensures each page shows exactly 5 items
                state.deliveryHistory = newData;
                state.historyPagination.currentPage = page;
                
                // Update pagination info
                // If we got less data than requested, we've reached the end
                state.historyPagination.hasMore = newData.length === size;
                state.historyPagination.pageSize = size;
                state.historyError = null;
            })
            .addCase(fetchDeliveryHistory.rejected, (state, action) => {
                state.historyLoading = false;
                state.historyError = action.payload;
            });
    },
});

export const {
    clearOrders,
    clearHistory,
    removeCompletedOrder,
    setActiveOrder,
    clearActiveOrder,
    setSelectedOrderForMap,
    clearSelectedOrderForMap,
    clearError,
    updateOrderInList,
    setHistoryPage,
    resetHistoryPagination,
    clearAllOrdersData,
    setHistoryFilters,
    clearHistoryFilters,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectDeliveryHistory = (state) => state.orders.deliveryHistory;
export const selectActiveOrder = (state) => state.orders.activeOrder;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectHistoryLoading = (state) => state.orders.historyLoading;
export const selectOrdersError = (state) => state.orders.error;
export const selectHistoryError = (state) => state.orders.historyError;
export const selectStatusUpdateLoading = (state) => state.orders.statusUpdateLoading;
export const selectSelectedOrderForMap = (state) => state.orders.selectedOrderForMap;
export const selectMapType = (state) => state.orders.mapType;

// Helper selectors
export const selectOrdersByStatus = (state, status) => 
    state.orders.orders.filter(order => order.status === status);

export const selectActiveOrderCount = (state) => 
    state.orders.orders.filter(order => 
        ['ACCEPTED', 'GO_TO_PICKUP', 'PICKED_UP', 'ON_THE_WAY'].includes(order.status)
    ).length;

export const selectOrderById = (state, orderId) => {
    // First search in active orders
    const activeOrder = state.orders.orders.find(order => order.orderId === orderId);
    if (activeOrder) return activeOrder;

    // Then search in delivery history
    const historyOrder = state.orders.deliveryHistory.find(order => order.orderId === orderId);
    return historyOrder || null;
};

// Pagination selectors
export const selectHistoryPagination = (state) => state.orders.historyPagination;
export const selectCanLoadMoreHistory = (state) => 
    state.orders.historyPagination.hasMore && !state.orders.historyLoading;

// Filter selectors
export const selectHistoryFilters = (state) => state.orders.historyFilters;
export const selectHasActiveFilters = (state) => 
    state.orders.historyFilters.orderId !== null || state.orders.historyFilters.date !== null;

export default ordersSlice.reducer;