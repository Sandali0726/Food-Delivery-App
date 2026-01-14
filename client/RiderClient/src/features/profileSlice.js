import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRiderProfile } from '../api/profile';

// Async thunk for fetching profile data
export const fetchRiderProfile = createAsyncThunk(
    'profile/fetchRiderProfile',
    async (email, { rejectWithValue }) => {
        try {
            const response = await getRiderProfile(email);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

const initialState = {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        updateProfile: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        clearProfile: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRiderProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRiderProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(fetchRiderProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setLoading,
    setUser,
    setError,
    updateProfile,
    clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;