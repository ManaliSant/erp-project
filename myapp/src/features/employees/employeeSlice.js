import { createSlice } from "@reduxjs/toolkit";
import { getCurrentDateTime } from "../../utils/helpers";

const initialState = {
  list: [
    {
      id: 1,
      employeeCode: "HR001",
      name: "Aisha Thomas",
      email: "aisha@company.com",
      role: "admin",
      department: "Human Resources",
      designation: "HR Manager",
      manager: "Director HR",
      joinDate: "2021-06-15",
      leavesRemaining: 14,
      signedIn: false,
      lastSignIn: "",
      lastSignOut: "",
      status: "Active",
    },
    {
      id: 2,
      employeeCode: "EMP101",
      name: "Rahul Menon",
      email: "rahul@company.com",
      role: "employee",
      department: "Engineering",
      designation: "Software Engineer",
      manager: "Priya Nair",
      joinDate: "2023-01-10",
      leavesRemaining: 9,
      signedIn: false,
      lastSignIn: "",
      lastSignOut: "",
      status: "Active",
    },
    {
      id: 3,
      employeeCode: "EMP102",
      name: "Meera Nair",
      email: "meera@company.com",
      role: "employee",
      department: "Operations",
      designation: "Operations Executive",
      manager: "Anand Verma",
      joinDate: "2024-02-05",
      leavesRemaining: 11,
      signedIn: false,
      lastSignIn: "",
      lastSignOut: "",
      status: "Active",
    },
  ],
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.list = action.payload;
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
  signInEmployeeLocal,
  signOutEmployeeLocal,
  reduceEmployeeLeaves,
} = employeeSlice.actions;

export default employeeSlice.reducer;