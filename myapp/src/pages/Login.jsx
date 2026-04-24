import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../features/auth/authSlice";
import { loginUser } from "../services/authService";
import { styles } from "../utils/styles";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(form);

      dispatch(loginSuccess(data));
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Check credentials or backend.");
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

          {error && <p style={{ color: "red", fontSize: 12 }}>{error}</p>}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}