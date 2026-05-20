import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { styles } from "../../utils/styles";
import { fetchAnnouncements } from "../../services/announcementService";

function linkStyle(isActive) {
  return {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    marginBottom: 8,
    background: isActive ? "#111827" : "#ffffff",
    color: isActive ? "#ffffff" : "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    boxSizing: "border-box",
  };
}

export default function Sidebar({ currentUser }) {
  const role = currentUser?.role?.toUpperCase() || "EMPLOYEE";
  const isAdmin = role === "ADMIN";

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    fetchAnnouncements()
      .then((list) => setUnreadCount(list.filter((a) => !a.read).length))
      .catch(() => {});
  }, [currentUser]);

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>HR ERP</div>

      <div style={styles.userBox}>
        <div style={{ fontWeight: "bold" }}>
          {currentUser?.name || "Unknown User"}
        </div>

        <div style={{ fontSize: 13, color: "#555" }}>{role}</div>
      </div>

      <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>
        Dashboard
      </NavLink>

      <NavLink to="/profile" style={({ isActive }) => linkStyle(isActive)}>
        Employee Profile
      </NavLink>

      <NavLink to="/applications" style={({ isActive }) => linkStyle(isActive)}>
        Applications
      </NavLink>

      <NavLink to="/attendance" style={({ isActive }) => linkStyle(isActive)}>
        Attendance
      </NavLink>

      <NavLink
        to="/announcements"
        style={({ isActive }) => linkStyle(isActive)}
      >
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Announcements
          {unreadCount > 0 && (
            <span
              style={{
                background: "#dc3545",
                color: "#fff",
                borderRadius: 10,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: "bold",
              }}
            >
              {unreadCount}
            </span>
          )}
        </span>
      </NavLink>

      {isAdmin && (
        <>
          <NavLink to="/employees" style={({ isActive }) => linkStyle(isActive)}>
            Employees
          </NavLink>

          <NavLink to="/audit" style={({ isActive }) => linkStyle(isActive)}>
            Audit Logs
          </NavLink>
        </>
      )}
    </div>
  );
}