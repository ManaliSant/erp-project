import { createSlice } from "@reduxjs/toolkit";
import { getCurrentDateTime } from "../../utils/helpers";

const initialState = {
  list: [],
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.list = action.payload;
    },

    updateEmployeeLocal: (state, action) => {
      const updatedEmployee = action.payload;
      const index = state.list.findIndex((e) => e.id === updatedEmployee.id);

      if (index !== -1) {
        state.list[index] = updatedEmployee;
      }
    },

    signInEmployeeLocal: (state, action) => {
      const emp = state.list.find((e) => e.id === action.payload);

      if (emp) {
        emp.signedIn = true;
        emp.lastSignIn = getCurrentDateTime();
      }
    },

    signOutEmployeeLocal: (state, action) => {
      const emp = state.list.find((e) => e.id === action.payload);

      if (emp) {
        emp.signedIn = false;
        emp.lastSignOut = getCurrentDateTime();
      }
    },

    reduceEmployeeLeaves: (state, action) => {
      const { employeeId, days } = action.payload;
      const emp = state.list.find((e) => e.id === employeeId);

      if (emp) {
        emp.leavesRemaining = Math.max(0, emp.leavesRemaining - days);
      }
    },
  },
});

export const {
  setEmployees,
  updateEmployeeLocal,
  signInEmployeeLocal,
  signOutEmployeeLocal,
  reduceEmployeeLeaves,
} = employeeSlice.actions;

export default employeeSlice.reducer;