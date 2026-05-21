import React from "react";
import AppRouter from "./routes/AppRouter";
import { ToastProvider } from "./components/toast/ToastContext";
import ToastContainer from "./components/toast/ToastContainer";

export default function App() {
  return (
    <ToastProvider>
      <AppRouter />
      <ToastContainer />
    </ToastProvider>
  );
}