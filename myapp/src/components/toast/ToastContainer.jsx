import React from "react";
import { useToast } from "./ToastContext";

function getToastStyle(type) {
  const base = {
    padding: "12px 14px",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    minWidth: 260,
    cursor: "pointer",
  };

  if (type === "success") {
    return { ...base, background: "#047857" };
  }

  if (type === "error") {
    return { ...base, background: "#b91c1c" };
  }

  if (type === "warning") {
    return { ...base, background: "#b45309" };
  }

  return { ...base, background: "#111827" };
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={getToastStyle(toast.type)}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}