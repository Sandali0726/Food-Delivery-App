import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import ordersReducer from "./features/orderSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
  },
});

export default store;
