import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { styles } from "../../utils/styles";

export default function Topbar({ currentUser }) {
  const dispatch = useDispatch();

  return (
    <div style={styles.topbar}>
      <div>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>HR Planning ERP</div>
        <div style={{ color: "#666" }}>
          Leave, resignation, employee profile, hierarchy, attendance and approvals
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#999" }}>Logged in as</div>
          <div style={{ fontWeight: "bold" }}>
            {currentUser?.name || "Unknown User"} {currentUser?.role ? `- ${currentUser.role}` : ""}
          </div>
        </div>

        <button onClick={() => dispatch(logout())} style={styles.secondaryButton}>
          Logout
        </button>
      </div>
    </div>
  );
}