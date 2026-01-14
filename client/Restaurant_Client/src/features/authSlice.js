import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    loading: true,
  },
  reducers: {
    setInitialized(state, action) {
      state.loading = false;
      // Only set authenticated if explicitly passed as true
      if (action.payload === true) {
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
    },
    loginSuccess(state) {
      state.isAuthenticated = true;
      state.loading = false;
    },
    logoutSuccess(state) {
      state.isAuthenticated = false;
      state.loading = false;
    },
  },

});

export const { setInitialized, loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
