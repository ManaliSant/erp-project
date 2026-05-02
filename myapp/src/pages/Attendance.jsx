import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from "../components/common/Card";
import StatusBadge from "../components/common/StatusBadge";
import { styles } from "../utils/styles";

import { restoreSession } from "../features/auth/authSlice";

import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsManager,
} from "../features/auth/selectors";

import { fetchMyProfile } from "../services/employeeService";

import {
  signIn,
  signOut,
  fetchMyAttendance,
  fetchTeamAttendance,
  fetchAllAttendance,
} from "../services/attendanceService";

export default function Attendance() {
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const isManager = useSelector(selectIsManager);

  const [myAttendance, setMyAttendance] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSignedIn = currentUser?.signedIn === true;

  async function refreshCurrentUser() {
    const user = await fetchMyProfile();
    dispatch(restoreSession(user));
  }

  async function loadAttendance() {
    try {
      setLoading(true);
      setError("");

      const myData = await fetchMyAttendance();
      setMyAttendance(Array.isArray(myData) ? myData : []);

      if (isManager) {
        const teamData = await fetchTeamAttendance();
        setTeamAttendance(Array.isArray(teamData) ? teamData : []);
      }

      if (isAdmin) {
        const allData = await fetchAllAttendance();
        setAllAttendance(Array.isArray(allData) ? allData : []);
      }
    } catch (err) {
      setError("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshEverything() {
    await refreshCurrentUser();
    await loadAttendance();
  }

  useEffect(() => {
    loadAttendance();
  }, [isAdmin, isManager]);

  async function handleSignIn() {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await signIn();
      await refreshEverything();

      setSuccess("Signed in successfully.");
    } catch (err) {
      setError("Sign in failed. You may already be signed in today.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await signOut();
      await refreshEverything();

      setSuccess("Signed out successfully.");
    } catch (err) {
      setError("Sign out failed. You may need to sign in first or already signed out.");
    } finally {
      setActionLoading(false);
    }
  }

  function renderAttendanceTable(records) {
    if (!records || records.length === 0) {
      return <p style={{ color: "#666" }}>No attendance records found.</p>;
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Manager</th>
              <th style={styles.th}>Sign In</th>
              <th style={styles.th}>Sign Out</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td style={styles.td}>{record.attendanceDate}</td>
                <td style={styles.td}>{record.employeeName}</td>
                <td style={styles.td}>{record.employeeEmail}</td>
                <td style={styles.td}>{record.role}</td>
                <td style={styles.td}>{record.department}</td>
                <td style={styles.td}>{record.manager}</td>
                <td style={styles.td}>{record.signInTime || "-"}</td>
                <td style={styles.td}>{record.signOutTime || "-"}</td>
                <td style={styles.td}>
                  <StatusBadge status={record.status || "-"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card title="Attendance">
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

      <Card title="My Attendance">
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px 0" }}>
            <strong>{currentUser.name}</strong>
          </p>

          <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
            {currentUser.role} · {currentUser.department || "No department"}
          </p>

          <p style={{ marginTop: 8, fontSize: 13 }}>
            Current Status:{" "}
            <strong>{isSignedIn ? "SIGNED IN" : "SIGNED OUT"}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button
            type="button"
            style={styles.successButton}
            disabled={actionLoading || isSignedIn}
            onClick={handleSignIn}
          >
            {actionLoading ? "Processing..." : "Sign In"}
          </button>

          <button
            type="button"
            style={styles.dangerButton}
            disabled={actionLoading || !isSignedIn}
            onClick={handleSignOut}
          >
            {actionLoading ? "Processing..." : "Sign Out"}
          </button>
        </div>

        {loading ? (
          <p>Loading attendance...</p>
        ) : (
          renderAttendanceTable(myAttendance)
        )}
      </Card>

      {isManager && (
        <Card title="Team Attendance">
          {loading ? (
            <p>Loading team attendance...</p>
          ) : (
            renderAttendanceTable(teamAttendance)
          )}
        </Card>
      )}

      {isAdmin && (
        <Card title="All Attendance">
          {loading ? (
            <p>Loading all attendance...</p>
          ) : (
            renderAttendanceTable(allAttendance)
          )}
        </Card>
      )}
    </div>
  );
}