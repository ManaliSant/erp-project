import React, { useState } from "react";
import { useSelector } from "react-redux";

import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import { styles } from "../utils/styles";

import { selectCurrentUser } from "../features/auth/selectors";
import { changeOwnPassword } from "../services/employeeService";

export default function EmployeeProfile() {
  const currentUser = useSelector(selectCurrentUser);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updatePasswordField(field, value) {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!passwordForm.oldPassword.trim()) {
      setError("Old password is required.");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      setError("New password is required.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      await changeOwnPassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password changed successfully.");
    } catch (err) {
      setError("Failed to change password. Check your old password.");
    } finally {
      setChangingPassword(false);
    }
  }

  if (!currentUser) {
    return (
      <Card title="Profile">
        <p>Loading user...</p>
      </Card>
    );
  }

  return (
    <div>
      {error && (
        <p style={{ marginBottom: 12, color: "red", fontSize: 13 }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{ marginBottom: 12, color: "green", fontSize: 13 }}>
          {success}
        </p>
      )}

      <Card title="Employee Profile">
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Name</label>
            <div style={styles.input}>{currentUser.name}</div>
          </div>

          <div>
            <label style={styles.label}>Email</label>
            <div style={styles.input}>{currentUser.email}</div>
          </div>

          <div>
            <label style={styles.label}>Role</label>
            <div style={styles.input}>{currentUser.role}</div>
          </div>

          <div>
            <label style={styles.label}>Department</label>
            <div style={styles.input}>{currentUser.department || "-"}</div>
          </div>

          <div>
            <label style={styles.label}>Designation</label>
            <div style={styles.input}>{currentUser.designation || "-"}</div>
          </div>

          <div>
            <label style={styles.label}>Manager</label>
            <div style={styles.input}>{currentUser.manager || "-"}</div>
          </div>

          <div>
            <label style={styles.label}>Leaves Remaining</label>
            <div style={styles.input}>{currentUser.leavesRemaining ?? "-"}</div>
          </div>

          <div>
            <label style={styles.label}>Status</label>
            <div style={styles.input}>
              <StatusBadge status={currentUser.status || "Active"} />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Change Password">
        <form onSubmit={handleChangePassword}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Old Password</label>
              <input
                type="password"
                style={styles.input}
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  updatePasswordField("oldPassword", e.target.value)
                }
              />
            </div>

            <div>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                style={styles.input}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  updatePasswordField("newPassword", e.target.value)
                }
              />
            </div>

            <div>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                style={styles.input}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  updatePasswordField("confirmPassword", e.target.value)
                }
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ ...styles.primaryButton, marginTop: 16 }}
            disabled={changingPassword}
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </Card>
    </div>
  );
}