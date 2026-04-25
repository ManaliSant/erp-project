import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PageLayout from "../components/layout/PageLayout";
import Dashboard from "../pages/Dashboard";
import EmployeeProfile from "../pages/EmployeeProfile";
import Applications from "../pages/Applications";
import Attendance from "../pages/Attendance";
import Employees from "../pages/Employees";
import Login from "../pages/Login";

import ProtectedRoute from "./ProtectedRoute";

import { setEmployees } from "../features/employees/employeeSlice";
import { fetchEmployees } from "../services/employeeService";

import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsAuthenticated,
} from "../features/auth/selectors";

function AppShell() {
  const dispatch = useDispatch();

  const employees = useSelector((state) => state.employees.list);
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);

  const [employeeLoadError, setEmployeeLoadError] = useState("");
  const [employeeLoading, setEmployeeLoading] = useState(false);

  useEffect(() => {
    async function loadEmployees() {
      try {
        setEmployeeLoading(true);
        setEmployeeLoadError("");

        const data = await fetchEmployees();

        if (Array.isArray(data)) {
          dispatch(setEmployees(data));
        }
      } catch (error) {
        setEmployeeLoadError("Failed to load employees from backend.");
      } finally {
        setEmployeeLoading(false);
      }
    }

    loadEmployees();
  }, [dispatch]);

  return (
    <PageLayout
      currentUser={currentUser}
      isAdmin={isAdmin}
      employees={employees}
    >
      {employeeLoading && (
        <p style={{ marginBottom: 12, color: "#555" }}>
          Loading employees...
        </p>
      )}

      {employeeLoadError && (
        <p style={{ marginBottom: 12, color: "red", fontSize: 12 }}>
          {employeeLoadError}
        </p>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<EmployeeProfile />} />

        <Route path="/applications" element={<Applications />} />

        <Route path="/attendance" element={<Attendance />} />

        <Route
          path="/employees"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </PageLayout>
  );
}

export default function AppRouter() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}