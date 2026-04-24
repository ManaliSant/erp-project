import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import { styles } from "../utils/styles";
import {
  signInEmployeeLocal,
  signOutEmployeeLocal,
} from "../features/employees/employeeSlice";
import { selectCurrentUser, selectIsAdmin } from "../features/auth/selectors";
import {
  fetchAttendance,
  signInAttendance,
  signOutAttendance,
} from "../services/attendanceService";

export default function Attendance() {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employees.list);
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);

  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    async function loadAttendance() {
      try {
        setAttendanceLoading(true);
        setAttendanceError("");

        const data = await fetchAttendance();
        if (Array.isArray(data)) {
          setAttendanceRecords(data);
        }
      } catch (error) {
        setAttendanceError("Failed to load attendance from backend. Showing local employee status only.");
      } finally {
        setAttendanceLoading(false);
      }
    }

    loadAttendance();
  }, []);

  async function handleSignIn() {
    try {
      setActionLoading(true);
      setAttendanceError("");

      await signInAttendance({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
      });

      dispatch(signInEmployeeLocal(currentUser.id));
    } catch (error) {
      setAttendanceError("Failed to sign in.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      setActionLoading(true);
      setAttendanceError("");

      await signOutAttendance({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
      });

      dispatch(signOutEmployeeLocal(currentUser.id));
    } catch (error) {
      setAttendanceError("Failed to sign out.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Card title="Attendance">
      <div>
        {attendanceLoading && (
          <p style={{ marginBottom: 12, color: "#555" }}>Loading attendance...</p>
        )}

        {attendanceError && (
          <p style={{ marginBottom: 12, color: "red", fontSize: 12 }}>
            {attendanceError}
          </p>
        )}

        <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
          <button
            onClick={handleSignIn}
            style={styles.primaryButton}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Sign In"}
          </button>
          <button
            onClick={handleSignOut}
            style={styles.secondaryButton}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Sign Out"}
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Current Status</th>
              <th style={styles.th}>Last Sign In</th>
              <th style={styles.th}>Last Sign Out</th>
            </tr>
          </thead>
          <tbody>
            {(isAdmin ? employees : [currentUser]).map((emp) => (
              <tr key={emp.id}>
                <td style={styles.td}>{emp.name}</td>
                <td style={styles.td}>
                  <StatusBadge
                    status={emp.signedIn ? "SignedIn" : "SignedOut"}
                    label={emp.signedIn ? "Signed In" : "Signed Out"}
                  />
                </td>
                <td style={styles.td}>{emp.lastSignIn || "-"}</td>
                <td style={styles.td}>{emp.lastSignOut || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {attendanceRecords.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 12 }}>Backend Attendance Records</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Sign In</th>
                  <th style={styles.th}>Sign Out</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={record.id || index}>
                    <td style={styles.td}>{record.employeeName || "-"}</td>
                    <td style={styles.td}>{record.date || "-"}</td>
                    <td style={styles.td}>{record.signInTime || "-"}</td>
                    <td style={styles.td}>{record.signOutTime || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}