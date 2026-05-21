import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { resetPasswordWithToken } from "../services/authService";
import { styles } from "../utils/styles";
import { useToast } from "../components/toast/ToastContext";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const tokenFromUrl = searchParams.get("token") || "";

  const [form, setForm] = useState({
    token: tokenFromUrl,
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.token.trim()) {
      showToast("Reset token is required.", "warning");
      return;
    }

    if (!form.newPassword.trim()) {
      showToast("New password is required.", "warning");
      return;
    }

    if (form.newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      showToast("Passwords do not match.", "warning");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPasswordWithToken({
        token: form.token.trim(),
        newPassword: form.newPassword,
      });

      showToast(response.message || "Password reset successfully.", "success");

      setForm({
        token: form.token,
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showToast(
        "Failed to reset password. Token may be invalid or expired.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ ...styles.card, width: 440 }}>
        <h2 style={{ marginBottom: 10 }}>Reset Password</h2>

        <p style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
          Enter a new password using the reset token from your reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Reset Token</label>
            <input
              style={{
                ...styles.input,
                background: tokenFromUrl ? "#f3f4f6" : "#ffffff",
              }}
              value={form.token}
              readOnly={Boolean(tokenFromUrl)}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              style={styles.input}
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              style={styles.input}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
          </div>

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div style={{ marginTop: 12, fontSize: 13 }}>
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}