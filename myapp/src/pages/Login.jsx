import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { loginSuccess } from "../features/auth/authSlice";
import { loginUser } from "../services/authService";
import { styles } from "../utils/styles";
import { useToast } from "../components/toast/ToastContext";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      showToast("Email and password are required.", "warning");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      dispatch(loginSuccess(data));
      showToast("Login successful.", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast("Login failed. Check credentials or account status.", "error");
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
      <div style={{ ...styles.card, width: 400 }}>
        <h2 style={{ marginBottom: 16 }}>Login</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <div style={{ marginTop: 12, fontSize: 13 }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}