import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
} from "../../services/notificationService";

export default function NotificationBell() {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function loadNotifications() {
    try {
      setLoading(true);

      const notificationData = await fetchNotifications();
      const countData = await fetchUnreadNotificationCount();

      setNotifications(Array.isArray(notificationData) ? notificationData : []);

      if (typeof countData === "number") {
        setUnreadCount(countData);
      } else {
        setUnreadCount(countData?.count || 0);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    const intervalId = setInterval(() => {
      loadNotifications();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleToggleDropdown() {
    const nextOpenState = !open;
    setOpen(nextOpenState);

    if (nextOpenState) {
      await loadNotifications();
    }
  }

  function getRedirectPath(notification) {
    const category = notification.category || notification.type || "";
    const title = notification.title || "";
    const actionType = notification.actionType || notification.relatedEntityId || "";

    if (
      category.toUpperCase() === "APPLICATION" ||
      title.toLowerCase().includes("application") ||
      title.toLowerCase().includes("leave") ||
      title.toLowerCase().includes("reference")
    ) {
      return "/applications";
    }

    if (
      category.toUpperCase() === "PASSWORD" ||
      actionType.toUpperCase().includes("PASSWORD") ||
      title.toLowerCase().includes("password")
    ) {
      return "/profile";
    }

    if (category.toUpperCase() === "ATTENDANCE") {
      return "/attendance";
    }

    return "/dashboard";
  }

  async function handleNotificationClick(notification) {
    try {
      if (!notification.readFlag) {
        await markNotificationAsRead(notification.id);
      }

      await loadNotifications();

      setOpen(false);

      const redirectPath = getRedirectPath(notification);
      navigate(redirectPath);
    } catch (error) {
      console.error("Failed to handle notification click", error);
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleToggleDropdown}
        style={{
          position: "relative",
          border: "1px solid #d1d5db",
          background: "#ffffff",
          borderRadius: 999,
          width: 42,
          height: 42,
          cursor: "pointer",
          fontSize: 20,
        }}
        title="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#dc2626",
              color: "#ffffff",
              borderRadius: 999,
              minWidth: 20,
              height: 20,
              padding: "0 5px",
              fontSize: 11,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 0,
            width: 360,
            maxHeight: 420,
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>Notifications</strong>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {unreadCount} unread
            </span>
          </div>

          {loading && (
            <div style={{ padding: 14, fontSize: 13, color: "#6b7280" }}>
              Loading notifications...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: "#6b7280" }}>
              No notifications yet.
            </div>
          )}

          {!loading &&
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  background: notification.readFlag ? "#ffffff" : "#eff6ff",
                }}
              >
                <div
                  style={{
                    fontWeight: notification.readFlag ? 500 : 700,
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                >
                  {notification.title}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#4b5563",
                    lineHeight: 1.4,
                  }}
                >
                  {notification.message}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    marginTop: 6,
                  }}
                >
                  {notification.createdAt || "-"}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}