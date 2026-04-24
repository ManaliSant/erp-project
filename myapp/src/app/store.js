import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import employeeReducer from "../features/employees/employeeSlice";
import applicationReducer from "../features/applications/applicationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    applications: applicationReducer,
  },
});