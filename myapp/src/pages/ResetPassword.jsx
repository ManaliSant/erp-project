import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { resetPasswordWithToken } from "../services/authService";
import { styles } from "../utils/styles";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const tokenFromUrl = searchParams.get("token") || "";

  const [form, setForm] = useState({
    token: tokenFromUrl,
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.token.trim()) {
      setError("Reset token is required.");
      setMessage("");
      return;
    }

    if (!form.newPassword.trim()) {
      setError("New password is required.");
      setMessage("");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setMessage("");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await resetPasswordWithToken({
        token: form.token.trim(),
        newPassword: form.newPassword,
      });

      setMessage(response.message || "Password reset successfully.");
      setForm({
        token: form.token,
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError("Failed to reset password. Token may be invalid or expired.");
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

          {error && <p style={{ color: "red", fontSize: 12 }}>{error}</p>}
          {message && <p style={{ color: "green", fontSize: 12 }}>{message}</p>}

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