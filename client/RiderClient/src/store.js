import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import profileReducer from "./features/profileSlice";
import ordersReducer from "./features/ordersSlice";
import availableOrdersReducer from "./features/availableOrdersSlice";
import statisticsReducer from "./features/statisticsSlice";

// Combine all reducers
const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  orders: ordersReducer,
  availableOrders: availableOrdersReducer,
  statistics: statisticsReducer,
});

// Root reducer that resets state on logout
const rootReducer = (state, action) => {
  // Clear all state when logout action is dispatched
  if (action.type === 'auth/logoutSuccess') {
    // Reset state to undefined, which will cause each reducer to return its initial state
    state = undefined;
  }
  
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
});

export default store;
