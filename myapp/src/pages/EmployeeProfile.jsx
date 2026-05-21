import React, { useState } from "react";
import { useSelector } from "react-redux";

import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import { styles } from "../utils/styles";
import { useToast } from "../components/toast/ToastContext";

import { selectCurrentUser } from "../features/auth/selectors";
import { changeOwnPassword } from "../services/employeeService";

export default function EmployeeProfile() {
  const currentUser = useSelector(selectCurrentUser);
  const { showToast } = useToast();

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  function updatePasswordField(field, value) {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    if (!passwordForm.oldPassword.trim()) {
      showToast("Old password is required.", "warning");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      showToast("New password is required.", "warning");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "warning");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New password and confirm password do not match.", "warning");
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

      showToast("Password changed successfully.", "success");
    } catch (err) {
      showToast("Failed to change password. Check your old password.", "error");
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