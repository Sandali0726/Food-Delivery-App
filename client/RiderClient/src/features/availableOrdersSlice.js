import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAvailableOrders, acceptOrder } from '../api/delivery';

// Async thunk for fetching available orders
export const fetchAvailableOrders = createAsyncThunk(
    'availableOrders/fetchAvailableOrders',
    async (_, { rejectWithValue }) => {
        try {
            const availableOrders = await getAvailableOrders();
            return availableOrders;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch available orders';
            return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
        }
    }
);

// Async thunk for accepting an order
export const acceptAvailableOrder = createAsyncThunk(
    'availableOrders/acceptAvailableOrder',
    async (orderData, { rejectWithValue, getState }) => {
        try {
            console.log('🎯 Accepting order with data:', orderData);
            
            // Get rider email from auth state
            const state = getState();
            const riderEmail = state.auth.rider?.email;
            
            if (!riderEmail) {
                throw new Error('Rider email not found in auth state');
            }
            
            // Extract required parameters from order data
            const { orderId, pickupToDropDistance, pickupToDropTime } = orderData;
            
            if (!orderId) {
                throw new Error('Order ID is required');
            }
            
            // Use calculated distance and time, or fallback values
            const totalDistance = parseFloat(pickupToDropDistance) || 5.0;
            const totalTime = parseFloat(pickupToDropTime) || 20.0;
            
            console.log('📊 Using parameters:', {
                orderId,
                riderEmail,
                totalDistance,
                totalTime
            });
            
            const response = await acceptOrder(orderId, riderEmail, totalDistance, totalTime);
            
            return { orderId, response };
        } catch (error) {
            console.error('❌ Error in acceptAvailableOrder:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to accept order';
            return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
        }
    }
);

const initialState = {
    orders: [],
    isLoading: false,
    error: null,
    acceptOrderLoading: false,
    acceptOrderError: null,
};

const availableOrdersSlice = createSlice({
    name: 'availableOrders',
    initialState,
    reducers: {
        clearAvailableOrders: (state) => {
            state.orders = [];
            state.error = null;
        },
        addAvailableOrder: (state, action) => {
            const newOrder = action.payload;
            // Check if order doesn't already exist
            const exists = state.orders.some(order => order.orderId === newOrder.orderId);
            if (!exists) {
                state.orders.unshift(newOrder); // Add to beginning
            }
        },
        removeAvailableOrder: (state, action) => {
            const orderId = action.payload;
            console.log('🗑️ Redux: Removing available order with ID:', orderId, 'Type:', typeof orderId);
            console.log('🗑️ Redux: Current orders before removal:', state.orders.map(o => ({ id: o.orderId, type: typeof o.orderId })));
            // Handle both string and number types for orderId
            state.orders = state.orders.filter(order => order.orderId != orderId); // Use != for loose comparison
            console.log('🗑️ Redux: Orders after removal:', state.orders.map(o => o.orderId));
        },
        clearError: (state) => {
            state.error = null;
            state.acceptOrderError = null;
        },
        // Clear all data on logout
        clearAllAvailableOrdersData: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch available orders
            .addCase(fetchAvailableOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAvailableOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload;
                state.error = null;
            })
            .addCase(fetchAvailableOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Accept available order
            .addCase(acceptAvailableOrder.pending, (state) => {
                state.acceptOrderLoading = true;
                state.acceptOrderError = null;
            })
            .addCase(acceptAvailableOrder.fulfilled, (state, action) => {
                state.acceptOrderLoading = false;
                const { orderId } = action.payload;
                // Remove the accepted order from available orders
                state.orders = state.orders.filter(order => order.orderId !== orderId);
                state.acceptOrderError = null;
            })
            .addCase(acceptAvailableOrder.rejected, (state, action) => {
                state.acceptOrderLoading = false;
                state.acceptOrderError = action.payload;
            });
    },
});

export const {
    clearAvailableOrders,
    addAvailableOrder,
    removeAvailableOrder,
    clearError,
    clearAllAvailableOrdersData,
} = availableOrdersSlice.actions;

// Selectors
export const selectAvailableOrders = (state) => state.availableOrders.orders;
export const selectAvailableOrdersLoading = (state) => state.availableOrders.isLoading;
export const selectAvailableOrdersError = (state) => state.availableOrders.error;
export const selectAcceptOrderLoading = (state) => state.availableOrders.acceptOrderLoading;
export const selectAcceptOrderError = (state) => state.availableOrders.acceptOrderError;

export default availableOrdersSlice.reducer;