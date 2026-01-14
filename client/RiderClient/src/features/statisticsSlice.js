import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRiderStatistics } from '../api/profile';

// Async thunk for fetching rider statistics
export const fetchRiderStatistics = createAsyncThunk(
    'statistics/fetchRiderStatistics',
    async (email, { rejectWithValue }) => {
        try {
            const response = await getRiderStatistics(email);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch statistics'
            );
        }
    }
);

const statisticsSlice = createSlice({
    name: 'statistics',
    initialState: {
        data: null,
        isLoading: false,
        error: null,
        lastFetched: null,
    },
    reducers: {
        clearStatistics: (state) => {
            state.data = null;
            state.isLoading = false;
            state.error = null;
            state.lastFetched = null;
        },
        clearStatisticsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRiderStatistics.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRiderStatistics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
                state.error = null;
                state.lastFetched = new Date().toISOString();
            })
            .addCase(fetchRiderStatistics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

// Actions
export const { clearStatistics, clearStatisticsError } = statisticsSlice.actions;

// Selectors
export const selectStatistics = (state) => state.statistics.data;
export const selectStatisticsLoading = (state) => state.statistics.isLoading;
export const selectStatisticsError = (state) => state.statistics.error;
export const selectStatisticsLastFetched = (state) => state.statistics.lastFetched;

// Derived selectors
export const selectTotalEarnings = (state) => state.statistics.data?.totalEarnings || 0;
export const selectTotalDeliveries = (state) => state.statistics.data?.totalDeliveries || 0;
export const selectAverageEarningsPerDelivery = (state) => state.statistics.data?.averageEarningsPerDelivery || 0;
export const selectCompletionRate = (state) => state.statistics.data?.completionRate || 0;
export const selectTodayEarnings = (state) => state.statistics.data?.totalEarningsToday || 0;
export const selectTodayDeliveries = (state) => state.statistics.data?.totalDeliveriesToday || 0;
export const selectWeeklyEarnings = (state) => state.statistics.data?.totalEarningsThisWeek || 0;
export const selectWeeklyDeliveries = (state) => state.statistics.data?.totalDeliveriesThisWeek || 0;

export default statisticsSlice.reducer;