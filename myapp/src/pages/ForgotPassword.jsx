import React, { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../services/authService";
import { styles } from "../utils/styles";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await forgotPassword({
        email: email.trim().toLowerCase(),
      });

      setMessage(response.message || "Reset link generated. Check backend console.");
    } catch (err) {
      setError("Failed to request password reset.");
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
      <div style={{ ...styles.card, width: 420 }}>
        <h2 style={{ marginBottom: 10 }}>Forgot Password</h2>

        <p style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
          Enter your email. In development mode, the reset link will be printed
          in the Spring Boot backend console.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              value={email}
              placeholder="employee@company.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p style={{ color: "red", fontSize: 12 }}>{error}</p>}
          {message && <p style={{ color: "green", fontSize: 12 }}>{message}</p>}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? "Generating..." : "Generate Reset Link"}
          </button>

          <div style={{ marginTop: 12, fontSize: 13 }}>
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}