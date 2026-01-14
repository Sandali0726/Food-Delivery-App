import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRiderProfile, getRiderStatus } from "./../../api/profile";

export const loadRider = createAsyncThunk(
  "auth/loadRider",
  async (_, { rejectWithValue }) => {
    try {
      // Get email from localStorage (stored during login)
      const storedEmail = localStorage.getItem('userEmail');
      if (!storedEmail) {
        throw new Error('No stored email found');
      }
      
      // Fetch both profile and status
      const [profileRes, statusRes] = await Promise.all([
        getRiderProfile(storedEmail),
        getRiderStatus(storedEmail)
      ]);
      
      const riderData = profileRes.data;
      const status = statusRes.data;
      
      // Set the actual status from backend
      riderData.status = status.toLowerCase();
      
      return riderData;
    } catch {
      // Clear stored email if profile fetch fails
      localStorage.removeItem('userEmail');
      return rejectWithValue(null);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    rider: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    loginSuccess(state, action) {
      state.rider = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      // Store email in localStorage for persistence
      if (action.payload.email) {
        localStorage.setItem('userEmail', action.payload.email);
      }
    },
    logoutSuccess(state) {
      state.rider = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      // Clear stored email and status on logout
      localStorage.removeItem('userEmail');
      localStorage.removeItem('riderStatus');
    },
    updateRiderStatus(state, action) {
      if (state.rider) {
        state.rider.status = action.payload;
        // Store status in localStorage for persistence
        localStorage.setItem('riderStatus', action.payload);
      }
    },
    clearError(state) {
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadRider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRider.fulfilled, (state, action) => {
        state.rider = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadRider.rejected, (state, action) => {
        state.rider = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload || 'Failed to load rider';
      });
  },
});

export const { loginSuccess, logoutSuccess, updateRiderStatus, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
