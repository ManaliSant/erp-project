import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/selectors";

export default function ProtectedRoute({ isAllowed = true, children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}